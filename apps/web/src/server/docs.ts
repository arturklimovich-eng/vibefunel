import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Marked } from 'marked';

export type DocGroup = 'Features' | 'Reference';

export interface DocEntry {
  slug: string;
  title: string;
  file: string;
  summary: string;
  group: DocGroup;
}

const REFERENCE: DocEntry[] = [
  ['readme', 'Overview', 'README.md', 'Setup, run modes, scripts'],
  ['data-flow', 'Data flow', 'docs/DATA_FLOW.md', 'Publishing, checkout, refunds, domains, auth'],
  ['c4', 'C4 model', 'docs/C4.md', 'System, containers, components'],
  ['architecture', 'Architecture', 'docs/ARCHITECTURE.md', 'Stack, data model, versioning, risks'],
  ['security', 'Security', 'docs/SECURITY.md', 'RLS, CSP, rate limits, secrets'],
  ['deployment', 'Deployment', 'docs/DEPLOYMENT.md', 'Docker, Coolify, Caddy, cron tasks'],
  [
    'implementation-plan',
    'Implementation plan',
    'docs/IMPLEMENTATION_PLAN.md',
    'Stages, status log, open decisions',
  ],
  [
    'repository-audit',
    'Repository audit',
    'docs/REPOSITORY_AUDIT.md',
    'Source repositories and what was reused',
  ],
].map(([slug, title, file, summary]) => ({
  slug: slug!,
  title: title!,
  file: file!,
  summary: summary!,
  group: 'Reference' as const,
}));

const ROOT =
  process.env.DOCS_ROOT ?? path.resolve(/* turbopackIgnore: true */ process.cwd(), '..', '..');
const FEATURES_DIR = 'docs/features';

async function readOptional(file: string): Promise<string | null> {
  try {
    return await readFile(path.join(ROOT, file), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

async function listFeatures(): Promise<DocEntry[]> {
  let names: string[];
  try {
    names = (await readdir(path.join(ROOT, FEATURES_DIR))).filter((n) => n.endsWith('.md')).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  return Promise.all(
    names.map(async (name) => {
      const file = `${FEATURES_DIR}/${name}`;
      const source = (await readOptional(file)) ?? '';
      const base = name.replace(/\.md$/, '').replace(/^\d+-/, '');
      return {
        slug: `feature-${base}`,
        title: source.match(/^# (.+)$/m)?.[1]?.trim() ?? base,
        file,
        summary: source.match(/^> (.+)$/m)?.[1]?.trim() ?? '',
        group: 'Features' as const,
      };
    }),
  );
}

export async function listDocs(): Promise<DocEntry[]> {
  return [...(await listFeatures()), ...REFERENCE];
}

function headingId(text: string, seen: Map<string, number>): string {
  const base = text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s/g, '-');
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

function rewriteHref(href: string, slugByFile: Map<string, string>): string {
  if (/^[a-z]+:|^#|^\//i.test(href)) return href;
  const [file = '', hash] = href.split('#');
  const slug = slugByFile.get(path.posix.basename(file).toLowerCase());
  if (!slug) return href;
  return `/studio/docs/${slug}${hash ? `#${hash}` : ''}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface RenderedDoc {
  entry: DocEntry;
  docs: DocEntry[];
  html: string;
  toc: { id: string; text: string; depth: number }[];
}

export async function loadDoc(slug: string): Promise<RenderedDoc | null> {
  const docs = await listDocs();
  const entry = docs.find((d) => d.slug === slug);
  if (!entry) return null;
  const source = await readOptional(entry.file);
  if (source === null) return null;

  const slugByFile = new Map(docs.map((d) => [path.posix.basename(d.file).toLowerCase(), d.slug]));
  const seen = new Map<string, number>();
  const toc: RenderedDoc['toc'] = [];
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading({ tokens, depth, text }) {
        const inner = this.parser.parseInline(tokens);
        const id = headingId(text, seen);
        if (depth >= 2 && depth <= 3) toc.push({ id, text: inner.replace(/<[^>]+>/g, ''), depth });
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${inner}</h${depth}>\n`;
      },
      code({ text, lang }) {
        if (lang !== 'mermaid') return `<pre><code>${escapeHtml(text)}</code></pre>\n`;
        const graph = text.replace(
          /^(\s*click\s+\S+\s+(?:href\s+)?)"([^"]+)"/gm,
          (_, head: string, href: string) => `${head}"${rewriteHref(href, slugByFile)}"`,
        );
        return `<pre class="mermaid">${escapeHtml(graph)}</pre>\n`;
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        return `<a href="${escapeHtml(rewriteHref(href, slugByFile))}"${titleAttr}>${inner}</a>`;
      },
    },
  });
  const html = (await marked.parse(source))
    .replace(/<table>/g, '<div class="tableWrap"><table>')
    .replace(/<\/table>/g, '</table></div>');
  return { entry, docs, html, toc };
}
