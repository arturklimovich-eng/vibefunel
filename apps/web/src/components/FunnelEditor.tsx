'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, DragEvent } from 'react';
import Link from 'next/link';
import type { Connection } from '@xyflow/react';
import { z } from 'zod';
import { MAX_PROGRESS_SEGMENTS, PROGRESS_TYPES, SCREEN_TYPES } from '@funnel/schema';
import type {
  Condition,
  Edge,
  Funnel,
  FunnelDefinition,
  PuckData,
  Screen,
  ScreenHeader,
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
import { contrastingForeground } from './FunnelRuntime';
import { PreviewPane } from './PreviewPane';
import { ScreenEditor } from './ScreenEditor';
import type { EditorBridgeState, EditorCommands, ScreenEditorSlots } from './ScreenEditor';
import { ThemeEditor } from './ThemeEditor';
import { ValidationPanel } from './ValidationPanel';
import { VersionsPanel } from './VersionsPanel';
import { DomainsPanel } from './DomainsPanel';
import { LeadsPanel } from './LeadsPanel';
import { PaymentsPanel } from './PaymentsPanel';
import { ScreenCanvas } from './ScreenCanvas';
import { ScreenHeaderBar } from './ScreenHeaderBar';
import { Segmented, ToggleRow } from './ParamControls';
import {
  DEFAULT_SEGMENTS,
  depthFromStart,
  longestPathFrom,
  previewStep,
  screenGroups,
} from '@/lib/progress';
import {
  ChatIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloseIcon,
  CopyIcon,
  DotsIcon,
  ExternalIcon,
  EyeIcon,
  GearIcon,
  GridIcon,
  LogoMark,
  MagicIcon,
  PhoneIcon,
  PlusIcon,
  Redo,
  SearchIcon,
  SlidersIcon,
  TranslateIcon,
  UsersIcon,
  TrashIcon,
  Undo,
} from './EditorIcons';
import styles from './FunnelEditor.module.css';
import shell from './EditorShell.module.css';

type Mode = 'flow' | 'editor';
type NarrowPanel = 'screens' | 'main' | 'inspector';
type AddMenuAnchor = 'bottom';
type LeftTab = 'screens' | 'elements';
type RightTab = 'parameters' | 'styles';

interface PendingConnection {
  source: string;
  target: string;
  choice: ConnectionChoice;
}

type PublishOutcome = 'save_failed' | 'conflict' | 'rejected' | 'published';

const PUBLISH_NOTICE: Record<PublishOutcome, string> = {
  save_failed: 'Publish cancelled: the draft could not be saved. See the validation panel.',
  conflict: 'Publish cancelled: the draft was changed in another tab or session.',
  rejected: 'Publish failed. See the validation panel.',
  published: 'Published.',
};

const IMAGE_POSITIONS = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
] as const;

const PROGRESS_LABELS = { line: 'Line', segments: 'Segments', groups: 'Groups' } as const;
const PROGRESS_OPTIONS = PROGRESS_TYPES.map((value) => ({ value, label: PROGRESS_LABELS[value] }));

const SCREEN_META: Record<ScreenType, { label: string; color: string }> = {
  welcome: { label: 'Landing', color: '#f0503a' },
  quiz_single: { label: 'Question', color: '#6e56f8' },
  quiz_multi: { label: 'Multi-choice', color: '#8b5cf6' },
  content: { label: 'Content', color: '#3b82f6' },
  email_capture: { label: 'Email capture', color: '#0ea5e9' },
  paywall: { label: 'Pricing', color: '#202126' },
  checkout: { label: 'Payment', color: '#1f8a5b' },
  upsell: { label: 'Upsell', color: '#db2777' },
  success: { label: 'Success', color: '#e89a2a' },
};

const NARROW_TABS: { id: NarrowPanel; label: string }[] = [
  { id: 'screens', label: 'Screens' },
  { id: 'main', label: 'Canvas' },
  { id: 'inspector', label: 'Settings' },
];

function describeSaveState(state: SaveState, dirty: boolean, at: string): string {
  if (state === 'saving') return 'Saving...';
  if (state === 'conflict') return 'Not saved: changed elsewhere';
  if (state === 'error') return `Save failed at ${at}. Edit something to try again.`;
  if (dirty) return 'Unsaved changes (autosave pending)';
  if (state === 'saved') return `Saved at ${at}`;
  return 'No changes';
}

function shortSaveState(state: SaveState, dirty: boolean): { text: string; tone: string } {
  if (state === 'saving') return { text: 'Saving', tone: 'busy' };
  if (state === 'conflict') return { text: 'Not saved', tone: 'bad' };
  if (state === 'error') return { text: 'Save failed', tone: 'bad' };
  if (dirty) return { text: 'Unsaved', tone: 'busy' };
  return { text: 'Saved', tone: 'ok' };
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
    title: SCREEN_META[type].label,
    content: createScreenContent(type),
    animation: { preset: 'fade' },
    position: { x: (index % 5) * 220, y: 460 + Math.floor(index / 5) * 110 },
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString();
}

export function FunnelEditor({
  funnel,
  initialDefinition,
  initialRevision,
  initialMode = 'editor',
}: {
  funnel: Funnel;
  initialDefinition: FunnelDefinition;
  initialRevision: number;
  initialMode?: Mode;
}) {
  const [selectedId, setSelectedId] = useState<string>(initialDefinition.startScreenId);
  const [pending, setPending] = useState<PendingConnection | null>(null);
  const [connectTarget, setConnectTarget] = useState('');
  const [connectChoice, setConnectChoice] = useState<ConnectionChoice>({ kind: 'always' });
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [narrowPanel, setNarrowPanel] = useState<NarrowPanel>('main');
  const [addMenu, setAddMenu] = useState<AddMenuAnchor | null>(null);
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>('screens');
  const [rightTab, setRightTab] = useState<RightTab>('parameters');
  const [query, setQuery] = useState('');
  const [slots, setSlots] = useState<ScreenEditorSlots>({
    preview: null,
    fields: null,
    blocks: null,
    outline: null,
  });
  const [bridge, setBridge] = useState<EditorBridgeState>({
    selection: null,
    canUndo: false,
    canRedo: false,
  });
  const commandsRef = useRef<EditorCommands | null>(null);
  const screenHeadingRef = useRef<HTMLHeadingElement>(null);
  const settingsRef = useRef<HTMLDialogElement>(null);
  const previewRef = useRef<HTMLDialogElement>(null);
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

  const previewSlotRef = useCallback((el: HTMLDivElement | null) => {
    setSlots((s) => (s.preview === el ? s : { ...s, preview: el }));
  }, []);
  const fieldsSlotRef = useCallback((el: HTMLDivElement | null) => {
    setSlots((s) => (s.fields === el ? s : { ...s, fields: el }));
  }, []);
  const blocksSlotRef = useCallback((el: HTMLDivElement | null) => {
    setSlots((s) => (s.blocks === el ? s : { ...s, blocks: el }));
  }, []);
  const outlineSlotRef = useCallback((el: HTMLDivElement | null) => {
    setSlots((s) => (s.outline === el ? s : { ...s, outline: el }));
  }, []);

  const screensById = useMemo(
    () => new Map(definition.screens.map((s) => [s.id, s])),
    [definition.screens],
  );
  const selected = screensById.get(selectedId) ?? screensById.get(definition.startScreenId);
  const selectedIndex = selected ? definition.screens.indexOf(selected) : -1;

  const selectScreen = useCallback((id: string) => {
    setSelectedId(id);
    setConnectChoice({ kind: 'always' });
    setConnectTarget('');
    setRowMenu(null);
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

  const typeMeta = useCallback((screen: Screen) => SCREEN_META[screen.type], []);

  const describeEdge = useCallback(
    (edge: Edge) => describeCondition(edge.condition, screensById.get(edge.sourceScreenId)),
    [screensById],
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

  const updateHeader = (id: string, patch: Partial<ScreenHeader>) => {
    const current = screensById.get(id);
    if (!current) return;
    updateScreen(id, { header: { ...current.header, ...patch } });
  };

  const onContentChange = (id: string, content: PuckData) => {
    const current = screensById.get(id);
    if (!current || JSON.stringify(current.content) === JSON.stringify(content)) return;
    updateScreen(id, { content });
  };

  const addScreen = (type: ScreenType) => {
    const screen = newScreen(type, definition.screens.length);
    mutate((d) => ({ ...d, screens: [...d.screens, screen] }));
    selectScreen(screen.id);
    setAddMenu(null);
  };

  const deleteScreen = (id: string) => {
    setRowMenu(null);
    if (id === definition.startScreenId) {
      setNotice('The start screen cannot be deleted. Set another start screen first.');
      return;
    }
    const screen = screensById.get(id);
    if (!window.confirm(`Delete the screen "${screen?.title ?? id}" and its connections?`)) return;
    mutate((d) => ({
      ...d,
      screens: d.screens.filter((s) => s.id !== id),
      edges: d.edges.filter((e) => e.sourceScreenId !== id && e.targetScreenId !== id),
    }));
    setPending((p) => (p && (p.source === id || p.target === id) ? null : p));
    if (selected?.id === id) selectScreen(definition.startScreenId);
    setNotice(null);
  };

  const addGroup = () => {
    if (!selected) return;
    let n = groups.length + 1;
    while (groups.includes(`Group ${n}`)) n += 1;
    updateScreen(selected.id, { group: `Group ${n}` });
    setRightTab('parameters');
  };

  const setStart = (id: string) => {
    setRowMenu(null);
    mutate((d) => ({ ...d, startScreenId: id }));
  };

  const moveScreen = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    mutate((d) => {
      const from = d.screens.findIndex((s) => s.id === fromId);
      const to = d.screens.findIndex((s) => s.id === toId);
      if (from < 0 || to < 0) return d;
      const screens = [...d.screens];
      const [moved] = screens.splice(from, 1);
      if (!moved) return d;
      screens.splice(to, 0, moved);
      return { ...d, screens };
    });
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

  useEffect(() => {
    if (!addMenu && !rowMenu) return;
    const close = (event: MouseEvent | globalThis.KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') return;
      } else if (event.target instanceof Element && event.target.closest('[data-menu]')) {
        return;
      }
      setAddMenu(null);
      setRowMenu(null);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [addMenu, rowMenu]);

  useEffect(() => {
    const dialog = settingsRef.current;
    if (!dialog) return;
    if (settingsOpen && !dialog.open) dialog.showModal();
    if (!settingsOpen && dialog.open) dialog.close();
  }, [settingsOpen]);

  useEffect(() => {
    const dialog = previewRef.current;
    if (!dialog) return;
    if (previewOpen && !dialog.open) dialog.showModal();
    if (!previewOpen && dialog.open) dialog.close();
  }, [previewOpen]);

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
      if (outcome === 'rejected' || outcome === 'save_failed') setMode('flow');
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
    commandsRef.current?.deselect();
    setNarrowPanel('inspector');
    requestAnimationFrame(() => {
      if (window.matchMedia(STUDIO_NARROW_MEDIA_QUERY).matches) screenHeadingRef.current?.focus();
    });
  };

  const openScreen = (id: string) => {
    selectScreen(id);
    setNarrowPanel('main');
  };

  const onRowDrop = (event: DragEvent<HTMLLIElement>, targetId: string) => {
    event.preventDefault();
    if (dragId) moveScreen(dragId, targetId);
    setDragId(null);
  };

  const at = saver.timestamp ? formatTime(saver.timestamp) : '';
  const statusText = describeSaveState(saveState, dirty, at);
  const shortStatus = shortSaveState(saveState, dirty);

  const pendingSource = pending ? screensById.get(pending.source) : undefined;
  const outgoing = selected ? definition.edges.filter((e) => e.sourceScreenId === selected.id) : [];
  const busy = saveState === 'saving' || publishing;
  const hasConflict = saver.conflict || publishConflict;
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.length - errorCount;
  const reloadLatest = () => {
    allowUnloadRef.current = true;
    window.location.reload();
  };

  const theme = definition.theme;
  const phoneStyle = {
    '--funnel-primary': theme.primaryColor,
    '--funnel-on-primary': contrastingForeground(theme.primaryColor),
    background: theme.backgroundColor,
    color: theme.textColor,
    fontSize: `${theme.fontScale ?? 1}rem`,
  } as CSSProperties;

  const elementMode = mode === 'editor' && bridge.selection !== null;
  const depths = useMemo(() => depthFromStart(definition), [definition]);
  const lengths = useMemo(() => longestPathFrom(definition), [definition]);
  const groups = useMemo(() => screenGroups(definition), [definition]);
  const selectedPosition = selected
    ? previewStep(definition, selected.id, depths, lengths)
    : { step: 1, total: 1 };
  const selectedHeader = selected?.header ?? {};

  const normalizedQuery = query.trim().toLowerCase();
  const visibleScreens = normalizedQuery
    ? definition.screens.filter(
        (s) =>
          s.title.toLowerCase().includes(normalizedQuery) ||
          s.id.toLowerCase().includes(normalizedQuery),
      )
    : definition.screens;
  const elementCount = selected?.content.content.length ?? 0;

  const addMenuList = (anchor: AddMenuAnchor) =>
    addMenu === anchor ? (
      <ul
        className={shell.menu}
        data-menu
        data-anchor={anchor}
        role="menu"
        aria-label="Screen type"
      >
        {SCREEN_TYPES.map((t) => (
          <li key={t} role="none">
            <button
              type="button"
              role="menuitem"
              className={shell.menuItem}
              onClick={() => addScreen(t)}
            >
              <span className={shell.menuSwatch} style={{ background: SCREEN_META[t].color }} />
              {SCREEN_META[t].label}
              <span className={shell.menuHint}>{t}</span>
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  const screenParameters = selected ? (
    <div className={shell.paramBody}>
      <div className={shell.paramGroup}>
        <label className={shell.paramRow}>
          <span className={shell.paramLabel}>Name</span>
          <input
            className={shell.input}
            value={selected.title}
            onChange={(e) => updateScreen(selected.id, { title: e.target.value })}
          />
        </label>
        <label className={shell.paramRow}>
          <span className={shell.paramLabel}>ID</span>
          <input className={shell.input} value={selected.id} readOnly aria-readonly="true" />
        </label>
        <label className={shell.paramRow}>
          <span className={shell.paramLabel}>Screen type</span>
          <select
            className={shell.input}
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
                {SCREEN_META[t].label}
              </option>
            ))}
          </select>
        </label>
        <label className={shell.paramRow}>
          <span className={shell.paramLabel}>Group</span>
          <input
            className={shell.input}
            list="screen-groups"
            placeholder="No group"
            maxLength={60}
            value={selected.group ?? ''}
            onChange={(e) =>
              updateScreen(selected.id, {
                group: e.target.value === '' ? undefined : e.target.value,
              })
            }
          />
          <datalist id="screen-groups">
            {groups.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </label>
      </div>

      <details className={shell.paramSection} open>
        <summary className={shell.paramSummary}>
          Header <ChevronDown size={14} />
        </summary>
        <label className={shell.paramRow}>
          <span className={shell.paramLabel}>Title</span>
          <input
            className={shell.input}
            maxLength={200}
            placeholder="No title"
            value={selectedHeader.title ?? ''}
            onChange={(e) => updateHeader(selected.id, { title: e.target.value })}
          />
        </label>
      </details>

      <details className={shell.paramSection} open>
        <summary className={shell.paramSummary}>
          Header Image <ChevronDown size={14} />
        </summary>
        <ToggleRow
          label="Show Logo"
          checked={selectedHeader.showLogo ?? false}
          onChange={(showLogo) => updateHeader(selected.id, { showLogo })}
        />
        {selectedHeader.showLogo && !definition.theme.logoUrl ? (
          <p className={shell.muted}>Set the logo URL in Styles.</p>
        ) : null}
        <label className={shell.paramRow}>
          <span className={shell.paramLabel}>Image</span>
          <input
            className={shell.input}
            type="url"
            placeholder="https://…"
            maxLength={2000}
            value={selectedHeader.imageUrl ?? ''}
            onChange={(e) =>
              updateHeader(selected.id, {
                imageUrl: e.target.value === '' ? undefined : e.target.value,
              })
            }
          />
        </label>
        <label className={shell.paramRow}>
          <span className={shell.paramLabel}>Alt Text</span>
          <input
            className={shell.input}
            maxLength={200}
            value={selectedHeader.imageAlt ?? ''}
            onChange={(e) => updateHeader(selected.id, { imageAlt: e.target.value })}
          />
        </label>
        <Segmented
          label="Position"
          options={IMAGE_POSITIONS}
          value={selectedHeader.imagePosition ?? 'left'}
          onChange={(imagePosition) => updateHeader(selected.id, { imagePosition })}
        />
      </details>

      <details className={shell.paramSection} open>
        <summary className={shell.paramSummary}>
          Navigation <ChevronDown size={14} />
        </summary>
        <ToggleRow
          label="Back Button"
          checked={selectedHeader.backButton ?? true}
          onChange={(backButton) => updateHeader(selected.id, { backButton })}
        />
        <ToggleRow
          label="Counter"
          checked={selectedHeader.counter ?? true}
          onChange={(counter) => updateHeader(selected.id, { counter })}
        />
        <ToggleRow
          label="Progress bar"
          checked={selectedHeader.progress ?? true}
          onChange={(progress) => updateHeader(selected.id, { progress })}
        />
        {(selectedHeader.progress ?? true) ? (
          <>
            <Segmented
              label="Type"
              options={PROGRESS_OPTIONS}
              value={selectedHeader.progressType ?? 'line'}
              onChange={(progressType) => updateHeader(selected.id, { progressType })}
            />
            {(selectedHeader.progressType ?? 'line') === 'segments' ? (
              <label className={shell.paramRow}>
                <span className={shell.paramLabel}>Segments</span>
                <input
                  className={shell.input}
                  type="number"
                  min={1}
                  max={MAX_PROGRESS_SEGMENTS}
                  value={selectedHeader.segments ?? DEFAULT_SEGMENTS}
                  onChange={(e) => {
                    const n = Math.round(Number(e.target.value));
                    if (!Number.isFinite(n)) return;
                    updateHeader(selected.id, {
                      segments: Math.min(MAX_PROGRESS_SEGMENTS, Math.max(1, n)),
                    });
                  }}
                />
              </label>
            ) : null}
            {(selectedHeader.progressType ?? 'line') === 'groups' && groups.length === 0 ? (
              <p className={shell.muted}>Assign screens to groups to split the bar by group.</p>
            ) : null}
          </>
        ) : null}
        <ToggleRow
          label="Auto Navigation"
          checked={selected.autoNavigation ?? false}
          onChange={(autoNavigation) => updateScreen(selected.id, { autoNavigation })}
        />
        {selected.autoNavigation && selected.type !== 'quiz_single' ? (
          <p className={shell.muted}>Auto navigation works on single-choice quiz screens.</p>
        ) : null}
      </details>

      <details className={shell.paramSection} open>
        <summary className={shell.paramSummary}>
          Connections <ChevronDown size={14} />
        </summary>
        <div className={shell.paramRow}>
          <span className={shell.paramLabel}>Start screen</span>
          {selected.id === definition.startScreenId ? (
            <span className={shell.muted}>Visitors land here first</span>
          ) : (
            <button type="button" className={shell.ghostBtn} onClick={() => setStart(selected.id)}>
              Set as start
            </button>
          )}
        </div>
        <span className={shell.paramLabel}>Next screens</span>
        {outgoing.length === 0 ? (
          <p className={shell.muted}>No connections yet. Add one below or drag on the canvas.</p>
        ) : (
          <ul className={shell.edgeList}>
            {outgoing.map((e) => (
              <li key={e.id} className={shell.edgeItem}>
                <span>
                  <span className={shell.edgeCond}>{describeCondition(e.condition, selected)}</span>
                  <ChevronRight size={12} />
                  {screensById.get(e.targetScreenId)?.title ?? e.targetScreenId}
                </span>
                <button
                  type="button"
                  className={shell.iconBtn}
                  aria-label="Delete connection"
                  onClick={() =>
                    mutate((d) => ({ ...d, edges: d.edges.filter((x) => x.id !== e.id) }))
                  }
                >
                  <TrashIcon size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className={shell.paramRow}>
          <span className={shell.paramLabel}>Connect to</span>
          <select
            className={shell.input}
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
        <div className={shell.inlineFields}>
          <ConditionPicker source={selected} value={connectChoice} onChange={setConnectChoice} />
        </div>
        <button
          type="button"
          className={shell.ghostBtn}
          disabled={!screensById.has(connectTarget)}
          onClick={confirmConnectForm}
        >
          <PlusIcon size={14} /> Add connection
        </button>
      </details>

      <details className={shell.paramSection} open>
        <summary className={shell.paramSummary}>
          Animation <ChevronDown size={14} />
        </summary>
        <div className={shell.inlineFields}>
          <AnimationSettings
            value={selected.animation}
            onChange={(animation) => updateScreen(selected.id, { animation })}
          />
        </div>
      </details>

      <div className={shell.paramGroup}>
        <button
          type="button"
          className={shell.dangerLink}
          onClick={() => deleteScreen(selected.id)}
        >
          <TrashIcon size={15} /> Delete screen
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className={shell.app} data-narrow-panel={narrowPanel}>
      <header className={shell.topbar}>
        <div className={shell.brandArea}>
          <Link
            href="/studio"
            className={shell.iconBtn}
            aria-label="Back to studio"
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
            <ChevronLeft size={18} />
          </Link>
          <span className={shell.logo}>
            <LogoMark size={16} />
          </span>
          <h1 className={shell.funnelName} title={funnel.name}>
            {funnel.name}
          </h1>
          <span
            className={shell.saveStatus}
            data-tone={shortStatus.tone}
            title={statusText}
            role="status"
            aria-live="polite"
          >
            <span className={shell.saveDot} aria-hidden="true" />
            {shortStatus.text}
            <span className={shell.srOnly}>: {statusText}</span>
          </span>
        </div>
        <div className={shell.topActions}>
          {issues.length > 0 ? (
            <button
              type="button"
              className={shell.issuesChip}
              data-tone={errorCount > 0 ? 'bad' : 'warn'}
              onClick={() => {
                commandsRef.current?.deselect();
                setRightTab('parameters');
                setNarrowPanel('inspector');
              }}
            >
              {errorCount > 0 ? `${errorCount} error${errorCount === 1 ? '' : 's'}` : null}
              {errorCount > 0 && warningCount > 0 ? ' · ' : null}
              {warningCount > 0 ? `${warningCount} warning${warningCount === 1 ? '' : 's'}` : null}
            </button>
          ) : null}
          {publishedSlug ? (
            <Link href={`/f/${publishedSlug}`} target="_blank" className={shell.liveLink}>
              Live <ExternalIcon size={13} />
            </Link>
          ) : null}
          <button
            type="button"
            className={shell.iconBtn}
            aria-label="Funnel settings"
            title="Funnel settings"
            onClick={() => setSettingsOpen(true)}
          >
            <GearIcon />
          </button>
          <button type="button" className={shell.outlineBtn} onClick={() => setPreviewOpen(true)}>
            <EyeIcon /> Preview
          </button>
          <button
            type="button"
            className={shell.primaryBtn}
            onClick={() => void publish()}
            disabled={busy || hasConflict}
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </header>

      {hasConflict ? (
        <div className={shell.banner} role="alert">
          <span>
            <strong>Conflict.</strong> This funnel was changed in another tab or session, so your
            latest edits were not saved. Reload to get the newest version (unsaved edits here will
            be lost).
          </span>
          <button type="button" className={shell.primaryBtn} onClick={reloadLatest}>
            Reload latest
          </button>
        </div>
      ) : null}

      <div className={shell.body}>
        <aside className={shell.left} data-panel="screens" aria-label="Screens and elements">
          <div className={shell.tabs} role="tablist" aria-label="Left panel">
            <button
              type="button"
              role="tab"
              className={shell.tab}
              aria-selected={leftTab === 'screens'}
              onClick={() => setLeftTab('screens')}
            >
              Screens <span className={shell.tabCount}>{definition.screens.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              className={shell.tab}
              aria-selected={leftTab === 'elements'}
              onClick={() => {
                setLeftTab('elements');
                setMode('editor');
              }}
            >
              Elements <span className={shell.tabCount}>{elementCount}</span>
            </button>
          </div>

          <div className={shell.leftScroll} hidden={leftTab !== 'screens'}>
            <label className={shell.search}>
              <SearchIcon size={14} />
              <input
                type="search"
                placeholder="Find screens..."
                aria-label="Find screens"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <ol className={shell.screenList}>
              {visibleScreens.map((screen, visibleIndex) => {
                const groupName = screen.group?.trim() ?? '';
                const prevGroup = visibleScreens[visibleIndex - 1]?.group?.trim() ?? '';
                const groupLabel =
                  groupName !== '' && groupName !== prevGroup ? (
                    <li key={`group-${screen.id}`} className={shell.groupLabel} aria-hidden="true">
                      <UsersIcon size={12} /> {groupName}
                    </li>
                  ) : null;
                const index = definition.screens.indexOf(screen);
                const meta = SCREEN_META[screen.type];
                const severity = severityByScreen.get(screen.id);
                const isSelected = screen.id === selected?.id;
                return [
                  groupLabel,
                  <li
                    key={screen.id}
                    className={shell.screenRow}
                    data-grouped={groupName !== ''}
                    data-selected={isSelected}
                    data-dragging={dragId === screen.id}
                    draggable={normalizedQuery === ''}
                    onDragStart={(e) => {
                      setDragId(screen.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={(e) => {
                      if (dragId) e.preventDefault();
                    }}
                    onDrop={(e) => onRowDrop(e, screen.id)}
                    style={{ '--type-color': meta.color } as CSSProperties}
                  >
                    <button
                      type="button"
                      className={shell.screenMain}
                      aria-current={isSelected ? 'true' : undefined}
                      onClick={() => openScreen(screen.id)}
                      onDoubleClick={() => setMode('editor')}
                    >
                      <span className={shell.thumb} aria-hidden="true">
                        <span className={shell.thumbIsland} />
                        <span className={shell.thumbAccent} />
                        <span className={shell.thumbLine} />
                        <span className={shell.thumbLineShort} />
                        <span className={shell.thumbCta} />
                      </span>
                      <span className={shell.screenText}>
                        <span className={shell.screenTitle}>
                          {screen.title || screen.id}
                          {severity ? (
                            <span
                              className={shell.severityDot}
                              data-severity={severity}
                              aria-label={`has ${severity}s`}
                              role="img"
                            />
                          ) : null}
                        </span>
                        <span className={shell.screenMeta}>
                          {index + 1} · /{screen.id}
                          {screen.id === definition.startScreenId ? (
                            <span className={shell.startBadge}>Start</span>
                          ) : null}
                        </span>
                      </span>
                    </button>
                    <div className={shell.menuHost} data-menu>
                      <button
                        type="button"
                        className={shell.rowMenuBtn}
                        aria-label={`Actions for ${screen.title || screen.id}`}
                        aria-expanded={rowMenu === screen.id}
                        onClick={() => setRowMenu((m) => (m === screen.id ? null : screen.id))}
                      >
                        <DotsIcon />
                      </button>
                      {rowMenu === screen.id ? (
                        <ul className={shell.menu} data-anchor="row" role="menu">
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              className={shell.menuItem}
                              disabled={screen.id === definition.startScreenId}
                              onClick={() => setStart(screen.id)}
                            >
                              Set as start screen
                            </button>
                          </li>
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              className={shell.menuItemDanger}
                              onClick={() => deleteScreen(screen.id)}
                            >
                              Delete screen
                            </button>
                          </li>
                        </ul>
                      ) : null}
                    </div>
                  </li>,
                ];
              })}
            </ol>
            {visibleScreens.length === 0 ? (
              <p className={shell.emptyNote}>No screens match "{query}".</p>
            ) : null}
          </div>

          <div className={shell.leftScroll} hidden={leftTab !== 'elements'}>
            <section className={shell.elementsSection} aria-label="Layers">
              <h3 className={shell.sectionTitle}>On this screen</h3>
              <div ref={outlineSlotRef} className={shell.outlineSlot} />
            </section>
            <section className={shell.elementsSection} aria-label="Add elements">
              <h3 className={shell.sectionTitle}>Add elements</h3>
              <p className={shell.muted}>Drag onto the phone to add.</p>
              <div ref={blocksSlotRef} className={shell.blocksSlot} />
            </section>
          </div>

          <div className={shell.leftFoot}>
            <div className={shell.menuHost} data-menu>
              <button
                type="button"
                className={shell.footPrimary}
                aria-expanded={addMenu === 'bottom'}
                onClick={() => setAddMenu((m) => (m === 'bottom' ? null : 'bottom'))}
              >
                <PlusIcon size={14} /> Screen
              </button>
              {addMenuList('bottom')}
            </div>
            <button
              type="button"
              className={shell.footGhost}
              disabled={!selected}
              onClick={addGroup}
              title="Put the selected screen into a new group"
            >
              <UsersIcon size={14} /> Group
            </button>
          </div>
        </aside>

        <main className={shell.center} data-panel="main">
          <div className={shell.stageTools} data-side="left">
            <div className={shell.toolGroup}>
              <button
                type="button"
                className={shell.toolBtn}
                aria-label="Undo"
                disabled={mode !== 'editor' || !bridge.canUndo}
                onClick={() => commandsRef.current?.undo()}
              >
                <Undo size={15} />
              </button>
              <button
                type="button"
                className={shell.toolBtn}
                aria-label="Redo"
                disabled={mode !== 'editor' || !bridge.canRedo}
                onClick={() => commandsRef.current?.redo()}
              >
                <Redo size={15} />
              </button>
            </div>
          </div>
          <div className={shell.stageTools} data-side="right">
            <button
              type="button"
              className={shell.localizeBtn}
              disabled
              title="Localization is coming soon"
            >
              <TranslateIcon size={14} /> Localize
            </button>
            <span className={shell.stageMeta}>
              {mode === 'editor'
                ? `${selectedIndex + 1} / ${definition.screens.length} · ${selected?.title ?? ''}`
                : `${definition.screens.length} screens · ${definition.edges.length} connections`}
            </span>
          </div>

          <div className={shell.stage} hidden={mode !== 'editor'}>
            <div className={shell.phone}>
              <span className={shell.island} aria-hidden="true" />
              <div className={shell.phoneScreen} style={phoneStyle}>
                {selected ? (
                  <div className={shell.phoneHeader}>
                    <ScreenHeaderBar
                      definition={definition}
                      screen={selected}
                      position={selectedPosition}
                      canGoBack={selectedPosition.step > 1}
                    />
                  </div>
                ) : null}
                <div ref={previewSlotRef} className={shell.previewSlot} />
              </div>
            </div>
            <p className={shell.hintPill}>
              {bridge.selection ? `Editing ${bridge.selection.label}` : 'Tap any element to edit'}
            </p>
          </div>

          {mode === 'flow' ? (
            <div className={shell.flowStage}>
              <ScreenCanvas
                definition={definition}
                selectedId={selected?.id}
                typeMeta={typeMeta}
                severityByScreen={severityByScreen}
                describeEdge={describeEdge}
                onSelect={selectScreen}
                onOpen={(id) => {
                  selectScreen(id);
                  setMode('editor');
                }}
                onConnect={onConnect}
              />
              {pending && pendingSource ? (
                <div className={shell.pendingCard} role="dialog" aria-label="New connection">
                  <strong>
                    Connect {pendingSource.title} to{' '}
                    {screensById.get(pending.target)?.title ?? pending.target}
                  </strong>
                  <div className={shell.inlineFields}>
                    <ConditionPicker
                      source={pendingSource}
                      value={pending.choice}
                      onChange={(choice) => setPending({ ...pending, choice })}
                    />
                  </div>
                  <div className={shell.pendingActions}>
                    <button
                      type="button"
                      className={shell.outlineBtn}
                      onClick={() => setPending(null)}
                    >
                      Cancel
                    </button>
                    <button type="button" className={shell.primaryBtn} onClick={confirmPending}>
                      Add connection
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={shell.rail} role="toolbar" aria-label="Assistant tools">
            <button
              type="button"
              className={shell.railBtn}
              aria-label="AI assistant (coming soon)"
              title="AI assistant (coming soon)"
              disabled
            >
              <MagicIcon size={16} />
            </button>
            <button
              type="button"
              className={shell.railBtn}
              aria-label="Styles"
              title="Styles"
              aria-pressed={rightTab === 'styles'}
              onClick={() => {
                setRightTab((t) => (t === 'styles' ? 'parameters' : 'styles'));
                setNarrowPanel('inspector');
              }}
            >
              <SlidersIcon size={16} />
            </button>
            <button
              type="button"
              className={shell.railBtn}
              aria-label="Comments (coming soon)"
              title="Comments (coming soon)"
              disabled
            >
              <ChatIcon size={16} />
            </button>
          </div>

          <div className={shell.viewSwitch} role="group" aria-label="View">
            <button
              type="button"
              className={shell.viewBtn}
              aria-pressed={mode === 'flow'}
              onClick={() => setMode('flow')}
            >
              <GridIcon size={14} /> Canvas
            </button>
            <button
              type="button"
              className={shell.viewBtn}
              aria-pressed={mode === 'editor'}
              onClick={() => setMode('editor')}
            >
              <PhoneIcon size={14} /> Screen
            </button>
          </div>

          {notice ? (
            <div className={shell.toast} role="status">
              <span>{notice}</span>
              <button
                type="button"
                className={shell.iconBtn}
                aria-label="Dismiss"
                onClick={() => setNotice(null)}
              >
                <CloseIcon size={14} />
              </button>
            </div>
          ) : null}
        </main>

        <aside className={shell.right} data-panel="inspector" aria-label="Settings">
          <div className={shell.tabs} role="tablist" aria-label="Right panel">
            <button
              type="button"
              role="tab"
              className={shell.tab}
              aria-selected={rightTab === 'parameters'}
              onClick={() => setRightTab('parameters')}
            >
              Parameters
            </button>
            <button
              type="button"
              role="tab"
              className={shell.tab}
              aria-selected={rightTab === 'styles'}
              onClick={() => setRightTab('styles')}
            >
              Styles
            </button>
          </div>
          <div className={shell.inspectorScroll}>
            <div hidden={rightTab !== 'parameters'}>
              <div className={shell.inspectorHead}>
                <h2 ref={screenHeadingRef} tabIndex={-1} className={shell.panelTitle}>
                  {elementMode
                    ? (bridge.selection?.label ?? 'Element')
                    : (selected?.title ?? 'Screen')}
                </h2>
                {elementMode ? (
                  <button
                    type="button"
                    className={shell.iconBtn}
                    aria-label="Back to screen parameters"
                    onClick={() => commandsRef.current?.deselect()}
                  >
                    <CloseIcon size={15} />
                  </button>
                ) : null}
              </div>
              <div ref={fieldsSlotRef} className={shell.fieldsSlot} hidden={!elementMode} />
              {elementMode ? (
                <div className={shell.elementActions}>
                  <button
                    type="button"
                    className={shell.plainAction}
                    onClick={() => commandsRef.current?.duplicate()}
                  >
                    <CopyIcon size={15} /> Duplicate element
                  </button>
                  <button
                    type="button"
                    className={shell.dangerLink}
                    onClick={() => commandsRef.current?.remove()}
                  >
                    <TrashIcon size={15} /> Delete element
                  </button>
                </div>
              ) : (
                <>
                  {screenParameters}
                  {mode === 'flow' || issues.length > 0 ? (
                    <div className={shell.validationWrap}>
                      <ValidationPanel
                        issues={issues}
                        checked={saver.timestamp !== null}
                        canSelect={(issue) => issueScreenId(issue) !== undefined}
                        onSelect={selectIssue}
                      />
                    </div>
                  ) : null}
                </>
              )}
            </div>
            <div hidden={rightTab !== 'styles'} className={shell.stylesPane}>
              <p className={shell.muted}>Theme applies to every screen of this funnel.</p>
              <ThemeEditor
                theme={definition.theme}
                onChange={(next) => mutate((d) => ({ ...d, theme: next }))}
              />
              <label className={shell.paramRow}>
                <span className={shell.paramLabel}>Logo URL</span>
                <input
                  className={shell.input}
                  type="url"
                  placeholder="https://…"
                  maxLength={2000}
                  value={definition.theme.logoUrl ?? ''}
                  onChange={(e) =>
                    mutate((d) => ({
                      ...d,
                      theme: {
                        ...d.theme,
                        logoUrl: e.target.value === '' ? undefined : e.target.value,
                      },
                    }))
                  }
                />
              </label>
              <p className={shell.muted}>Shown in screen headers with Show Logo turned on.</p>
            </div>
          </div>
        </aside>
      </div>

      <nav className={shell.narrowNav} aria-label="Editor panels">
        {NARROW_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={shell.narrowTab}
            aria-pressed={narrowPanel === t.id}
            onClick={() => setNarrowPanel(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {selected ? (
        <ScreenEditor
          key={`${selected.id}-${selected.type}`}
          screenId={selected.id}
          screenType={selected.type}
          content={selected.content}
          slots={slots}
          commandsRef={commandsRef}
          onBridgeChange={setBridge}
          onChange={(content) => onContentChange(selected.id, content)}
        />
      ) : null}

      <dialog
        ref={settingsRef}
        className={shell.drawer}
        aria-labelledby="funnel-settings-title"
        onClose={() => setSettingsOpen(false)}
      >
        <div className={shell.drawerHead}>
          <div>
            <h2 id="funnel-settings-title" className={shell.panelTitle}>
              Funnel settings
            </h2>
            <p className={shell.panelSub}>{funnel.name}</p>
          </div>
          <button
            type="button"
            className={shell.iconBtn}
            aria-label="Close settings"
            onClick={() => setSettingsOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        {settingsOpen ? (
          <div className={shell.drawerBody}>
            <div className={styles.panel}>
              <h2 className={styles.panelHeading}>Behaviour</h2>
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={definition.allowCycles === true}
                  onChange={(e) => mutate((d) => ({ ...d, allowCycles: e.target.checked }))}
                />
                Allow cycles
              </label>
            </div>
            <VersionsPanel funnelId={funnel.id} refreshKey={versionsKey} />
            <DomainsPanel funnelId={funnel.id} />
            <PaymentsPanel funnelId={funnel.id} />
            <LeadsPanel funnelId={funnel.id} />
          </div>
        ) : null}
      </dialog>

      <dialog
        ref={previewRef}
        className={shell.previewDialog}
        aria-label="Test run"
        onClose={() => setPreviewOpen(false)}
      >
        <div className={shell.drawerHead}>
          <div className={shell.previewLinks}>
            <Link href={`/preview/${funnel.id}`} target="_blank" className={shell.liveLink}>
              Open saved draft in a new tab <ExternalIcon size={13} />
            </Link>
          </div>
          <button
            type="button"
            className={shell.iconBtn}
            aria-label="Close preview"
            onClick={() => setPreviewOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        {previewOpen ? <PreviewPane funnelId={funnel.id} definition={definition} /> : null}
      </dialog>
    </div>
  );
}
