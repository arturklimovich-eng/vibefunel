export const LEADS_ROUTE = '/api/leads';

export interface LeadSubmission {
  slug: string;
  runId: string;
  screenId: string;
  blockId: string;
  email: string;
  consent: boolean;
}

function warn(lead: LeadSubmission, reason: string): void {
  console.warn(`Lead for screen "${lead.screenId}" was not saved: ${reason}`);
}

export function sendLead(lead: LeadSubmission): void {
  fetch(LEADS_ROUTE, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(lead),
    keepalive: true,
  })
    .then((res) => {
      if (!res.ok) warn(lead, `HTTP ${res.status}`);
    })
    .catch((error: unknown) => {
      warn(lead, error instanceof Error ? error.message : 'network error');
    });
}
