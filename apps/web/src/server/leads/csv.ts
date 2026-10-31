import type { FunnelLead } from './store';

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

const HEADER = [
  'created_at',
  'email',
  'consent',
  'consent_text',
  'screen_id',
  'block_id',
  'run_id',
];

// Spreadsheet apps evaluate cells that start with a formula character, so those get a leading quote.
export function csvCell(value: string): string {
  const safe = FORMULA_PREFIX.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function leadsToCsv(leads: FunnelLead[]): string {
  const rows = leads.map((lead) => [
    lead.createdAt,
    lead.email,
    lead.consent ? 'true' : 'false',
    lead.consentText ?? '',
    lead.screenId,
    lead.blockId,
    lead.runId,
  ]);
  return [HEADER, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
