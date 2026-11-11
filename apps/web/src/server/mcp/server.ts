import 'server-only';
import { z } from 'zod';
import type { AgentContext } from '../agent-auth';
import { API_VERSION, getCapabilities } from '../capabilities';
import { describeError } from '../services/errors';
import { MCP_TOOLS, inputJsonSchema, visibleTools } from './tools';

export const SUPPORTED_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

const INSTRUCTIONS = [
  'Funnel platform: build and edit quiz and checkout funnels.',
  'Call get_capabilities first. Read a funnel with get_funnel before editing; every edit is apply_patch with the revision you read.',
  'On revision_conflict read the funnel again. Validation issues carry a code and the screen or edge to fix.',
].join(' ');

const requestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]).optional(),
  method: z.string(),
  params: z.record(z.string(), z.unknown()).optional(),
});

type JsonRpcId = string | number | null;

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: JsonRpcId;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;

function failure(id: JsonRpcId, code: number, message: string, data?: unknown): JsonRpcResponse {
  return { jsonrpc: '2.0', id, error: { code, message, ...(data === undefined ? {} : { data }) } };
}

function toolResult(payload: unknown, isError = false) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload) }],
    structuredContent: payload,
    isError,
  };
}

function negotiate(requested: unknown): string {
  return typeof requested === 'string' && SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
    ? requested
    : SUPPORTED_PROTOCOL_VERSIONS[0]!;
}

async function callTool(id: JsonRpcId, agent: AgentContext, params: Record<string, unknown>) {
  const name = typeof params.name === 'string' ? params.name : '';
  const caps = getCapabilities();
  const tool = MCP_TOOLS.find((t) => t.name === name);
  if (!tool) return failure(id, INVALID_PARAMS, `Unknown tool "${name}".`);
  if (!agent.scopes.includes(tool.scope)) {
    return {
      jsonrpc: '2.0' as const,
      id,
      result: toolResult(
        { error: { code: 'forbidden', message: `This token lacks the "${tool.scope}" scope.` } },
        true,
      ),
    };
  }
  if (tool.available && !tool.available(caps)) {
    return {
      jsonrpc: '2.0' as const,
      id,
      result: toolResult(
        { error: { code: 'feature_disabled', message: 'This deployment does not support it.' } },
        true,
      ),
    };
  }
  const parsed = tool.input.safeParse(params.arguments ?? {});
  if (!parsed.success) {
    return failure(id, INVALID_PARAMS, 'Invalid tool arguments.', {
      issues: parsed.error.issues.map((i) => ({
        code: i.code,
        message: i.message,
        path: i.path.join('.'),
      })),
    });
  }
  try {
    return { jsonrpc: '2.0' as const, id, result: toolResult(await tool.run(agent, parsed.data)) };
  } catch (error) {
    const described = describeError(error);
    if (!described) throw error;
    return {
      jsonrpc: '2.0' as const,
      id,
      result: toolResult(
        { error: { code: described.code, message: described.message, ...described.details } },
        true,
      ),
    };
  }
}

export async function handleMcpMessage(
  agent: AgentContext,
  raw: unknown,
): Promise<JsonRpcResponse | null> {
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) return failure(null, INVALID_REQUEST, 'Invalid JSON-RPC request.');
  const { id, method, params = {} } = parsed.data;
  if (id === undefined) return null;
  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: negotiate(params.protocolVersion),
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: 'funnel-platform', version: String(API_VERSION) },
            instructions: INSTRUCTIONS,
          },
        };
      case 'ping':
        return { jsonrpc: '2.0', id, result: {} };
      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: visibleTools(agent, getCapabilities()).map((t) => ({
              name: t.name,
              title: t.title,
              description: t.description,
              inputSchema: inputJsonSchema(t),
              annotations: { readOnlyHint: t.readOnly, destructiveHint: false },
            })),
          },
        };
      case 'tools/call':
        return await callTool(id, agent, params);
      default:
        return failure(id, METHOD_NOT_FOUND, `Method "${method}" is not supported.`);
    }
  } catch (error) {
    console.error('[mcp]', method, error);
    return failure(id, INTERNAL_ERROR, 'Internal error.');
  }
}
