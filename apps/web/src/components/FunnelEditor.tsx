'use client';

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type {
  CSSProperties,
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import Link from 'next/link';
import { NavLink, NavOverlay } from './NavPending';
import type { Connection } from '@xyflow/react';
import { z } from 'zod';
import {
  MAX_PROGRESS_SEGMENTS,
  MAX_TITLE_LENGTH,
  PROGRESS_TYPES,
  SCREEN_TYPES,
  isQuizScreen,
  quizOf,
} from '@funnel/schema';
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
import { getScreenOptions } from '@/lib/puck/adapters';
import { retypeEdges } from '@/lib/retype-edges';
import { stripScreenRefs } from '@/lib/screen-refs';
import { allowedComponentsForScreenType } from '@/lib/puck/config';
import { createQuizContent, createScreenContent } from '@/lib/puck/templates';
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
import { ElementInspector } from './ElementInspector';
import { ScreenStyles } from './ScreenStyles';
import { inheritedScreenStyle, screenSurface } from '@/lib/styles';
import { ThemeDefaults } from './ThemeDefaults';
import { ValidationPanel } from './ValidationPanel';
import { VersionsPanel } from './VersionsPanel';
import { DomainsPanel } from './DomainsPanel';
import { LeadsPanel } from './LeadsPanel';
import { PaymentsPanel } from './PaymentsPanel';
import { ScreenCanvas } from './ScreenCanvas';
import { ScreenHeaderBar } from './ScreenHeaderBar';
import { AssistantPanel } from './assistant/AssistantPanel';
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
  DuplicateIcon,
  ExternalIcon,
  EyeIcon,
  GearIcon,
  GridIcon,
  InsertAfterIcon,
  InsertBeforeIcon,
  LogoMark,
  MagicIcon,
  PasteIcon,
  PhoneIcon,
  PlayIcon,
  PlusIcon,
  Redo,
  RenameIcon,
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

type PanelSide = 'left' | 'right';

interface ScreenMenuState {
  id: string;
  x: number;
  y: number;
  insert?: 'before' | 'after';
}

const PANEL_LIMITS: Record<PanelSide, { min: number; max: number }> = {
  left: { min: 200, max: 480 },
  right: { min: 280, max: 600 },
};
const CENTER_MIN = 360;
const PANEL_STORAGE_KEY = 'funnel-editor-panels';
const MENU_WIDTH = 220;

function readPanelWidths(): Record<PanelSide, number | null> {
  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(PANEL_STORAGE_KEY) ?? 'null');
    const parsed = z
      .object({ left: z.number().nullable(), right: z.number().nullable() })
      .safeParse(raw);
    if (parsed.success) return parsed.data;
  } catch {
    return { left: null, right: null };
  }
  return { left: null, right: null };
}

function writePanelWidths(widths: Record<PanelSide, number | null>) {
  try {
    window.localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(widths));
  } catch {
    return;
  }
}

function isMacPlatform(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);
}

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
  default: { label: 'Default', color: '#6e56f8' },
  auth: { label: 'Auth', color: '#0ea5e9' },
  paywall: { label: 'Paywall', color: '#9aa0ad' },
  checkout: { label: 'Checkout', color: '#1f8a5b' },
  upsell: { label: 'Upsell', color: '#db2777' },
  finish: { label: 'Finish', color: '#e89a2a' },
};

type AddChoice = {
  key: string;
  label: string;
  hint: string;
  type: ScreenType;
  quiz?: 'single' | 'multi';
};

const ADD_CHOICES: AddChoice[] = [
  { key: 'default', label: 'Default', hint: 'Blank screen', type: 'default' },
  { key: 'single', label: 'Question', hint: 'Single choice', type: 'default', quiz: 'single' },
  { key: 'multi', label: 'Multi-choice', hint: 'Multiple choice', type: 'default', quiz: 'multi' },
  { key: 'auth', label: 'Auth', hint: 'Email capture', type: 'auth' },
  { key: 'paywall', label: 'Paywall', hint: 'Plans', type: 'paywall' },
  { key: 'checkout', label: 'Checkout', hint: 'Payment', type: 'checkout' },
  { key: 'upsell', label: 'Upsell', hint: 'One-click offer', type: 'upsell' },
  { key: 'finish', label: 'Finish', hint: 'Thank you', type: 'finish' },
];

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

function newScreen(type: ScreenType, index: number, quiz?: 'single' | 'multi'): Screen {
  return {
    id: shortId('screen'),
    type,
    title: quiz ? (quiz === 'single' ? 'Question' : 'Multi-choice') : SCREEN_META[type].label,
    content: quiz ? createQuizContent(quiz) : createScreenContent(type),
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
  const [screenMenu, setScreenMenu] = useState<ScreenMenuState | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; draft: string } | null>(null);
  const [clipboard, setClipboard] = useState<Screen | null>(null);
  const [panelWidths, setPanelWidths] = useState<Record<PanelSide, number | null>>({
    left: null,
    right: null,
  });
  const [resizing, setResizing] = useState<PanelSide | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLElement>(null);
  const rightRef = useRef<HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>('screens');
  const [addingElement, setAddingElement] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('parameters');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [contentEpoch, setContentEpoch] = useState(0);
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
    setScreenMenu(null);
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

  const addScreen = (type: ScreenType, quiz?: 'single' | 'multi') => {
    const screen = newScreen(type, definition.screens.length, quiz);
    mutate((d) => ({ ...d, screens: [...d.screens, screen] }));
    selectScreen(screen.id);
    setAddMenu(null);
  };

  const deleteScreen = (id: string) => {
    setScreenMenu(null);
    if (id === definition.startScreenId) {
      setNotice('The start screen cannot be deleted. Set another start screen first.');
      return;
    }
    const screen = screensById.get(id);
    if (!window.confirm(`Delete the screen "${screen?.title ?? id}" and its connections?`)) return;
    let openChanged = false;
    mutate((d) => ({
      ...d,
      screens: d.screens
        .filter((s) => s.id !== id)
        .map((s) => {
          const cleaned = stripScreenRefs(s, id, { destinations: true });
          if (cleaned !== s && s.id === selected?.id) openChanged = true;
          return cleaned;
        }),
      edges: d.edges.filter((e) => e.sourceScreenId !== id && e.targetScreenId !== id),
    }));
    if (openChanged) setContentEpoch((n) => n + 1);
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
    setScreenMenu(null);
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

  const insertScreen = (screen: Screen, anchorId: string, place: 'before' | 'after') => {
    mutate((d) => {
      const anchor = d.screens.findIndex((s) => s.id === anchorId);
      const screens = [...d.screens];
      const at = anchor < 0 ? screens.length : place === 'before' ? anchor : anchor + 1;
      screens.splice(at, 0, screen);
      return { ...d, screens };
    });
    selectScreen(screen.id);
    setNotice(null);
  };

  const cloneScreen = (source: Screen): Screen => ({
    ...structuredClone(source),
    id: shortId('screen'),
    title: source.title ? `${source.title} copy`.slice(0, MAX_TITLE_LENGTH) : 'Copy',
    position: { x: source.position.x + 40, y: source.position.y + 40 },
  });

  const insertNewScreen = (
    anchorId: string,
    place: 'before' | 'after',
    type: ScreenType,
    quiz?: 'single' | 'multi',
  ) => {
    const anchor = screensById.get(anchorId);
    const screen = newScreen(type, definition.screens.length, quiz);
    if (anchor) screen.position = { x: anchor.position.x + 40, y: anchor.position.y + 40 };
    insertScreen(screen, anchorId, place);
  };

  const copyScreen = (id: string) => {
    setScreenMenu(null);
    const screen = screensById.get(id);
    if (!screen) return;
    setClipboard(structuredClone(screen));
    setNotice(`Copied "${screen.title || screen.id}". Paste with the screen menu or Ctrl+V.`);
  };

  const duplicateScreen = (id: string) => {
    setScreenMenu(null);
    const screen = screensById.get(id);
    if (screen) insertScreen(cloneScreen(screen), id, 'after');
  };

  const pasteScreen = (anchorId: string) => {
    setScreenMenu(null);
    if (clipboard) insertScreen(cloneScreen(clipboard), anchorId, 'after');
  };

  const startRename = (id: string) => {
    setScreenMenu(null);
    const screen = screensById.get(id);
    if (screen) setRenaming({ id, draft: screen.title });
  };

  const commitRename = () => {
    if (!renaming) return;
    const title = renaming.draft.trim();
    if (title !== '' && title !== screensById.get(renaming.id)?.title) {
      updateScreen(renaming.id, { title });
    }
    setRenaming(null);
  };

  const openScreenMenu = (id: string, x: number, y: number) => {
    const maxX = window.innerWidth - MENU_WIDTH - 8;
    const maxY = window.innerHeight - 360;
    setScreenMenu({ id, x: Math.max(8, Math.min(x, maxX)), y: Math.max(8, Math.min(y, maxY)) });
    setAddMenu(null);
  };

  const onScreenListKeyDown = (event: ReactKeyboardEvent<HTMLOListElement>) => {
    if (!(event.target instanceof HTMLElement) || event.target.closest('input')) return;
    const row = event.target.closest<HTMLElement>('[data-screen-id]');
    const id = row?.dataset.screenId;
    if (!id) return;
    const mod = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();
    if (mod && key === 'c') copyScreen(id);
    else if (mod && key === 'd') duplicateScreen(id);
    else if (mod && key === 'v') pasteScreen(id);
    else if (!mod && (event.key === 'Delete' || event.key === 'Backspace')) deleteScreen(id);
    else if (!mod && event.key === 'F2') startRename(id);
    else if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
      const rect = event.target.getBoundingClientRect();
      openScreenMenu(id, rect.left + 24, rect.bottom);
    } else return;
    event.preventDefault();
  };

  const panelLimit = (side: PanelSide, otherWidth: number) => {
    const bodyWidth = bodyRef.current?.clientWidth ?? window.innerWidth;
    const { min, max } = PANEL_LIMITS[side];
    return { min, max: Math.max(min, Math.min(max, bodyWidth - otherWidth - CENTER_MIN)) };
  };

  const applyPanelWidth = (side: PanelSide, width: number | null) => {
    setPanelWidths((current) => {
      const next = { ...current, [side]: width };
      writePanelWidths(next);
      return next;
    });
  };

  const startPanelResize = (side: PanelSide, event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const panel = (side === 'left' ? leftRef : rightRef).current;
    const other = (side === 'left' ? rightRef : leftRef).current;
    const body = bodyRef.current;
    if (!panel || !body) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startWidth = panel.getBoundingClientRect().width;
    const { min, max } = panelLimit(side, other?.getBoundingClientRect().width ?? 0);
    let width = startWidth;
    setResizing(side);
    const onMove = (e: PointerEvent) => {
      const delta = side === 'left' ? e.clientX - startX : startX - e.clientX;
      width = Math.round(Math.max(min, Math.min(max, startWidth + delta)));
      body.style.setProperty(side === 'left' ? '--left-w' : '--right-w', `${width}px`);
    };
    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      setResizing(null);
      if (width !== startWidth) applyPanelWidth(side, width);
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  };

  const onResizeKey = (side: PanelSide, event: ReactKeyboardEvent<HTMLDivElement>) => {
    const panel = (side === 'left' ? leftRef : rightRef).current;
    const other = (side === 'left' ? rightRef : leftRef).current;
    if (!panel) return;
    const grow = side === 'left' ? 'ArrowRight' : 'ArrowLeft';
    const shrink = side === 'left' ? 'ArrowLeft' : 'ArrowRight';
    if (event.key !== grow && event.key !== shrink && event.key !== 'Home') return;
    event.preventDefault();
    if (event.key === 'Home') {
      applyPanelWidth(side, null);
      return;
    }
    const { min, max } = panelLimit(side, other?.getBoundingClientRect().width ?? 0);
    const step = event.shiftKey ? 48 : 16;
    const current = panel.getBoundingClientRect().width;
    const next = current + (event.key === grow ? step : -step);
    applyPanelWidth(side, Math.round(Math.max(min, Math.min(max, next))));
  };

  const resizeHandle = (side: PanelSide) => (
    <div
      className={shell.resizeHandle}
      data-side={side}
      data-active={resizing === side}
      role="separator"
      aria-orientation="vertical"
      aria-label={side === 'left' ? 'Resize screens panel' : 'Resize settings panel'}
      aria-valuemin={PANEL_LIMITS[side].min}
      aria-valuemax={PANEL_LIMITS[side].max}
      aria-valuenow={panelWidths[side] ?? undefined}
      tabIndex={0}
      title="Drag to resize, double-click to reset"
      onPointerDown={(e) => startPanelResize(side, e)}
      onDoubleClick={() => applyPanelWidth(side, null)}
      onKeyDown={(e) => onResizeKey(side, e)}
    />
  );

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
    const isQuiz = isQuizScreen(sourceScreen);
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
    const stored = readPanelWidths();
    if (stored.left === null && stored.right === null) return;
    const frame = requestAnimationFrame(() => setPanelWidths(stored));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!addMenu && !screenMenu) return;
    const closeAll = () => {
      setAddMenu(null);
      setScreenMenu(null);
    };
    const close = (event: MouseEvent | globalThis.KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') return;
      } else if (event.target instanceof Element && event.target.closest('[data-menu]')) {
        return;
      }
      closeAll();
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    window.addEventListener('resize', closeAll);
    window.addEventListener('blur', closeAll);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
      window.removeEventListener('resize', closeAll);
      window.removeEventListener('blur', closeAll);
    };
  }, [addMenu, screenMenu]);

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
    const kept = screen.content.content.filter((item) => allowed.has(item.type));
    const retyped = retypeEdges(definition.edges, screen, type, kept);
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
    const lostQuiz =
      isQuizScreen(screen) && !isQuizScreen({ content: { ...screen.content, content: kept } });
    let openChanged = false;
    mutate((d) => ({
      ...d,
      edges: retypeEdges(d.edges, screen, type, kept).edges,
      screens: d.screens.map((s) => {
        if (s.id === screen.id) {
          return {
            ...s,
            type,
            content: {
              ...s.content,
              content: s.content.content.filter((item) => allowed.has(item.type)),
            },
          };
        }
        if (!lostQuiz) return s;
        const cleaned = stripScreenRefs(s, screen.id, { destinations: false });
        if (cleaned !== s && s.id === selected?.id) openChanged = true;
        return cleaned;
      }),
    }));
    if (openChanged) setContentEpoch((n) => n + 1);
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
  const surface = screenSurface(selected, theme);
  const phoneStyle = {
    '--funnel-primary': theme.primaryColor,
    '--funnel-on-primary': contrastingForeground(theme.primaryColor),
    background: theme.backgroundColor,
    color: theme.textColor,
    fontSize: `${theme.fontScale ?? 1}rem`,
  } as CSSProperties;

  const elementMode = mode === 'editor' && bridge.selection !== null;

  const [editHost, setEditHost] = useState<HTMLDivElement | null>(null);
  const canvasDefinition = useDeferredValue(definition);
  const canvasScreens = canvasDefinition.screens;
  const describeEdge = useCallback(
    (edge: Edge) =>
      describeCondition(
        edge.condition,
        canvasScreens.find((s) => s.id === edge.sourceScreenId),
      ),
    [canvasScreens],
  );
  const severityKey = [...severityByScreen].map(([id, sev]) => `${id}:${sev}`).join('|');
  const latest = useRef({ onConnect, onContentChange, selectScreen });
  useLayoutEffect(() => {
    latest.current = { onConnect, onContentChange, selectScreen };
  });
  const stableConnect = useCallback((c: Connection) => latest.current.onConnect(c), []);
  const focusScreen = useCallback((id: string) => {
    latest.current.selectScreen(id);
    setMode('editor');
  }, []);
  const contentChange = useCallback(
    (id: string, content: PuckData) => latest.current.onContentChange(id, content),
    [],
  );
  const screenList = useMemo(
    () => canvasDefinition.screens.map((sc) => ({ id: sc.id, title: sc.title })),
    [canvasDefinition.screens],
  );

  const renderEditing = () =>
    selected ? (
      <div
        className={shell.phoneScreen}
        style={{ ...phoneStyle, ...surface.surface }}
        onMouseDown={(e) => {
          if (!(e.target instanceof Element)) return;
          if (e.target.closest('[data-puck-component], button, input, a')) return;
          if (bridge.selection) commandsRef.current?.deselect();
        }}
      >
        {surface.videoUrl ? (
          <video
            key={surface.videoUrl}
            className={shell.phoneVideo}
            src={surface.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        ) : null}
        <div className={shell.phoneHeader}>
          <ScreenHeaderBar
            definition={definition}
            screen={selected}
            position={selectedPosition}
            canGoBack={selectedPosition.step > 1}
          />
        </div>
        <div ref={previewSlotRef} className={shell.previewSlot} style={surface.body} />
      </div>
    ) : null;
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
  const modKey = isMacPlatform() ? '⌘' : 'Ctrl+';

  const addMenuList = (anchor: AddMenuAnchor) =>
    addMenu === anchor ? (
      <ul
        className={shell.menu}
        data-menu
        data-anchor={anchor}
        role="menu"
        aria-label="Screen type"
      >
        {ADD_CHOICES.map((c) => (
          <li key={c.key} role="none">
            <button
              type="button"
              role="menuitem"
              className={shell.menuItem}
              onClick={() => addScreen(c.type, c.quiz)}
            >
              <span
                className={shell.menuSwatch}
                style={{ background: SCREEN_META[c.type].color }}
              />
              {c.label}
              <span className={shell.menuHint}>{c.hint}</span>
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
            maxLength={MAX_TITLE_LENGTH}
            onChange={(e) =>
              updateScreen(selected.id, { title: e.target.value.slice(0, MAX_TITLE_LENGTH) })
            }
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
        {selected.autoNavigation && quizOf(selected)?.mode !== 'single' ? (
          <p className={shell.muted}>
            Auto navigation works on screens with a single-choice Options element.
          </p>
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
          <NavLink
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
          </NavLink>
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

      <div
        ref={bodyRef}
        className={shell.body}
        data-resizing={resizing ?? undefined}
        style={
          {
            ...(panelWidths.left !== null ? { '--left-w': `${panelWidths.left}px` } : {}),
            ...(panelWidths.right !== null ? { '--right-w': `${panelWidths.right}px` } : {}),
          } as CSSProperties
        }
      >
        <aside
          ref={leftRef}
          className={shell.left}
          data-panel="screens"
          aria-label="Screens and elements"
        >
          {resizeHandle('left')}
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
            <ol className={shell.screenList} onKeyDown={onScreenListKeyDown}>
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
                const isRenaming = renaming?.id === screen.id;
                const menuOpen = screenMenu?.id === screen.id;
                const thumb = (
                  <span className={shell.thumb} aria-hidden="true">
                    <span className={shell.thumbIsland} />
                    <span className={shell.thumbAccent} />
                    <span className={shell.thumbLine} />
                    <span className={shell.thumbLineShort} />
                    <span className={shell.thumbCta} />
                  </span>
                );
                const metaLine = (
                  <span className={shell.screenMeta}>
                    {index + 1} · /{screen.id}
                    {screen.id === definition.startScreenId ? (
                      <span className={shell.startBadge}>Start</span>
                    ) : null}
                  </span>
                );
                return [
                  groupLabel,
                  <li
                    key={screen.id}
                    className={shell.screenRow}
                    data-screen-id={screen.id}
                    data-grouped={groupName !== ''}
                    data-selected={isSelected}
                    data-menu-open={menuOpen}
                    data-dragging={dragId === screen.id}
                    draggable={normalizedQuery === '' && !isRenaming}
                    onDragStart={(e) => {
                      setDragId(screen.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={(e) => {
                      if (dragId) e.preventDefault();
                    }}
                    onDrop={(e) => onRowDrop(e, screen.id)}
                    onContextMenu={(e) => {
                      if (isRenaming) return;
                      e.preventDefault();
                      selectScreen(screen.id);
                      openScreenMenu(screen.id, e.clientX, e.clientY);
                    }}
                    style={{ '--type-color': meta.color } as CSSProperties}
                  >
                    {isRenaming ? (
                      <div className={shell.screenMain} data-renaming="true">
                        {thumb}
                        <span className={shell.screenText}>
                          <input
                            className={shell.renameInput}
                            aria-label="Screen name"
                            maxLength={200}
                            autoFocus
                            value={renaming.draft}
                            onFocus={(e) => e.currentTarget.select()}
                            onChange={(e) => setRenaming({ id: screen.id, draft: e.target.value })}
                            onBlur={commitRename}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename();
                              if (e.key === 'Escape') setRenaming(null);
                            }}
                          />
                          {metaLine}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={shell.screenMain}
                        aria-current={isSelected ? 'true' : undefined}
                        onClick={() => openScreen(screen.id)}
                        onDoubleClick={() => setMode('editor')}
                      >
                        {thumb}
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
                          {metaLine}
                        </span>
                      </button>
                    )}
                    <div className={shell.menuHost} data-menu>
                      <button
                        type="button"
                        className={shell.rowMenuBtn}
                        aria-label={`Actions for ${screen.title || screen.id}`}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        onClick={(e) => {
                          if (menuOpen) {
                            setScreenMenu(null);
                            return;
                          }
                          const rect = e.currentTarget.getBoundingClientRect();
                          openScreenMenu(screen.id, rect.right - MENU_WIDTH, rect.bottom + 4);
                        }}
                      >
                        <DotsIcon />
                      </button>
                    </div>
                  </li>,
                ];
              })}
            </ol>
            {visibleScreens.length === 0 ? (
              <p className={shell.emptyNote}>No screens match "{query}".</p>
            ) : null}
          </div>

          <div className={shell.leftScroll} hidden={leftTab !== 'elements' || addingElement}>
            <div ref={outlineSlotRef} className={shell.outlineSlot} />
          </div>
          <div className={shell.leftScroll} hidden={leftTab !== 'elements' || !addingElement}>
            <div className={shell.addTitle}>
              <button
                type="button"
                className={shell.iconBtn}
                aria-label="Close add element"
                onClick={() => setAddingElement(false)}
              >
                <CloseIcon size={14} />
              </button>
              <h3>Add Element</h3>
            </div>
            <div ref={blocksSlotRef} className={shell.blocksSlot} />
          </div>

          <div className={shell.leftFoot} hidden={leftTab !== 'elements' || addingElement}>
            <button
              type="button"
              className={shell.footWide}
              onClick={() => {
                setAddingElement(true);
                setMode('editor');
              }}
            >
              <PlusIcon size={14} /> Add element
            </button>
          </div>

          <div className={shell.leftFoot} hidden={leftTab !== 'screens'}>
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
          <NavOverlay />
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

          <div className={shell.flowStage}>
            <ScreenCanvas
              definition={canvasDefinition}
              mode={mode}
              selectedId={selected?.id}
              showPill={!elementMode}
              onEditHost={setEditHost}
              typeMeta={typeMeta}
              severityKey={severityKey}
              describeEdge={describeEdge}
              onFocusScreen={focusScreen}
              onConnect={stableConnect}
            />
            {editHost ? createPortal(renderEditing(), editHost) : null}
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
            {mode === 'editor' ? (
              <p className={shell.canvasHint}>
                {bridge.selection
                  ? `Editing ${bridge.selection.label} · click the empty screen area to edit the screen`
                  : 'Click any element to edit it · Canvas zooms out to the whole funnel'}
              </p>
            ) : null}
          </div>

          <div className={shell.rail} role="toolbar" aria-label="Assistant tools">
            <button
              type="button"
              className={shell.railBtn}
              aria-label="AI assistant"
              title="AI assistant"
              aria-pressed={assistantOpen}
              onClick={() => {
                setAssistantOpen((v) => !v);
                setNarrowPanel('inspector');
              }}
            >
              <MagicIcon size={16} />
            </button>
            <button
              type="button"
              className={shell.railBtn}
              aria-label="Styles"
              title="Styles"
              aria-pressed={!assistantOpen && rightTab === 'styles'}
              onClick={() => {
                setAssistantOpen(false);
                setRightTab((t) =>
                  assistantOpen ? 'styles' : t === 'styles' ? 'parameters' : 'styles',
                );
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

        <aside ref={rightRef} className={shell.right} data-panel="inspector" aria-label="Settings">
          {resizeHandle('right')}
          <AssistantPanel
            hidden={!assistantOpen}
            definition={definition}
            selected={selected}
            typeMeta={typeMeta}
            issues={issues}
            issueScreenId={issueScreenId}
            onSelectScreen={(id) => {
              selectScreen(id);
              commandsRef.current?.deselect();
            }}
            onClose={() => setAssistantOpen(false)}
          />
          <div
            className={shell.tabs}
            role="tablist"
            aria-label="Right panel"
            style={assistantOpen ? { display: 'none' } : undefined}
          >
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
          <div
            className={shell.inspectorScroll}
            style={assistantOpen ? { display: 'none' } : undefined}
          >
            {elementMode && bridge.selection && selected ? (
              <ElementInspector
                key={bridge.selection.id}
                element={bridge.selection}
                tab={rightTab}
                screen={selected}
                screens={definition.screens}
                theme={definition.theme}
                fieldsSlotRef={fieldsSlotRef}
                onBack={() => commandsRef.current?.deselect()}
                onUpdate={(patch) => commandsRef.current?.updateProps(patch)}
                onSaveToTheme={(key, style) =>
                  mutate((d) => ({
                    ...d,
                    theme: {
                      ...d.theme,
                      elements: {
                        ...d.theme.elements,
                        [key]: { ...d.theme.elements?.[key], ...style },
                      },
                    },
                  }))
                }
                onDuplicate={() => commandsRef.current?.duplicate()}
                onDelete={() => commandsRef.current?.remove()}
              />
            ) : (
              <>
                <div hidden={rightTab !== 'parameters'}>
                  <div className={shell.inspectorHead}>
                    <h2 ref={screenHeadingRef} tabIndex={-1} className={shell.panelTitle}>
                      {selected?.title ?? 'Screen'}
                    </h2>
                  </div>
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
                </div>
                <div hidden={rightTab !== 'styles'}>
                  <div className={shell.inspectorHead}>
                    <h2 className={shell.panelTitle}>{selected?.title ?? 'Screen'}</h2>
                  </div>
                  {selected ? (
                    <ScreenStyles
                      style={selected.style}
                      inherited={inheritedScreenStyle(definition.theme)}
                      theme={definition.theme}
                      saveLabel="Save as theme default for all screens"
                      onChange={(style) => updateScreen(selected.id, { style })}
                      onSave={() => {
                        const style = selected.style;
                        mutate((d) => ({
                          ...d,
                          theme: { ...d.theme, screen: { ...d.theme.screen, ...style } },
                          screens: d.screens.map((sc) =>
                            sc.id === selected.id ? { ...sc, style: undefined } : sc,
                          ),
                        }));
                      }}
                    />
                  ) : null}
                  <p className={shell.stylesNote}>
                    ⚡ marks values changed on this screen. The whole theme (colors, logo, element
                    and screen defaults) is in Funnel settings → Theme.
                  </p>
                </div>
              </>
            )}
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

      {screenMenu && screensById.has(screenMenu.id) ? (
        <div
          className={shell.contextMenu}
          data-menu
          role="menu"
          aria-label={screenMenu.insert ? 'Screen type' : 'Screen actions'}
          style={{ left: screenMenu.x, top: screenMenu.y, width: MENU_WIDTH }}
        >
          {screenMenu.insert ? (
            <>
              <button
                type="button"
                role="menuitem"
                className={shell.contextBack}
                onClick={() => setScreenMenu({ ...screenMenu, insert: undefined })}
              >
                <ChevronLeft size={14} /> Insert {screenMenu.insert}
              </button>
              <div className={shell.contextSep} role="separator" />
              {ADD_CHOICES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  role="menuitem"
                  className={shell.contextItem}
                  onClick={() => {
                    const place = screenMenu.insert ?? 'after';
                    setScreenMenu(null);
                    insertNewScreen(screenMenu.id, place, c.type, c.quiz);
                  }}
                >
                  <span
                    className={shell.menuSwatch}
                    style={{ background: SCREEN_META[c.type].color }}
                  />
                  {c.label}
                  <span className={shell.menuHint}>{c.hint}</span>
                </button>
              ))}
            </>
          ) : (
            <>
              <div className={shell.contextLabel}>Insert</div>
              <button
                type="button"
                role="menuitem"
                className={shell.contextItem}
                onClick={() => setScreenMenu({ ...screenMenu, insert: 'before' })}
              >
                <InsertBeforeIcon size={15} /> Before
                <ChevronRight size={13} className={shell.contextChevron} />
              </button>
              <button
                type="button"
                role="menuitem"
                className={shell.contextItem}
                onClick={() => setScreenMenu({ ...screenMenu, insert: 'after' })}
              >
                <InsertAfterIcon size={15} /> After
                <ChevronRight size={13} className={shell.contextChevron} />
              </button>
              <div className={shell.contextSep} role="separator" />
              <button
                type="button"
                role="menuitem"
                className={shell.contextItem}
                onClick={() => startRename(screenMenu.id)}
              >
                <RenameIcon size={15} /> Rename
                <kbd className={shell.contextKbd}>F2</kbd>
              </button>
              <button
                type="button"
                role="menuitem"
                className={shell.contextItem}
                onClick={() => copyScreen(screenMenu.id)}
              >
                <CopyIcon size={15} /> Copy
                <kbd className={shell.contextKbd}>{modKey}C</kbd>
              </button>
              <button
                type="button"
                role="menuitem"
                className={shell.contextItem}
                onClick={() => duplicateScreen(screenMenu.id)}
              >
                <DuplicateIcon size={15} /> Duplicate
                <kbd className={shell.contextKbd}>{modKey}D</kbd>
              </button>
              <button
                type="button"
                role="menuitem"
                className={shell.contextItem}
                disabled={!clipboard}
                onClick={() => pasteScreen(screenMenu.id)}
              >
                <PasteIcon size={15} /> Paste
                <kbd className={shell.contextKbd}>{modKey}V</kbd>
              </button>
              <div className={shell.contextSep} role="separator" />
              <button
                type="button"
                role="menuitem"
                className={shell.contextItem}
                disabled={screenMenu.id === definition.startScreenId}
                onClick={() => setStart(screenMenu.id)}
              >
                <PlayIcon size={15} /> Set as start
              </button>
              <button
                type="button"
                role="menuitem"
                className={shell.contextItem}
                data-danger="true"
                disabled={screenMenu.id === definition.startScreenId}
                onClick={() => deleteScreen(screenMenu.id)}
              >
                <TrashIcon size={15} /> Delete
                <kbd className={shell.contextKbd}>Del</kbd>
              </button>
            </>
          )}
        </div>
      ) : null}

      {selected ? (
        <ScreenEditor
          key={`${selected.id}-${selected.type}-${contentEpoch}`}
          screenId={selected.id}
          screenType={selected.type}
          theme={canvasDefinition.theme}
          screens={screenList}
          content={selected.content}
          slots={slots}
          commandsRef={commandsRef}
          onBridgeChange={setBridge}
          onChange={contentChange}
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
              <h2 className={styles.panelHeading}>Theme</h2>
              <ThemeEditor
                theme={definition.theme}
                onChange={(next) => mutate((d) => ({ ...d, theme: next }))}
              />
              <label className={styles.field}>
                Logo URL
                <input
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
            </div>
            <div className={styles.panel}>
              <h2 className={styles.panelHeading}>Theme defaults</h2>
              <ThemeDefaults
                theme={definition.theme}
                onChange={(theme) => mutate((d) => ({ ...d, theme }))}
              />
            </div>
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
