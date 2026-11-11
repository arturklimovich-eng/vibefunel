import { NextResponse } from 'next/server';
import { z } from 'zod';
import { unknownPlanKeys } from '@funnel/schema';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';
import { loadPlans } from '@/server/payments/plans';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

const publishSchema = z.object({ revision: z.number().int().positive() });

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
      const unknown = unknownPlanKeys(draft.definition, Object.keys(catalogue.plans));
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
