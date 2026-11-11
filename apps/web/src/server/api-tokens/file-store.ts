import 'server-only';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { MAX_ACTIVE_TOKENS, TokenLimitError, apiTokenScopeSchema, toScopes } from './tokens';
import type { ApiToken, ApiTokenStore, NewApiToken, ResolvedToken } from './tokens';

const LAST_USED_STEP_MS = 5 * 60 * 1000;

const rowSchema = z.object({
  id: z.string(),
  name: z.string(),
  tokenHash: z.string(),
  scopes: z.array(apiTokenScopeSchema),
  createdAt: z.string(),
  lastUsedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
});
type Row = z.infer<typeof rowSchema>;

function toToken(row: Row): ApiToken {
  return {
    id: row.id,
    name: row.name,
    scopes: toScopes(row.scopes),
    createdAt: row.createdAt,
    lastUsedAt: row.lastUsedAt,
  };
}

export class FileApiTokenStore implements ApiTokenStore {
  private queue: Promise<unknown> = Promise.resolve();
  private readonly file: string;

  constructor(private readonly dir: string) {
    this.file = path.join(dir, 'api-tokens.json');
  }

  private async read(): Promise<Row[]> {
    try {
      return z.array(rowSchema).parse(JSON.parse(await readFile(this.file, 'utf8')));
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];
      throw error;
    }
  }

  private async write(rows: Row[]): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    const tmp = `${this.file}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(rows, null, 2), 'utf8');
    await rename(tmp, this.file);
  }

  private exclusive<T>(run: () => Promise<T>): Promise<T> {
    const next = this.queue.then(run, run);
    this.queue = next.catch(() => undefined);
    return next;
  }

  async list(): Promise<ApiToken[]> {
    const rows = await this.read();
    return rows
      .filter((r) => r.revokedAt === null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toToken);
  }

  create(input: NewApiToken, tokenHash: string): Promise<ApiToken> {
    return this.exclusive(async () => {
      const rows = await this.read();
      if (rows.filter((r) => r.revokedAt === null).length >= MAX_ACTIVE_TOKENS) {
        throw new TokenLimitError();
      }
      const row: Row = {
        id: randomUUID(),
        name: input.name,
        tokenHash,
        scopes: input.scopes,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
        revokedAt: null,
      };
      await this.write([...rows, row]);
      return toToken(row);
    });
  }

  revoke(id: string): Promise<boolean> {
    return this.exclusive(async () => {
      const rows = await this.read();
      const row = rows.find((r) => r.id === id && r.revokedAt === null);
      if (!row) return false;
      row.revokedAt = new Date().toISOString();
      await this.write(rows);
      return true;
    });
  }

  resolve(tokenHash: string): Promise<ResolvedToken | null> {
    return this.exclusive(async () => {
      const rows = await this.read();
      const row = rows.find((r) => r.tokenHash === tokenHash && r.revokedAt === null);
      if (!row) return null;
      const now = Date.now();
      if (row.lastUsedAt === null || Date.parse(row.lastUsedAt) < now - LAST_USED_STEP_MS) {
        row.lastUsedAt = new Date(now).toISOString();
        await this.write(rows);
      }
      return { tokenId: row.id, userId: null, scopes: toScopes(row.scopes) };
    });
  }
}
