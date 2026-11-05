import { SLUG_PATTERN } from '@funnel/schema';

export const FUNNELS_ROUTE = '/api/funnels';

export const FUNNEL_GROUPS_ROUTE = '/api/funnel-groups';

export const AI_ROUTES = {
  briefOutline: '/api/ai/brief/outline',
  briefGenerate: '/api/ai/brief/generate',
  briefCancel: '/api/ai/brief/cancel',
  inline: '/api/ai/inline',
  images: '/api/ai/images',
  chat: '/api/ai/chat',
  assets: '/api/assets',
} as const;

export function funnelGroupRoute(id: string): string {
  return FUNNEL_GROUPS_ROUTE + '/' + encodeURIComponent(id);
}

export const SLUG_MAX_LENGTH = 60;

export const SLUG_INPUT_PATTERN = SLUG_PATTERN.source.replace(/-\]/g, '\\-]');

export interface FunnelRoutes {
  base: string;
  draft: string;
  publish: string;
  rollback: string;
  versions: string;
  domains: string;
  leads: string;
  leadsCsv: string;
  domain: (domainId: string) => string;
  verifyDomain: (domainId: string) => string;
}

export function funnelRoutes(id: string): FunnelRoutes {
  const base = `${FUNNELS_ROUTE}/${encodeURIComponent(id)}`;
  return {
    base,
    draft: `${base}/draft`,
    publish: `${base}/publish`,
    rollback: `${base}/rollback`,
    versions: `${base}/versions`,
    domains: `${base}/domains`,
    leads: `${base}/leads`,
    leadsCsv: `${base}/leads?format=csv`,
    domain: (domainId) => `${base}/domains/${encodeURIComponent(domainId)}`,
    verifyDomain: (domainId) => `${base}/domains/${encodeURIComponent(domainId)}/verify`,
  };
}

export function readJson(res: Response): Promise<unknown> {
  return res.json().catch(() => null);
}
