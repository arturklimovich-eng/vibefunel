'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import type { FunnelDefinition } from '@funnel/schema';
import { funnelRoutes, readJson } from '@/lib/api-routes';

export const AUTOSAVE_DELAY_MS = 1500;
const KEEPALIVE_MAX_BYTES = 60_000;

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

const draftResponseSchema = z.object({
  draft: z.object({ revision: z.number().int(), definition: z.unknown() }),
});

const issueSchema = z.object({
  code: z.string(),
  severity: z.enum(['error', 'warning']),
  message: z.string(),
  screenId: z.string().optional(),
  edgeId: z.string().optional(),
});
const apiResultSchema = z.object({
  issues: z.array(issueSchema).optional(),
  warnings: z.array(issueSchema).optional(),
  error: z.string().optional(),
  planKeys: z.array(z.string()).optional(),
  knownPlanKeys: z.array(z.string()).optional(),
  draft: z.object({ revision: z.number().int() }).optional(),
  currentRevision: z.number().int().optional(),
});

type ApiResult = z.infer<typeof apiResultSchema>;

export type UiIssue = z.infer<typeof issueSchema>;
export type SaveState = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

function describeFailure(result: ApiResult, fallback: string): string {
  const parts = [fallback];
  if (result.planKeys && result.planKeys.length > 0) {
    parts.push(`Unknown plan keys: ${result.planKeys.join(', ')}.`);
    const known = result.knownPlanKeys ?? [];
    parts.push(`Known plan keys: ${known.length > 0 ? known.join(', ') : 'none'}.`);
  }
  return parts.join(' ');
}

export function parseIssues(value: unknown, fallback: string): UiIssue[] {
  const parsed = apiResultSchema.safeParse(value);
  if (!parsed.success) return [{ code: 'http_error', severity: 'error', message: fallback }];
  const result = parsed.data;
  if (result.issues && result.issues.length > 0) return result.issues;
  return [
    {
      code: result.error ?? 'http_error',
      severity: 'error',
      message: describeFailure(result, fallback),
    },
  ];
}

export function parseCurrentRevision(value: unknown): number | undefined {
  const parsed = apiResultSchema.safeParse(value);
  return parsed.success ? parsed.data.currentRevision : undefined;
}

export interface DraftSaver {
  definition: FunnelDefinition;
  state: SaveState;
  timestamp: Date | null;
  issues: UiIssue[];
  dirty: boolean;
  conflict: boolean;
  getServerRevision: () => number;
  mutate: (fn: (current: FunnelDefinition) => FunnelDefinition) => void;
  saveNow: () => Promise<boolean>;
  runExclusive: <T>(fn: () => Promise<T>) => Promise<T>;
  setIssues: (issues: UiIssue[]) => void;
}

export function useDraftSaver(
  funnelId: string,
  initial: FunnelDefinition,
  initialServerRevision: number,
): DraftSaver {
  const [definition, setDefinition] = useState(initial);
  const [revision, setRevision] = useState(0);
  const [savedRevision, setSavedRevision] = useState(0);
  const [state, setState] = useState<SaveState>('idle');
  const [timestamp, setTimestamp] = useState<Date | null>(null);
  const [issues, setIssues] = useState<UiIssue[]>([]);
  const [conflict, setConflict] = useState(false);
  const serverRevisionRef = useRef(initialServerRevision);
  const conflictRef = useRef(false);
  const revisionRef = useRef(0);
  const savedRevisionRef = useRef(0);
  const definitionRef = useRef(initial);
  const inFlightRef = useRef<Promise<boolean> | null>(null);
  const queuedRef = useRef(false);
  const pausedRef = useRef(false);
  const mountedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uncertainRef = useRef<{ revision: number; definitions: string[] } | null>(null);

  const markUncertain = useCallback((revision: number, definition: FunnelDefinition) => {
    const json = canonicalJson(definition);
    const current = uncertainRef.current;
    if (current && current.revision === revision) {
      if (!current.definitions.includes(json)) current.definitions.push(json);
    } else {
      uncertainRef.current = { revision, definitions: [json] };
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    if (retryRef.current !== null) clearTimeout(retryRef.current);
    debounceRef.current = null;
    retryRef.current = null;
  }, []);

  const recoverLostSave = useCallback(
    async (currentRevision: number | undefined): Promise<boolean> => {
      const uncertain = uncertainRef.current;
      if (!uncertain || currentRevision !== uncertain.revision + 1) return false;
      try {
        const res = await fetch(funnelRoutes(funnelId).draft, { cache: 'no-store' });
        const parsed = draftResponseSchema.safeParse(await readJson(res));
        if (!res.ok || !parsed.success || parsed.data.draft.revision !== currentRevision) {
          return false;
        }
        if (!uncertain.definitions.includes(canonicalJson(parsed.data.draft.definition))) {
          return false;
        }
        serverRevisionRef.current = currentRevision;
        uncertainRef.current = null;
        return true;
      } catch (error) {
        console.warn(
          'Draft recovery check failed:',
          error instanceof Error ? error.message : error,
        );
        return false;
      }
    },
    [funnelId],
  );

  const attempt = useCallback(async (): Promise<boolean> => {
    const startRevision = revisionRef.current;
    const sentRevision = serverRevisionRef.current;
    const sentDefinition = definitionRef.current;
    const body = JSON.stringify({
      revision: sentRevision,
      definition: sentDefinition,
    });
    setState('saving');
    try {
      const res = await fetch(funnelRoutes(funnelId).draft, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body,
      });
      const raw = await readJson(res);
      const parsed = apiResultSchema.safeParse(raw);
      const accepted = res.ok && parsed.success && parsed.data.draft !== undefined;
      if (accepted && parsed.data.draft !== undefined) {
        serverRevisionRef.current = parsed.data.draft.revision;
        savedRevisionRef.current = startRevision;
        uncertainRef.current = null;
      } else if (res.ok || res.status >= 500) {
        markUncertain(sentRevision, sentDefinition);
      } else if (res.status !== 409) {
        uncertainRef.current = null;
      }
      if (res.status === 409 && (await recoverLostSave(parseCurrentRevision(raw)))) {
        return attempt();
      }
      if (!mountedRef.current) return accepted;
      setTimestamp(new Date());
      if (res.status === 409) {
        conflictRef.current = true;
        setConflict(true);
        setIssues([
          {
            code: 'revision_conflict',
            severity: 'error',
            message:
              'This funnel was changed in another tab or session. Your latest edits are not saved.',
          },
        ]);
        setState('conflict');
        return false;
      }
      if (!res.ok) {
        setIssues(parseIssues(raw, `Save failed (HTTP ${res.status}).`));
        setState('error');
        return false;
      }
      if (!parsed.success || parsed.data.draft === undefined) {
        setIssues([
          {
            code: 'bad_response',
            severity: 'error',
            message: `The save response could not be read (HTTP ${res.status}), so the draft may not be saved.`,
          },
        ]);
        setState('error');
        return false;
      }
      setIssues(parsed.data.warnings ?? []);
      setSavedRevision(startRevision);
      setState(revisionRef.current === startRevision ? 'saved' : 'idle');
      return true;
    } catch (error) {
      markUncertain(sentRevision, sentDefinition);
      if (mountedRef.current) {
        setTimestamp(new Date());
        setIssues([
          {
            code: 'network_error',
            severity: 'error',
            message: error instanceof Error ? error.message : 'Network error',
          },
        ]);
        setState('error');
      }
      return false;
    }
  }, [funnelId, recoverLostSave, markUncertain]);

  const flushOnLeave = useCallback(async (): Promise<void> => {
    if (conflictRef.current || revisionRef.current === savedRevisionRef.current) return;
    if (uncertainRef.current !== null) {
      await recoverLostSave(uncertainRef.current.revision + 1);
    }
    const startRevision = revisionRef.current;
    const body = JSON.stringify({
      revision: serverRevisionRef.current,
      definition: definitionRef.current,
    });
    try {
      const res = await fetch(funnelRoutes(funnelId).draft, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: new TextEncoder().encode(body).byteLength <= KEEPALIVE_MAX_BYTES,
      });
      const parsed = apiResultSchema.safeParse(await readJson(res));
      if (res.ok && parsed.success && parsed.data.draft !== undefined) {
        serverRevisionRef.current = parsed.data.draft.revision;
        savedRevisionRef.current = startRevision;
        return;
      }
      console.warn(
        `Saving on leave was rejected (HTTP ${res.status}); the last edits were not saved.`,
      );
    } catch (error) {
      console.warn('Saving on leave failed:', error instanceof Error ? error.message : error);
    }
  }, [funnelId, recoverLostSave]);

  const leave = useCallback(() => {
    const running = inFlightRef.current;
    if (running) void running.finally(() => flushOnLeave());
    else void flushOnLeave();
  }, [flushOnLeave]);

  const saveNow = useCallback((): Promise<boolean> => {
    if (conflictRef.current) return Promise.resolve(false);
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const running = inFlightRef.current;
    if (running) {
      queuedRef.current = true;
      return running;
    }
    const run = async (): Promise<boolean> => {
      let ok = false;
      do {
        queuedRef.current = false;
        ok = await attempt();
      } while (ok && queuedRef.current && mountedRef.current);
      inFlightRef.current = null;
      if (!ok && queuedRef.current && mountedRef.current && !conflictRef.current) {
        queuedRef.current = false;
        if (retryRef.current !== null) clearTimeout(retryRef.current);
        retryRef.current = setTimeout(() => {
          retryRef.current = null;
          if (!pausedRef.current) void saveNow();
        }, AUTOSAVE_DELAY_MS);
      }
      return ok;
    };
    const promise = run();
    inFlightRef.current = promise;
    return promise;
  }, [attempt]);

  const runExclusive = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      pausedRef.current = true;
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      try {
        return await fn();
      } finally {
        pausedRef.current = false;
        const dirty = revisionRef.current !== savedRevisionRef.current;
        if (mountedRef.current && dirty && !conflictRef.current) void saveNow();
      }
    },
    [saveNow],
  );

  const getServerRevision = useCallback(() => serverRevisionRef.current, []);

  const mutate = useCallback((fn: (current: FunnelDefinition) => FunnelDefinition) => {
    const next = fn(definitionRef.current);
    definitionRef.current = next;
    revisionRef.current += 1;
    setDefinition(next);
    setRevision(revisionRef.current);
    if (inFlightRef.current === null && !conflictRef.current) setState('idle');
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimers();
      leave();
    };
  }, [clearTimers, leave]);

  useEffect(() => {
    if (revision === 0 || !mountedRef.current || conflictRef.current || pausedRef.current) return;
    const timer = setTimeout(() => {
      if (debounceRef.current === timer) debounceRef.current = null;
      if (mountedRef.current) void saveNow();
    }, AUTOSAVE_DELAY_MS);
    debounceRef.current = timer;
    return () => {
      clearTimeout(timer);
      if (debounceRef.current === timer) debounceRef.current = null;
    };
  }, [revision, saveNow]);

  return {
    definition,
    state,
    timestamp,
    issues,
    dirty: revision !== savedRevision,
    conflict,
    getServerRevision,
    mutate,
    saveNow,
    runExclusive,
    setIssues,
  };
}
