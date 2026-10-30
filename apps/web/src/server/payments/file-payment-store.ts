import 'server-only';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import type { PaymentStore, RecordResult, StatusDetail, StatusQuery } from './store';
import { paymentReasonSchema } from './types';
import type { PaymentEvent } from './types';

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
  createdAt: z.string(),
  updatedAt: z.string(),
});

const fileSchema = z.object({
  events: z.array(z.string()),
  payments: z.array(recordSchema),
});

type PaymentFile = z.infer<typeof fileSchema>;

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
      if (isNotFound(error)) return { events: [], payments: [] };
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
          updatedAt: now,
        };
      }
      data.events.push(key);
      await this.write(data);
      return { duplicate: false, rejected: null };
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
