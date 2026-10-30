'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import Link from 'next/link';
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  useNodesState,
  type Connection,
  type Edge as FlowEdge,
  type Node as FlowNode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { z } from 'zod';
import { SCREEN_TYPES } from '@funnel/schema';
import type {
  Condition,
  Edge,
  Funnel,
  FunnelDefinition,
  PuckData,
  Screen,
  ScreenType,
} from '@funnel/schema';
import { funnelRoutes, readJson } from '@/lib/api-routes';
import { randomId } from '@/lib/ids';
import { STUDIO_NARROW_MEDIA_QUERY } from '@/lib/layout';
import { applyOptionMode, getScreenOptions } from '@/lib/puck/adapters';
import { retypeEdges } from '@/lib/retype-edges';
import { allowedComponentsForScreenType } from '@/lib/puck/config';
import { createScreenContent } from '@/lib/puck/templates';
import { parseCurrentRevision, parseIssues, useDraftSaver } from '@/lib/use-draft-saver';
import type { SaveState, UiIssue } from '@/lib/use-draft-saver';
import { AnimationSettings } from './AnimationSettings';
import { ConditionPicker, choiceToCondition, isPaymentScreen } from './ConditionPicker';
import type { ConnectionChoice } from './ConditionPicker';
import { PreviewPane } from './PreviewPane';
import { ScreenEditor } from './ScreenEditor';
import { ThemeEditor } from './ThemeEditor';
import { ValidationPanel } from './ValidationPanel';
import { VersionsPanel } from './VersionsPanel';
import { DomainsPanel } from './DomainsPanel';
import styles from './FunnelEditor.module.css';

type TabId = 'canvas' | 'screen' | 'preview';

const TABS: { id: TabId; label: string }[] = [
  { id: 'canvas', label: 'Canvas' },
  { id: 'screen', label: 'Screen' },
  { id: 'preview', label: 'Preview' },
];

interface PendingConnection {
  source: string;
  target: string;
  choice: ConnectionChoice;
}

type Severity = UiIssue['severity'];

const SEVERITY_MARKER: Record<Severity, string> = { error: '(!) ', warning: '(?) ' };

const SEVERITY_CLASS: Record<Severity, string | undefined> = {
  error: styles.nodeError,
  warning: styles.nodeWarning,
};

type PublishOutcome = 'save_failed' | 'conflict' | 'rejected' | 'published';

const PUBLISH_NOTICE: Record<PublishOutcome, string> = {
  save_failed: 'Publish cancelled: the draft could not be saved. See the validation panel.',
  conflict: 'Publish cancelled: the draft was changed in another tab or session.',
  rejected: 'Publish failed. See the validation panel.',
  published: 'Published.',
};

function describeSaveState(state: SaveState, dirty: boolean, at: string): string {
  if (state === 'saving') return 'Saving...';
  if (state === 'conflict') return 'Not saved: changed elsewhere';
  if (state === 'error') return `Save failed at ${at}. Edit something to try again.`;
  if (dirty) return 'Unsaved changes (autosave pending)';
  if (state === 'saved') return `Saved at ${at}`;
  return 'No changes';
}

function shortId(prefix: string): string {
  return `${prefix}_${randomId(8)}`;
}

function describeCondition(condition: Condition, source: Screen | undefined): string {
  if (condition.kind === 'always') return 'always';
  if (condition.kind === 'default') return 'default';
  if (condition.kind === 'payment_succeeded') return 'payment succeeded';
  const label = source
    ? getScreenOptions(source).find((o) => o.id === condition.optionId)?.label
    : undefined;
  const text = label ?? condition.optionId;
  return condition.kind === 'answer_equals' ? `is "${text}"` : `includes "${text}"`;
}

function newScreen(type: ScreenType, index: number): Screen {
  return {
    id: shortId('screen'),
    type,
    title: 'New screen',
    content: createScreenContent(type),
    animation: { preset: 'fade' },
    position: { x: (index % 5) * 220, y: 460 + Math.floor(index / 5) * 110 },
  };
}

function toFlowNode(screen: Screen): FlowNode {
  return { id: screen.id, position: screen.position, data: { label: screen.title } };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString();
}

export function FunnelEditor({
  funnel,
  initialDefinition,
  initialRevision,
}: {
  funnel: Funnel;
  initialDefinition: FunnelDefinition;
  initialRevision: number;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(
    initialDefinition.screens.map(toFlowNode),
  );
  const [pending, setPending] = useState<PendingConnection | null>(null);
  const [newType, setNewType] = useState<ScreenType>('content');
  const [connectTarget, setConnectTarget] = useState('');
  const [connectChoice, setConnectChoice] = useState<ConnectionChoice>({ kind: 'always' });
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>('canvas');
  const screenHeadingRef = useRef<HTMLHeadingElement>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(
    funnel.publishedVersionId ? funnel.slug : null,
  );
  const saver = useDraftSaver(funnel.id, initialDefinition, initialRevision);
  const [versionsKey, setVersionsKey] = useState(0);
  const [publishConflict, setPublishConflict] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const publishingRef = useRef(false);
  const allowUnloadRef = useRef(false);
  const { definition, dirty, mutate, saveNow, setIssues, issues, state: saveState } = saver;

  const screensById = useMemo(
    () => new Map(definition.screens.map((s) => [s.id, s])),
    [definition.screens],
  );
  const selected = selectedId ? screensById.get(selectedId) : undefined;

  const selectScreen = useCallback((id: string | null) => {
    setSelectedId(id);
    setConnectChoice({ kind: 'always' });
    setConnectTarget('');
  }, []);

  const issueScreenId = useCallback(
    (issue: UiIssue): string | undefined => {
      if (issue.screenId && screensById.has(issue.screenId)) return issue.screenId;
      if (issue.edgeId) {
        const edge = definition.edges.find((e) => e.id === issue.edgeId);
        if (edge && screensById.has(edge.sourceScreenId)) return edge.sourceScreenId;
      }
      return undefined;
    },
    [definition.edges, screensById],
  );

  const severityByScreen = useMemo(() => {
    const map = new Map<string, 'error' | 'warning'>();
    for (const issue of issues) {
      const id = issueScreenId(issue);
      if (!id) continue;
      if (issue.severity === 'error' || !map.has(id)) map.set(id, issue.severity);
    }
    return map;
  }, [issues, issueScreenId]);

  const displayNodes = useMemo<FlowNode[]>(
    () =>
      nodes.map((n) => {
        const screen = screensById.get(n.id);
        const severity = severityByScreen.get(n.id);
        const start = n.id === definition.startScreenId ? '[start] ' : '';
        const marker = severity ? SEVERITY_MARKER[severity] : '';
        return {
          ...n,
          selected: n.id === selectedId,
          className: severity ? SEVERITY_CLASS[severity] : undefined,
          ariaLabel: severity ? `${screen?.title ?? n.id}, has ${severity}s` : undefined,
          data: { label: `${marker}${start}${screen?.title ?? n.id} (${screen?.type ?? '?'})` },
        };
      }),
    [nodes, screensById, selectedId, definition.startScreenId, severityByScreen],
  );

  const flowEdges = useMemo<FlowEdge[]>(
    () =>
      definition.edges.map((e) => ({
        id: e.id,
        source: e.sourceScreenId,
        target: e.targetScreenId,
        label: describeCondition(e.condition, screensById.get(e.sourceScreenId)),
        markerEnd: { type: MarkerType.ArrowClosed },
      })),
    [definition.edges, screensById],
  );

  const updateScreen = useCallback(
    (id: string, patch: Partial<Screen>) => {
      mutate((d) => ({
        ...d,
        screens: d.screens.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }));
    },
    [mutate],
  );

  const onContentChange = (id: string, content: PuckData) => {
    const current = screensById.get(id);
    if (!current || JSON.stringify(current.content) === JSON.stringify(content)) return;
    updateScreen(id, { content });
  };

  const addScreen = () => {
    const screen = newScreen(newType, definition.screens.length);
    mutate((d) => ({ ...d, screens: [...d.screens, screen] }));
    setNodes((ns) => [...ns, toFlowNode(screen)]);
    selectScreen(screen.id);
  };

  const deleteScreen = (id: string) => {
    if (id === definition.startScreenId) {
      setNotice('The start screen cannot be deleted. Set another start screen first.');
      return;
    }
    mutate((d) => ({
      ...d,
      screens: d.screens.filter((s) => s.id !== id),
      edges: d.edges.filter((e) => e.sourceScreenId !== id && e.targetScreenId !== id),
    }));
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setPending((p) => (p && (p.source === id || p.target === id) ? null : p));
    selectScreen(null);
    setNotice(null);
  };

  const addEdge = (source: string, target: string, condition: Condition) => {
    const edge: Edge = {
      id: shortId('edge'),
      sourceScreenId: source,
      targetScreenId: target,
      condition,
    };
    mutate((d) => ({ ...d, edges: [...d.edges, edge] }));
  };

  const onConnect = (connection: Connection) => {
    const { source, target } = connection;
    if (source === target) return;
    const sourceScreen = screensById.get(source);
    if (!sourceScreen) return;
    const isQuiz = sourceScreen.type === 'quiz_single' || sourceScreen.type === 'quiz_multi';
    if (isPaymentScreen(sourceScreen)) {
      setPending({ source, target, choice: { kind: 'payment' } });
      return;
    }
    if (isQuiz && getScreenOptions(sourceScreen).length > 0) {
      setPending({ source, target, choice: { kind: 'always' } });
      return;
    }
    addEdge(source, target, { kind: 'always' });
  };

  const confirmPending = () => {
    if (!pending) return;
    const sourceScreen = screensById.get(pending.source);
    if (!sourceScreen || !screensById.has(pending.target)) {
      setPending(null);
      return;
    }
    addEdge(pending.source, pending.target, choiceToCondition(sourceScreen, pending.choice));
    setPending(null);
  };

  const confirmConnectForm = () => {
    if (!selected || !screensById.has(connectTarget)) return;
    addEdge(selected.id, connectTarget, choiceToCondition(selected, connectChoice));
    setConnectChoice({ kind: 'always' });
  };

  const onNodeDragStop = (_event: unknown, _node: FlowNode, dragged: FlowNode[]) => {
    const moved = new Map(dragged.map((n) => [n.id, { x: n.position.x, y: n.position.y }]));
    mutate((d) => ({
      ...d,
      screens: d.screens.map((sc) => {
        const position = moved.get(sc.id);
        return position ? { ...sc, position } : sc;
      }),
    }));
  };

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (allowUnloadRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const changeScreenType = (screen: Screen, type: ScreenType) => {
    if (type === screen.type) return;
    const allowed = new Set(allowedComponentsForScreenType(type));
    const removed = screen.content.content.filter((item) => !allowed.has(item.type));
    const retyped = retypeEdges(definition.edges, screen, type);
    if (removed.length > 0 || retyped.changes > 0) {
      const parts: string[] = [];
      if (removed.length > 0) {
        const names = [...new Set(removed.map((item) => item.type))].join(', ');
        parts.push(`remove components it does not support: ${names}`);
      }
      if (retyped.changes > 0) {
        parts.push(
          `change or remove ${retyped.changes} outgoing edge condition(s) to fit the new type`,
        );
      }
      if (!window.confirm(`Changing the type to ${type} will ${parts.join(' and ')}. Continue?`)) {
        return;
      }
    }
    mutate((d) => ({
      ...d,
      edges: retypeEdges(d.edges, screen, type).edges,
      screens: d.screens.map((s) =>
        s.id === screen.id
          ? {
              ...s,
              type,
              content: applyOptionMode(
                {
                  ...s.content,
                  content: s.content.content.filter((item) => allowed.has(item.type)),
                },
                type,
              ),
            }
          : s,
      ),
    }));
  };

  const requestPublish = async (retryOnStaleConflict: boolean): Promise<PublishOutcome> => {
    const res = await fetch(funnelRoutes(funnel.id).publish, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ revision: saver.getServerRevision() }),
    });
    if (res.ok) return 'published';
    const raw = await readJson(res);
    if (res.status === 409) {
      if (retryOnStaleConflict && parseCurrentRevision(raw) === saver.getServerRevision()) {
        return requestPublish(false);
      }
      return 'conflict';
    }
    setIssues(parseIssues(raw, `Publish failed (HTTP ${res.status}).`));
    return 'rejected';
  };

  const publish = async () => {
    if (publishingRef.current) return;
    publishingRef.current = true;
    setPublishing(true);
    setNotice('Saving before publishing...');
    try {
      const outcome = await saver.runExclusive(async (): Promise<PublishOutcome> => {
        const saved = await saveNow();
        if (!saved) return 'save_failed';
        setNotice('Publishing...');
        return requestPublish(true);
      });
      if (outcome === 'conflict') setPublishConflict(true);
      if (outcome === 'published') {
        setPublishedSlug(funnel.slug);
        setVersionsKey((k) => k + 1);
      }
      setNotice(PUBLISH_NOTICE[outcome]);
    } catch (error) {
      setNotice(`Publish failed: ${error instanceof Error ? error.message : 'network error'}`);
    } finally {
      publishingRef.current = false;
      setPublishing(false);
    }
  };

  const selectIssue = (issue: UiIssue) => {
    const id = issueScreenId(issue);
    if (!id) return;
    selectScreen(id);
    setTab('screen');
    requestAnimationFrame(() => {
      if (window.matchMedia(STUDIO_NARROW_MEDIA_QUERY).matches) screenHeadingRef.current?.focus();
    });
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((t) => t.id === tab);
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = TABS.length - 1;
    else return;
    event.preventDefault();
    const target = TABS[nextIndex];
    if (!target) return;
    setTab(target.id);
    document.getElementById(`tab-${target.id}`)?.focus();
  };

  const at = saver.timestamp ? formatTime(saver.timestamp) : '';
  const statusText = describeSaveState(saveState, dirty, at);

  const pendingSource = pending ? screensById.get(pending.source) : undefined;
  const outgoing = selected ? definition.edges.filter((e) => e.sourceScreenId === selected.id) : [];
  const busy = saveState === 'saving' || publishing;
  const hasConflict = saver.conflict || publishConflict;
  const reloadLatest = () => {
    allowUnloadRef.current = true;
    window.location.reload();
  };

  return (
    <div className={styles.wrap}>
      <Link
        href="/studio"
        onClick={(event) => {
          if (
            dirty &&
            (hasConflict || saveState === 'error') &&
            !window.confirm('You have unsaved changes that could not be saved. Leave anyway?')
          ) {
            event.preventDefault();
          }
        }}
      >
        Back to studio
      </Link>
      <h1>{funnel.name}</h1>
      <div className={styles.toolbar}>
        <select
          aria-label="New screen type"
          value={newType}
          onChange={(e) => setNewType(z.enum(SCREEN_TYPES).catch('content').parse(e.target.value))}
        >
          {SCREEN_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="button" className={styles.btn} onClick={addScreen}>
          Add screen
        </button>
        <button
          type="button"
          className={styles.btn}
          disabled={!selected}
          onClick={() => selected && deleteScreen(selected.id)}
        >
          Delete screen
        </button>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() => void saveNow()}
          disabled={busy || hasConflict}
        >
          Save
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={() => void publish()}
          disabled={busy || hasConflict}
        >
          Publish
        </button>
        <span className={styles.status} role="status" aria-live="polite">
          {statusText}
        </span>
        <Link href={`/preview/${funnel.id}`} target="_blank">
          Preview draft
        </Link>
        {publishedSlug ? (
          <Link href={`/f/${publishedSlug}`} target="_blank">
            Open published
          </Link>
        ) : null}
      </div>
      {hasConflict ? (
        <div className={styles.issueError} role="alert">
          <strong>Conflict.</strong> This funnel was changed in another tab or session, so your
          latest edits were not saved. Reload to get the newest version (unsaved edits here will be
          lost).{' '}
          <button type="button" className={styles.btnPrimary} onClick={reloadLatest}>
            Reload latest
          </button>
        </div>
      ) : null}
      {notice ? <p role="status">{notice}</p> : null}

      <div
        role="tablist"
        aria-label="Editor sections"
        className={styles.tabs}
        onKeyDown={onTabKeyDown}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            tabIndex={tab === t.id ? 0 : -1}
            aria-controls={`pane-${t.id}`}
            className={styles.tab}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <section
          id="pane-canvas"
          role="tabpanel"
          aria-labelledby="tab-canvas"
          className={styles.pane}
          data-active={tab === 'canvas'}
        >
          <div className={styles.canvas}>
            <ReactFlow
              nodes={displayNodes}
              edges={flowEdges}
              onNodesChange={onNodesChange}
              onConnect={onConnect}
              onNodeClick={(_event, node) => selectScreen(node.id)}
              onPaneClick={() => selectScreen(null)}
              onNodeDragStop={onNodeDragStop}
              deleteKeyCode={null}
              fitView
              fitViewOptions={{ padding: 0.1 }}
              minZoom={0.1}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>

          {pending && pendingSource ? (
            <div className={styles.panel}>
              <strong>
                Connect {pendingSource.title} to{' '}
                {screensById.get(pending.target)?.title ?? pending.target}
              </strong>
              <div className={styles.row}>
                <ConditionPicker
                  source={pendingSource}
                  value={pending.choice}
                  onChange={(choice) => setPending({ ...pending, choice })}
                />
                <button type="button" className={styles.btnPrimary} onClick={confirmPending}>
                  Add edge
                </button>
                <button type="button" className={styles.btn} onClick={() => setPending(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <ValidationPanel
            issues={issues}
            checked={saver.timestamp !== null}
            canSelect={(issue) => issueScreenId(issue) !== undefined}
            onSelect={selectIssue}
          />

          <VersionsPanel funnelId={funnel.id} refreshKey={versionsKey} />

          <DomainsPanel funnelId={funnel.id} />

          <div className={styles.panel}>
            <h2 className={styles.panelHeading}>Funnel settings</h2>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={definition.allowCycles === true}
                onChange={(e) => mutate((d) => ({ ...d, allowCycles: e.target.checked }))}
              />
              Allow cycles
            </label>
            <ThemeEditor
              theme={definition.theme}
              onChange={(theme) => mutate((d) => ({ ...d, theme }))}
            />
          </div>
        </section>

        <section
          id="pane-preview"
          role="tabpanel"
          aria-labelledby="tab-preview"
          className={styles.pane}
          data-active={tab === 'preview'}
        >
          <PreviewPane funnelId={funnel.id} definition={definition} />
        </section>

        <section
          id="pane-screen"
          role="tabpanel"
          aria-labelledby="tab-screen"
          className={`${styles.pane} ${styles.paneScreen}`}
          data-active={tab === 'screen'}
        >
          <h2 ref={screenHeadingRef} tabIndex={-1} className={styles.panelHeading}>
            Screen
          </h2>
          {selected ? (
            <>
              <div className={styles.panel}>
                <div className={styles.row}>
                  <label className={styles.field}>
                    Title
                    <input
                      value={selected.title}
                      onChange={(e) => {
                        updateScreen(selected.id, { title: e.target.value });
                      }}
                    />
                  </label>
                  <label className={styles.field}>
                    Type
                    <select
                      value={selected.type}
                      onChange={(e) =>
                        changeScreenType(
                          selected,
                          z.enum(SCREEN_TYPES).catch(selected.type).parse(e.target.value),
                        )
                      }
                    >
                      {SCREEN_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                  <AnimationSettings
                    value={selected.animation}
                    onChange={(animation) => updateScreen(selected.id, { animation })}
                  />
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={selected.id === definition.startScreenId}
                    onClick={() => mutate((d) => ({ ...d, startScreenId: selected.id }))}
                  >
                    Set as start
                  </button>
                </div>
                <div>
                  <strong>Outgoing edges</strong>
                  {outgoing.length === 0 ? (
                    <p className={styles.status}>
                      None. Drag from this node handle, or use the form below.
                    </p>
                  ) : (
                    <ul className={styles.edgeList}>
                      {outgoing.map((e) => (
                        <li key={e.id}>
                          {describeCondition(e.condition, selected)} to{' '}
                          {screensById.get(e.targetScreenId)?.title ?? e.targetScreenId}{' '}
                          <button
                            type="button"
                            className={styles.btn}
                            onClick={() =>
                              mutate((d) => ({ ...d, edges: d.edges.filter((x) => x.id !== e.id) }))
                            }
                          >
                            Delete edge
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className={styles.row}>
                  <label className={styles.field}>
                    Connect to
                    <select
                      value={connectTarget}
                      onChange={(ev) => setConnectTarget(ev.target.value)}
                    >
                      <option value="">Select a screen</option>
                      {definition.screens
                        .filter((sc) => sc.id !== selected.id)
                        .map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.title || sc.id}
                          </option>
                        ))}
                    </select>
                  </label>
                  <ConditionPicker
                    source={selected}
                    value={connectChoice}
                    onChange={setConnectChoice}
                  />
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={!screensById.has(connectTarget)}
                    onClick={confirmConnectForm}
                  >
                    Add edge
                  </button>
                </div>
              </div>
              <ScreenEditor
                key={`${selected.id}-${selected.type}`}
                screenId={selected.id}
                screenType={selected.type}
                content={selected.content}
                onChange={(content) => onContentChange(selected.id, content)}
              />
            </>
          ) : (
            <p className={styles.status}>
              Select a screen on the canvas, then return to this tab to edit its content.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
