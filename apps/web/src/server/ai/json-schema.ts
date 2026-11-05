import { z } from 'zod';

type Json = Record<string, unknown>;

const DROPPED_KEYS = new Set([
  '$schema',
  'minLength',
  'maxLength',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'minItems',
  'maxItems',
  'pattern',
  'format',
  'default',
]);

function walk(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(walk);
  if (typeof node !== 'object' || node === null) return node;
  const out: Json = {};
  for (const [key, value] of Object.entries(node as Json)) {
    if (DROPPED_KEYS.has(key)) continue;
    if (key === 'oneOf') {
      out.anyOf = walk(value);
      continue;
    }
    if (key === 'const') {
      out.enum = [value];
      continue;
    }
    out[key] = walk(value);
  }
  if (out.type === 'object' && typeof out.properties === 'object' && out.properties !== null) {
    out.required = Object.keys(out.properties as Json);
    out.additionalProperties = false;
  }
  return out;
}

export function strictJsonSchema(schema: z.ZodType): Json {
  return walk(z.toJSONSchema(schema, { io: 'output', unrepresentable: 'any' })) as Json;
}
