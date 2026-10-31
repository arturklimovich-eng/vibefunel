import 'server-only';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import type { FunnelLead, LeadInput, LeadStore } from './store';

const recordSchema = z.object({
  projectId: z.string(),
  funnelId: z.string(),
  version: z.number().int(),
  runId: z.string(),
  screenId: z.string(),
  blockId: z.string(),
  email: z.string(),
  consent: z.boolean(),
  consentText: z.string().nullable(),
  createdAt: z.string(),
});

const fileSchema = z.object({ leads: z.array(recordSchema) });

type LeadFile = z.infer<typeof fileSchema>;

function isNotFound(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

export class FileLeadStore implements LeadStore {
  private readonly file: string;
  private readonly dir: string;
  private chain: Promise<unknown> = Promise.resolve();

  constructor(dataDir: string) {
    this.dir = dataDir;
    this.file = path.join(dataDir, 'leads.json');
  }

  private withLock<T>(task: () => Promise<T>): Promise<T> {
    const run = this.chain.then(task, task);
    this.chain = run.catch(() => null);
    return run;
  }

  private async read(): Promise<LeadFile> {
    try {
      const text = await readFile(this.file, 'utf8');
      return fileSchema.parse(JSON.parse(text));
    } catch (error) {
      if (isNotFound(error)) return { leads: [] };
      throw error;
    }
  }

  private async write(data: LeadFile): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    const temp = `${this.file}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify(data, null, 2), 'utf8');
    await rename(temp, this.file);
  }

  recordLead(lead: LeadInput): Promise<{ duplicate: boolean }> {
    return this.withLock(async () => {
      const data = await this.read();
      const duplicate = data.leads.some(
        (l) => l.funnelId === lead.funnelId && l.runId === lead.runId && l.email === lead.email,
      );
      if (duplicate) return { duplicate: true };
      data.leads.push({ ...lead, createdAt: new Date().toISOString() });
      await this.write(data);
      return { duplicate: false };
    });
  }

  listFunnelLeads(
    projectId: string,
    funnelId: string,
    limit: number | null,
  ): Promise<FunnelLead[]> {
    return this.withLock(async () => {
      const rows = (await this.read()).leads
        .filter((l) => l.projectId === projectId && l.funnelId === funnelId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return (limit === null ? rows : rows.slice(0, limit)).map((l) => ({
        email: l.email,
        consent: l.consent,
        consentText: l.consentText,
        screenId: l.screenId,
        blockId: l.blockId,
        runId: l.runId,
        createdAt: l.createdAt,
      }));
    });
  }
}
