import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withStudio } from '@/server/api-helpers';
import { parseJsonBody } from '@/server/parse-body';
import { checkDefinition } from '@/server/validate-definition';

export const dynamic = 'force-dynamic';

interface Context {
  params: Promise<{ id: string }>;
}

const saveSchema = z.object({
  revision: z.number().int().positive(),
  definition: z.unknown(),
});

export function GET(_request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    const draft = await repo.getDraft(id);
    if (!draft) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ draft });
  });
}

export function PUT(request: Request, { params }: Context) {
  return withStudio(async ({ repo }) => {
    const { id } = await params;
    const body = await parseJsonBody(request, saveSchema);
    if (!body.ok) return body.response;
    const check = checkDefinition(body.data.definition);
    if (!check.ok) {
      return NextResponse.json(
        { error: 'validation_failed', issues: check.issues },
        { status: 400 },
      );
    }
    const draft = await repo.saveDraft(id, check.definition, body.data.revision);
    return NextResponse.json({ draft, warnings: check.warnings });
  });
}
