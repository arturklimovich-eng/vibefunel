import 'server-only';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import type {
  AdjustmentResult,
  PaymentStore,
  StaleDeferred,
  RecordResult,
  StatusDetail,
  StatusQuery,
} from './store';
import { paymentReasonSchema } from './types';
import type { PaymentAdjustment, PaymentEvent } from './types';

const statusSchema = z.enum(['pending', 'succeeded', 'failed']);

const recordSchema = z.object({
  provider: z.enum(['stripe', 'solidgate', 'mock']),
  providerRef: z.string(),
  runId: z.string(),
  projectId: z.string(),
  funnelId: z.string().nullable(),
  screenId: z.string(),
  planKey: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: statusSchema,
  reason: paymentReasonSchema.nullable(),
  payerHash: z.string().nullable().default(null),
  amountRefunded: z.number().int().min(0).default(0),
  disputeStatus: z.string().nullable().default(null),
  disputeEventAt: z.string().nullable().default(null),
  providerPaymentId: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const deferredSchema = z.object({
  provider: z.enum(['stripe', 'solidgate', 'mock']),
  eventId: z.string(),
  providerPaymentId: z.string().nullable(),
  runId: z.string(),
  screenId: z.string(),
  payerHash: z.string().nullable(),
  amountRefunded: z.number().int().min(0).nullable(),
  disputeStatus: z.string().nullable(),
  occurredAt: z.string(),
  firstSeenAt: z.string().default(() => new Date().toISOString()),
});

type Deferred = z.infer<typeof deferredSchema>;

const fileSchema = z.object({
  events: z.array(z.string()),
  payments: z.array(recordSchema),
  deferred: z.array(deferredSchema).default([]),
});

type PaymentFile = z.infer<typeof fileSchema>;
type PaymentRecord = z.infer<typeof recordSchema>;

function matchesTarget(
  p: PaymentRecord,
  item: Pick<Deferred, 'provider' | 'providerPaymentId' | 'runId' | 'screenId' | 'payerHash'>,
  byPayer: boolean,
): boolean {
  if (p.provider !== item.provider) return false;
  if (!byPayer)
    return item.providerPaymentId !== null && p.providerPaymentId === item.providerPaymentId;
  return (
    item.payerHash !== null &&
    p.providerPaymentId === null &&
    p.payerHash === item.payerHash &&
    p.runId === item.runId &&
    p.screenId === item.screenId &&
    p.status === 'succeeded'
  );
}

function findAdjustmentTarget(
  data: PaymentFile,
  adjustment: PaymentAdjustment,
): number | undefined {
  const rows = data.payments
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p.updatedAt.localeCompare(a.p.updatedAt));
  const byPayment = rows.find(({ p }) => matchesTarget(p, adjustment, false));
  if (byPayment) return byPayment.i;
  return rows.find(({ p }) => matchesTarget(p, adjustment, true))?.i;
}

const TERMINAL_DISPUTE_STATUSES = new Set([
  'won',
  'lost',
  'warning_closed',
  'charge_refunded',
  'prevented',
]);

function applyAdjustment(
  data: PaymentFile,
  index: number,
  item: Pick<Deferred, 'provider' | 'eventId' | 'amountRefunded' | 'disputeStatus' | 'occurredAt'>,
): boolean {
  const key = `${item.provider}:${item.eventId}`;
  const current = data.payments[index];
  if (!current || data.events.includes(key)) return false;
  const newerDispute =
    item.disputeStatus !== null &&
    (current.disputeEventAt === null ||
      item.occurredAt > current.disputeEventAt ||
      (item.occurredAt === current.disputeEventAt &&
        !TERMINAL_DISPUTE_STATUSES.has(current.disputeStatus ?? '')));
  data.payments[index] = {
    ...current,
    amountRefunded: Math.max(current.amountRefunded, item.amountRefunded ?? 0),
    disputeStatus: newerDispute ? item.disputeStatus : current.disputeStatus,
    disputeEventAt: newerDispute ? item.occurredAt : current.disputeEventAt,
    updatedAt: new Date().toISOString(),
  };
  data.events.push(key);
  return true;
}

function applyDeferred(data: PaymentFile, index: number): void {
  const payment = data.payments[index];
  if (!payment) return;
  const due = data.deferred
    .filter((d) => matchesTarget(payment, d, false) || matchesTarget(payment, d, true))
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  for (const item of due) applyAdjustment(data, index, item);
  const done = new Set(due.map((d) => `${d.provider}:${d.eventId}`));
  data.deferred = data.deferred.filter((d) => !done.has(`${d.provider}:${d.eventId}`));
}

function isNotFound(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

function eventKey(event: PaymentEvent): string {
  return `${event.provider}:${event.eventId}`;
}

export class FilePaymentStore implements PaymentStore {
  private readonly file: string;
  private readonly dir: string;
  private readonly funnelProjectId: (funnelId: string) => Promise<string | null>;
  private chain: Promise<unknown> = Promise.resolve();

  constructor(dataDir: string, funnelProjectId: (funnelId: string) => Promise<string | null>) {
    this.dir = dataDir;
    this.file = path.join(dataDir, 'payments.json');
    this.funnelProjectId = funnelProjectId;
  }

  private withLock<T>(task: () => Promise<T>): Promise<T> {
    const run = this.chain.then(task, task);
    this.chain = run.catch(() => null);
    return run;
  }

  private async read(): Promise<PaymentFile> {
    try {
      const text = await readFile(this.file, 'utf8');
      return fileSchema.parse(JSON.parse(text));
    } catch (error) {
      if (isNotFound(error)) return { events: [], payments: [], deferred: [] };
      throw error;
    }
  }

  private async write(data: PaymentFile): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    const temp = `${this.file}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify(data, null, 2), 'utf8');
    await rename(temp, this.file);
  }

  recordEvent(event: PaymentEvent): Promise<RecordResult> {
    return this.withLock(async () => {
      const data = await this.read();
      const key = eventKey(event);
      if (data.events.includes(key)) return { duplicate: true, rejected: null };
      const now = new Date().toISOString();
      const index = data.payments.findIndex(
        (p) => p.provider === event.provider && p.providerRef === event.providerRef,
      );
      const existing = index >= 0 ? data.payments[index] : undefined;
      if (!existing) {
        data.payments.push({
          provider: event.provider,
          providerRef: event.providerRef,
          runId: event.runId,
          projectId: event.projectId,
          funnelId: event.funnelId,
          screenId: event.screenId,
          planKey: event.planKey,
          amount: event.amount,
          currency: event.currency,
          status: event.status,
          reason: event.reason,
          payerHash: event.payerHash,
          amountRefunded: 0,
          disputeStatus: null,
          disputeEventAt: null,
          providerPaymentId: event.providerPaymentId,
          createdAt: now,
          updatedAt: now,
        });
      } else if (existing.status === 'pending' && event.status !== 'pending') {
        data.payments[index] = {
          ...existing,
          amount: event.amount,
          currency: event.currency,
          status: event.status,
          reason: event.reason,
          payerHash: existing.payerHash ?? event.payerHash,
          providerPaymentId: existing.providerPaymentId ?? event.providerPaymentId,
          updatedAt: now,
        };
      } else if (existing.providerPaymentId === null && event.providerPaymentId !== null) {
        data.payments[index] = {
          ...existing,
          payerHash: existing.payerHash ?? event.payerHash,
          providerPaymentId: event.providerPaymentId,
          updatedAt: now,
        };
      }
      data.events.push(key);
      const recordedIndex = data.payments.findIndex(
        (p) => p.provider === event.provider && p.providerRef === event.providerRef,
      );
      if (recordedIndex >= 0) applyDeferred(data, recordedIndex);
      await this.write(data);
      return { duplicate: false, rejected: null };
    });
  }

  recordAdjustment(adjustment: PaymentAdjustment): Promise<AdjustmentResult> {
    return this.withLock(async () => {
      const data = await this.read();
      const key = `${adjustment.provider}:${adjustment.eventId}`;
      if (data.events.includes(key)) return 'duplicate';
      const index = findAdjustmentTarget(data, adjustment);
      if (index === undefined) {
        if (data.deferred.some((d) => `${d.provider}:${d.eventId}` === key)) return 'duplicate';
        data.deferred.push({
          provider: adjustment.provider,
          eventId: adjustment.eventId,
          providerPaymentId: adjustment.providerPaymentId,
          runId: adjustment.runId,
          screenId: adjustment.screenId,
          payerHash: adjustment.payerHash,
          amountRefunded: adjustment.amountRefunded,
          disputeStatus: adjustment.disputeStatus,
          occurredAt: adjustment.occurredAt,
          firstSeenAt: new Date().toISOString(),
        });
        await this.write(data);
        return 'deferred';
      }
      data.deferred = data.deferred.filter((d) => `${d.provider}:${d.eventId}` !== key);
      const applied = applyAdjustment(data, index, adjustment);
      await this.write(data);
      return applied ? 'recorded' : 'duplicate';
    });
  }

  countSucceeded(runId: string, screenId: string): Promise<number> {
    return this.withLock(
      async () =>
        (await this.read()).payments.filter(
          (p) => p.runId === runId && p.screenId === screenId && p.status === 'succeeded',
        ).length,
    );
  }

  listStaleDeferred(
    seenBefore: Date,
    limit: number,
  ): Promise<{ total: number; items: StaleDeferred[] }> {
    return this.withLock(async () => {
      const cutoff = seenBefore.toISOString();
      const stale = (await this.read()).deferred
        .filter((d) => d.firstSeenAt < cutoff)
        .sort((a, b) => a.firstSeenAt.localeCompare(b.firstSeenAt));
      return {
        total: stale.length,
        items: stale
          .slice(0, limit)
          .map((d) => ({ provider: d.provider, eventId: d.eventId, firstSeenAt: d.firstSeenAt })),
      };
    });
  }

  getStatus(query: StatusQuery): Promise<StatusDetail> {
    return this.withLock(async () => {
      const data = await this.read();
      const rows = data.payments.filter(
        (p) =>
          p.runId === query.runId &&
          p.screenId === query.screenId &&
          p.payerHash !== null &&
          query.payers.includes(p.payerHash) &&
          (query.ref === undefined ||
            (p.provider === query.provider && p.providerRef === query.ref)),
      );
      const succeeded = rows.find((p) => p.status === 'succeeded');
      if (succeeded) return { status: 'succeeded', reason: succeeded.reason, found: true };
      if (rows.some((p) => p.status === 'pending')) {
        return { status: 'pending', reason: null, found: true };
      }
      const latest = rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      if (!latest) return { status: 'pending', reason: null, found: false };
      return { status: latest.status, reason: latest.reason, found: true };
    });
  }

  hasActivePayment(runId: string, screenId: string): Promise<boolean> {
    return this.withLock(async () => {
      const data = await this.read();
      return data.payments.some(
        (p) =>
          p.runId === runId &&
          p.screenId === screenId &&
          (p.status === 'succeeded' || p.status === 'pending'),
      );
    });
  }

  getFunnelProjectId(funnelId: string): Promise<string | null> {
    return this.funnelProjectId(funnelId);
  }
}
