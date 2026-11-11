import 'server-only';
import {
  funnelPatchSchema,
  slugSchema,
  summarizePatch,
  tryApplyPatch,
  validateFunnel,
} from '@funnel/schema';
import type { Funnel, FunnelDefinition, ValidationIssue } from '@funnel/schema';
import { z } from 'zod';
import { appUrl } from '../capabilities';
import type { FunnelDraft } from '../funnel-repository';
import { loadPlans } from '../payments/plans';
import type { StudioContext } from '../repository';
import { checkDefinition } from '../validate-definition';
import { ServiceError } from './errors';

export const MAX_LISTED_LEADS = 100;

const funnelId = z.string().min(1).max(100).describe('Funnel id from list_funnels.');
const revision = z
  .number()
  .int()
  .positive()
  .describe(
    'Draft revision you last read (get_funnel). A stale value fails with revision_conflict.',
  );

export const funnelRefSchema = z.object({ funnelId });

export const validateInputSchema = z.object({
  funnelId,
  mode: z
    .enum(['save', 'publish'])
    .default('publish')
    .describe('publish reports everything that blocks publishing as errors; save is more lenient.'),
});

export const applyPatchInputSchema = z.object({
  funnelId,
  expectedRevision: revision,
  ops: funnelPatchSchema,
  dryRun: z
    .boolean()
    .default(false)
    .describe('When true, check and validate the patch without saving it.'),
});

export const createFunnelInputSchema = z.object({
  name: z.string().trim().min(1).max(200).describe('Funnel name shown in the studio.'),
  slug: slugSchema.describe(
    'Public URL part: 3-60 lowercase letters, digits or dashes. The funnel is served at /f/<slug>.',
  ),
});

export const publishInputSchema = z.object({ funnelId, expectedRevision: revision });

export const rollbackInputSchema = z.object({
  funnelId,
  versionId: z.string().min(1).max(200).describe('Version id from list_versions.'),
});

export const leadsInputSchema = z.object({
  funnelId,
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_LISTED_LEADS)
    .default(50)
    .describe('Newest leads first, at most 100.'),
});

export interface FunnelSummary {
  id: string;
  name: string;
  slug: string;
  status: Funnel['status'];
  groupId: string | null;
  draftRevision: number;
  publishedVersionId: string | null;
  url: string | null;
}

function summary(funnel: Funnel): FunnelSummary {
  const origin = appUrl();
  return {
    id: funnel.id,
    name: funnel.name,
    slug: funnel.slug,
    status: funnel.status,
    groupId: funnel.groupId,
    draftRevision: funnel.draftRevision,
    publishedVersionId: funnel.publishedVersionId,
    url: origin && funnel.publishedVersionId ? `${origin}/f/${funnel.slug}` : null,
  };
}

function knownPlanKeys(): string[] | undefined {
  const catalogue = loadPlans();
  return catalogue.ok ? Object.keys(catalogue.plans) : undefined;
}

async function requireDraft(ctx: StudioContext, id: string): Promise<FunnelDraft> {
  const draft = await ctx.repo.getDraft(id);
  if (!draft) throw new ServiceError('not_found', 'Funnel not found.');
  return draft;
}

async function requireFunnel(ctx: StudioContext, id: string): Promise<Funnel> {
  const funnel = await ctx.repo.getFunnel(id);
  if (!funnel) throw new ServiceError('not_found', 'Funnel not found.');
  return funnel;
}

export async function listFunnels(ctx: StudioContext): Promise<FunnelSummary[]> {
  return (await ctx.repo.listFunnels()).map(summary);
}

export async function getFunnelDraft(
  ctx: StudioContext,
  input: z.infer<typeof funnelRefSchema>,
): Promise<{ funnel: FunnelSummary; revision: number; definition: FunnelDefinition }> {
  const [funnel, draft] = await Promise.all([
    requireFunnel(ctx, input.funnelId),
    requireDraft(ctx, input.funnelId),
  ]);
  return { funnel: summary(funnel), revision: draft.revision, definition: draft.definition };
}

export async function validateDraft(
  ctx: StudioContext,
  input: z.infer<typeof validateInputSchema>,
): Promise<{ revision: number; ok: boolean; issues: ValidationIssue[] }> {
  const draft = await requireDraft(ctx, input.funnelId);
  const result = validateFunnel(draft.definition, {
    mode: input.mode,
    planKeys: knownPlanKeys(),
  });
  return { revision: draft.revision, ok: result.ok, issues: result.issues };
}

export async function applyFunnelPatch(
  ctx: StudioContext,
  input: z.infer<typeof applyPatchInputSchema>,
): Promise<{ saved: boolean; revision: number; summary: string[]; warnings: ValidationIssue[] }> {
  const draft = await requireDraft(ctx, input.funnelId);
  if (draft.revision !== input.expectedRevision) {
    throw new ServiceError('revision_conflict', 'The draft was changed elsewhere. Read it again.', {
      currentRevision: draft.revision,
    });
  }
  const patched = tryApplyPatch(draft.definition, input.ops);
  if (!patched.ok) {
    throw new ServiceError('patch_invalid', 'The patch references something that does not exist.', {
      issues: patched.issues,
    });
  }
  const check = checkDefinition(patched.definition);
  if (!check.ok) {
    throw new ServiceError('validation_failed', 'The patched funnel is invalid.', {
      issues: check.issues,
    });
  }
  const lines = summarizePatch(draft.definition, input.ops);
  if (input.dryRun) {
    return { saved: false, revision: draft.revision, summary: lines, warnings: check.warnings };
  }
  const saved = await ctx.repo.saveDraft(input.funnelId, check.definition, input.expectedRevision);
  return { saved: true, revision: saved.revision, summary: lines, warnings: check.warnings };
}

export async function createFunnel(
  ctx: StudioContext,
  input: z.infer<typeof createFunnelInputSchema> & { groupId?: string | null },
): Promise<Funnel> {
  return ctx.repo.createFunnel(input.name, input.slug, input.groupId ?? null);
}

export async function publishFunnel(
  ctx: StudioContext,
  input: z.infer<typeof publishInputSchema>,
): Promise<{ version: { id: string; version: number; createdAt: string }; funnel: Funnel }> {
  const version = await ctx.repo.publish(input.funnelId, input.expectedRevision, knownPlanKeys());
  const funnel = await requireFunnel(ctx, input.funnelId);
  return {
    version: { id: version.id, version: version.version, createdAt: version.createdAt },
    funnel,
  };
}

export async function rollbackFunnel(
  ctx: StudioContext,
  input: z.infer<typeof rollbackInputSchema>,
): Promise<Funnel> {
  return ctx.repo.rollback(input.funnelId, input.versionId);
}

export async function listVersions(
  ctx: StudioContext,
  input: z.infer<typeof funnelRefSchema>,
): Promise<{
  liveVersionId: string | null;
  versions: { id: string; version: number; createdAt: string }[];
}> {
  const [funnel, versions] = await Promise.all([
    requireFunnel(ctx, input.funnelId),
    ctx.repo.listVersionSummaries(input.funnelId),
  ]);
  return {
    liveVersionId: funnel.publishedVersionId,
    versions: versions.map((v) => ({ id: v.id, version: v.version, createdAt: v.createdAt })),
  };
}

export async function listLeads(
  ctx: StudioContext,
  input: { funnelId: string; limit: number | null },
): Promise<{
  funnel: Funnel;
  leads: Awaited<ReturnType<StudioContext['leads']['listFunnelLeads']>>;
}> {
  const funnel = await requireFunnel(ctx, input.funnelId);
  const leads = await ctx.leads.listFunnelLeads(funnel.projectId, funnel.id, input.limit);
  return { funnel, leads };
}
