import type {
  PaymentAdjustment,
  PaymentEvent,
  PaymentReason,
  PaymentRevocation,
  PaymentStatus,
  ProviderId,
} from './types';

export interface FunnelPayment {
  provider: ProviderId;
  providerRef: string;
  screenId: string;
  planKey: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reason: PaymentReason | null;
  amountRefunded: number;
  disputeStatus: string | null;
  revoked: PaymentRevocation | null;
  createdAt: string;
}

export type AdjustmentResult = 'recorded' | 'duplicate' | 'deferred';

export interface StaleDeferred {
  provider: ProviderId;
  eventId: string;
  firstSeenAt: string;
}

export type RecordRejection = 'invalid_project_id';

export interface RecordResult {
  duplicate: boolean;
  rejected: RecordRejection | null;
}

export interface StatusQuery {
  runId: string;
  screenId: string;
  payers: string[];
  provider?: ProviderId;
  ref?: string;
}

export interface StatusDetail {
  status: PaymentStatus;
  reason: PaymentReason | null;
  found: boolean;
  revoked: PaymentRevocation | null;
}

export interface PaymentStore {
  recordEvent(event: PaymentEvent): Promise<RecordResult>;
  recordAdjustment(adjustment: PaymentAdjustment): Promise<AdjustmentResult>;
  countSucceeded(runId: string, screenId: string): Promise<number>;
  listStaleDeferred(
    seenBefore: Date,
    limit: number,
  ): Promise<{ total: number; items: StaleDeferred[] }>;
  getStatus(query: StatusQuery): Promise<StatusDetail>;
  hasActivePayment(runId: string, screenId: string): Promise<boolean>;
  getFunnelProjectId(funnelId: string): Promise<string | null>;
  listFunnelPayments(projectId: string, funnelId: string, limit: number): Promise<FunnelPayment[]>;
}
