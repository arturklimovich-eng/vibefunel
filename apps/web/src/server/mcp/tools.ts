import 'server-only';
import { z } from 'zod';
import type { AgentContext } from '../agent-auth';
import type { ApiTokenScope } from '../api-tokens/tokens';
import { getCapabilities } from '../capabilities';
import type { Capabilities } from '../capabilities';
import {
  applyFunnelPatch,
  applyPatchInputSchema,
  createFunnel,
  createFunnelInputSchema,
  funnelRefSchema,
  getFunnelDraft,
  leadsInputSchema,
  listFunnels,
  listLeads,
  listVersions,
  publishFunnel,
  publishInputSchema,
  rollbackFunnel,
  rollbackInputSchema,
  validateDraft,
  validateInputSchema,
} from '../services/funnels';

export interface McpTool<S extends z.ZodObject = z.ZodObject> {
  name: string;
  title: string;
  description: string;
  scope: ApiTokenScope;
  readOnly: boolean;
  input: S;
  available?: (caps: Capabilities) => boolean;
  run: (agent: AgentContext, input: z.output<S>) => Promise<unknown>;
}

function tool<S extends z.ZodObject>(definition: McpTool<S>): McpTool {
  return definition as unknown as McpTool;
}

const empty = z.object({});

export const MCP_TOOLS: McpTool[] = [
  tool({
    name: 'get_capabilities',
    title: 'Deployment capabilities',
    description:
      'What this deployment supports: storage mode, payment provider and plan keys, AI features, analytics, custom domains, schemaVersion and apiVersion. Call it first.',
    scope: 'read',
    readOnly: true,
    input: empty,
    run: async () => getCapabilities(),
  }),
  tool({
    name: 'list_funnels',
    title: 'List funnels',
    description:
      'Funnels the token owner can access, with draft revision, publish state and public URL.',
    scope: 'read',
    readOnly: true,
    input: empty,
    run: async (agent) => ({ funnels: await listFunnels(agent.studio) }),
  }),
  tool({
    name: 'get_funnel',
    title: 'Read a funnel draft',
    description:
      'The draft definition (screens, edges, theme) and its revision. Pass the revision to apply_patch or publish_funnel.',
    scope: 'read',
    readOnly: true,
    input: funnelRefSchema,
    run: (agent, input) => getFunnelDraft(agent.studio, input),
  }),
  tool({
    name: 'validate_funnel',
    title: 'Validate a funnel draft',
    description:
      'Validation issues of the current draft, each with code, severity, message and the screen or edge it concerns.',
    scope: 'read',
    readOnly: true,
    input: validateInputSchema,
    run: (agent, input) => validateDraft(agent.studio, input),
  }),
  tool({
    name: 'apply_patch',
    title: 'Edit a funnel draft',
    description:
      'Apply patch operations to the draft in order, validate the result and save it as a new revision. All or nothing: on any issue nothing is saved. Use dryRun to check first.',
    scope: 'write',
    readOnly: false,
    input: applyPatchInputSchema,
    run: (agent, input) => applyFunnelPatch(agent.studio, input),
  }),
  tool({
    name: 'create_funnel',
    title: 'Create a funnel',
    description: 'Create a funnel with a starter draft. Returns its id and first revision.',
    scope: 'write',
    readOnly: false,
    input: createFunnelInputSchema,
    run: async (agent, input) => ({ funnel: await createFunnel(agent.studio, input) }),
  }),
  tool({
    name: 'publish_funnel',
    title: 'Publish a funnel',
    description:
      'Publish the draft at the given revision as a new live version. Fails with validation_failed and issues when the draft has errors.',
    scope: 'publish',
    readOnly: false,
    input: publishInputSchema,
    run: (agent, input) => publishFunnel(agent.studio, input),
  }),
  tool({
    name: 'rollback_funnel',
    title: 'Roll back a funnel',
    description: 'Make an earlier published version live again.',
    scope: 'publish',
    readOnly: false,
    input: rollbackInputSchema,
    run: async (agent, input) => ({ funnel: await rollbackFunnel(agent.studio, input) }),
  }),
  tool({
    name: 'list_versions',
    title: 'List published versions',
    description: 'Published versions of a funnel, newest first, and which one is live.',
    scope: 'read',
    readOnly: true,
    input: funnelRefSchema,
    run: (agent, input) => listVersions(agent.studio, input),
  }),
  tool({
    name: 'get_leads',
    title: 'Read leads',
    description:
      'Emails captured by a funnel, newest first, with consent and the screen they came from.',
    scope: 'leads',
    readOnly: true,
    input: leadsInputSchema,
    run: async (agent, input) => {
      const { leads } = await listLeads(agent.studio, input);
      return {
        leads: leads.map((l) => ({
          email: l.email,
          consent: l.consent,
          screenId: l.screenId,
          createdAt: l.createdAt,
        })),
      };
    },
  }),
];

export function visibleTools(agent: AgentContext, caps: Capabilities): McpTool[] {
  return MCP_TOOLS.filter(
    (t) => agent.scopes.includes(t.scope) && (t.available ? t.available(caps) : true),
  );
}

const schemaCache = new Map<string, Record<string, unknown>>();

export function inputJsonSchema(t: McpTool): Record<string, unknown> {
  const hit = schemaCache.get(t.name);
  if (hit) return hit;
  const schema = z.toJSONSchema(t.input, { io: 'input', unrepresentable: 'any' }) as Record<
    string,
    unknown
  >;
  delete schema.$schema;
  schemaCache.set(t.name, schema);
  return schema;
}
