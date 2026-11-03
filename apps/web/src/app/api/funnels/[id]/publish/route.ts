import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { FunnelDefinition } from '@funnel/schema';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';
import { pickerPlanKeys } from '@/lib/puck/element-schemas';
import { isPlanBound, usesPickerPlan } from '@/server/payments/checkout-target';
import { loadPlans } from '@/server/payments/plans';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

const publishSchema = z.object({ revision: z.number().int().positive() });

function unknownPlanKeys(definition: FunnelDefinition, plans: Record<string, unknown>): string[] {
  const unknown = new Set<string>();
  for (const screen of definition.screens) {
    for (const item of screen.content.content) {
      const keys = pickerPlanKeys(item);
      if (isPlanBound(item) && !usesPickerPlan(item)) {
        const key = item.props.planKey;
        if (typeof key === 'string' && key !== '') keys.push(key);
      }
      for (const key of keys) {
        if (!Object.hasOwn(plans, key)) unknown.add(key);
      }
    }
  }
  return [...unknown];
}

export function POST(request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    const body = await parseJsonBody(request, publishSchema);
    if (!body.ok) return body.response;
    const { revision } = body.data;

    const draft = await repo.getDraft(id);
    if (!draft) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (draft.revision !== revision) {
      return NextResponse.json(
        { error: 'revision_conflict', currentRevision: draft.revision },
        { status: 409 },
      );
    }

    const catalogue = loadPlans();
    if (catalogue.ok) {
      const unknown = unknownPlanKeys(draft.definition, catalogue.plans);
      if (unknown.length > 0) {
        return NextResponse.json(
          {
            error: 'unknown_plan',
            planKeys: unknown,
            knownPlanKeys: Object.keys(catalogue.plans),
          },
          { status: 400 },
        );
      }
    }

    const version = await repo.publish(id, revision);
    const funnel = await repo.getFunnel(id);
    return NextResponse.json({
      version: { id: version.id, version: version.version, createdAt: version.createdAt },
      funnel,
    });
  });
}
