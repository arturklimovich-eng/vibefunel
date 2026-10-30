import { z } from 'zod';

export const MAX_DOMAINS_PER_FUNNEL = 5;

export const domainStatusSchema = z.enum(['pending', 'verified']);
export type DomainStatus = z.infer<typeof domainStatusSchema>;

export const routingStatusSchema = z.enum(['ok', 'missing', 'unknown']);
export type RoutingStatus = z.infer<typeof routingStatusSchema>;

export const domainViewSchema = z.object({
  id: z.string(),
  funnelId: z.string(),
  hostname: z.string(),
  status: domainStatusSchema,
  verifiedAt: z.string().nullable(),
  lastCheckedAt: z.string().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.string(),
  txtName: z.string(),
  txtValue: z.string(),
});
export type DomainView = z.infer<typeof domainViewSchema>;

export const domainInstructionsSchema = z.object({
  cnameTarget: z.string().nullable(),
  aRecordIp: z.string().nullable(),
});
export type DomainInstructions = z.infer<typeof domainInstructionsSchema>;

export const domainsResponseSchema = z.object({
  domains: z.array(domainViewSchema),
  instructions: domainInstructionsSchema,
});
export type DomainsResponse = z.infer<typeof domainsResponseSchema>;

export const domainCheckResponseSchema = z.object({
  domain: domainViewSchema,
  ownership: z.boolean().nullable(),
  routing: routingStatusSchema,
  message: z.string().nullable(),
});
export type DomainCheckResponse = z.infer<typeof domainCheckResponseSchema>;

export function txtRecordName(hostname: string): string {
  return `_funnel-verify.${hostname}`;
}

export function txtRecordValue(token: string): string {
  return `funnel-verify=${token}`;
}
