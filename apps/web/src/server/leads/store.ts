export interface LeadInput {
  projectId: string;
  funnelId: string;
  version: number;
  runId: string;
  screenId: string;
  blockId: string;
  email: string;
  consent: boolean;
  consentText: string | null;
}

export interface FunnelLead {
  email: string;
  consent: boolean;
  consentText: string | null;
  screenId: string;
  blockId: string;
  runId: string;
  createdAt: string;
}

export interface LeadStore {
  recordLead(lead: LeadInput): Promise<{ duplicate: boolean }>;
  listFunnelLeads(
    projectId: string,
    funnelId: string,
    limit: number | null,
    since?: string,
  ): Promise<FunnelLead[]>;
}
