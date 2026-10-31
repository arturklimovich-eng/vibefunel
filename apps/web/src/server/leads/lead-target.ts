import 'server-only';
import { emailBlocksOf } from '@/lib/email';
import type { PublishedReader } from '../funnel-repository';

export type LeadTarget =
  | { ok: true; funnelId: string; projectId: string; version: number; consentLabel: string }
  | { ok: false; status: 404; error: string };

export async function resolveLeadTarget(
  reader: PublishedReader,
  input: { slug: string; screenId: string; blockId: string },
): Promise<LeadTarget> {
  const published = await reader.getPublishedBySlug(input.slug);
  if (!published) return { ok: false, status: 404, error: 'funnel_not_found' };
  const screen = published.definition.screens.find((s) => s.id === input.screenId);
  if (!screen) return { ok: false, status: 404, error: 'screen_not_found' };
  const block = emailBlocksOf(screen).find((b) => b.blockId === input.blockId);
  if (!block || block.props === null) return { ok: false, status: 404, error: 'block_not_found' };
  return {
    ok: true,
    funnelId: published.funnelId,
    projectId: published.projectId,
    version: published.version,
    consentLabel: block.props.consentLabel.trim(),
  };
}
