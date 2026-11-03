'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Drawer, createUsePuck } from '@puckeditor/core';
import type { ScreenType } from '@funnel/schema';
import { CATALOG_BY_TYPE, CATEGORIES, PRESETS } from '@/lib/puck/catalog';
import type { CategoryId, Preset } from '@/lib/puck/catalog';
import { puckConfig } from '@/lib/puck/config';
import { insertTracker, newElementId } from '@/lib/puck/insert-tracker';
import { ChevronLeft, ChevronRight, PlusIcon, SearchIcon } from './EditorIcons';
import shell from './EditorShell.module.css';

const usePuck = createUsePuck();
const ROOT_ZONE = 'root:default-zone';
const NO_PREVIEW = new Set([
  'Columns',
  'Rows',
  'Carousel',
  'CheckoutBlock',
  'RawHtml',
  'Lottie',
  'Video',
]);

function isAttached(props: Record<string, unknown>): boolean {
  const style = props.style;
  return (
    typeof style === 'object' &&
    style !== null &&
    'position' in style &&
    style.position === 'attached'
  );
}

function presetProps(preset: Preset): Record<string, unknown> {
  const defaults = puckConfig.components[preset.type]?.defaultProps ?? {};
  return { ...defaults, ...preset.props };
}

function Preview({ preset }: { preset: Preset }) {
  const component = puckConfig.components[preset.type];
  if (!component || NO_PREVIEW.has(preset.type)) {
    const entry = CATALOG_BY_TYPE.get(preset.type);
    return <span className={shell.previewFallback}>{entry?.label ?? preset.label}</span>;
  }
  const props = {
    ...presetProps(preset),
    id: `preview-${preset.id}`,
    puck: { isEditing: false, renderDropZone: () => null, metadata: {}, dragRef: null },
    editMode: false,
  };
  const Render = component.render as (p: Record<string, unknown>) => ReactNode;
  return (
    <div className={shell.previewStage} aria-hidden="true" inert>
      <div className={shell.previewScale}>{Render(props)}</div>
    </div>
  );
}

function useApplyPresets() {
  const dispatch = usePuck((s) => s.dispatch);
  const content = usePuck((s) => s.appState.data.content);
  const known = useRef<Set<string> | null>(null);
  useEffect(() => {
    const ids = content.map((item) => String(item.props.id));
    const previous = known.current;
    known.current = new Set(ids);
    if (previous === null) return;
    const action = insertTracker.lastAction;
    insertTracker.lastAction = '';
    const armed = insertTracker.pending;
    if (action !== 'duplicate' && armed === null) return;
    content.forEach((item, index) => {
      const id = String(item.props.id);
      if (previous.has(id)) return;
      const pending = insertTracker.pending;
      const preset = pending && pending.type === item.type ? pending : null;
      if (preset) insertTracker.pending = null;
      if (!preset && id.startsWith('el_')) return;
      const nextId = id.startsWith('el_') ? id : newElementId();
      known.current?.add(nextId);
      const data = { ...item, props: { ...item.props, ...(preset?.props ?? {}), id: nextId } };
      window.setTimeout(() => {
        if (nextId !== id) {
          dispatch({ type: 'remove', index, zone: ROOT_ZONE });
          dispatch({
            type: 'insert',
            componentType: item.type,
            destinationIndex: index,
            destinationZone: ROOT_ZONE,
            id: nextId,
          });
        }
        dispatch({ type: 'replace', destinationIndex: index, destinationZone: ROOT_ZONE, data });
        dispatch({ type: 'setUi', ui: { itemSelector: { index, zone: ROOT_ZONE } } });
      }, 120);
    });
  }, [content, dispatch]);
}

export function AddElementPanel({ screenType }: { screenType: ScreenType }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [hover, setHover] = useState<{ id: CategoryId; top: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressed = useRef<{ x: number; y: number } | null>(null);
  const hoverRef = useRef(hover);
  hoverRef.current = hover;

  const cancelTimers = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const scheduleClose = () => {
    cancelTimers();
    timer.current = setTimeout(() => {
      if (pressed.current === null) setHover(null);
    }, 150);
  };
  const scheduleOpen = (next: { id: CategoryId; top: number }) => {
    cancelTimers();
    if (hoverRef.current === null) {
      setHover(next);
      return;
    }
    if (hoverRef.current.id !== next.id) setHover(next);
  };

  useEffect(() => {
    const release = (e: PointerEvent) => {
      const start = pressed.current;
      pressed.current = null;
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5) setHover(null);
    };
    window.addEventListener('pointerup', release);
    return () => {
      window.removeEventListener('pointerup', release);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const dispatch = usePuck((s) => s.dispatch);
  const content = usePuck((s) => s.appState.data.content);
  useApplyPresets();

  const available = useMemo(
    () =>
      PRESETS.filter((p) => {
        const entry = CATALOG_BY_TYPE.get(p.type);
        return entry && !entry.hidden && entry.screens.includes(screenType);
      }),
    [screenType],
  );
  const counts = useMemo(() => {
    const map = new Map<CategoryId, number>();
    for (const p of available) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, [available]);
  const baseCount = useMemo(() => new Set(available.map((p) => p.type)).size, [available]);

  const q = query.trim().toLowerCase();
  const results = q
    ? available.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          (CATALOG_BY_TYPE.get(p.type)?.label.toLowerCase().includes(q) ?? false),
      )
    : category
      ? available.filter((p) => p.category === category)
      : null;

  const arm = (preset: Preset) => {
    insertTracker.pending = { type: preset.type, props: preset.props ?? {} };
    const disarm = () => {
      window.removeEventListener('pointerup', disarm);
      window.setTimeout(() => {
        insertTracker.pending = null;
      }, 2000);
    };
    window.addEventListener('pointerup', disarm);
  };

  const insert = (preset: Preset) => {
    const firstButton = content.findIndex(
      (item) => item.type === 'Button' || isAttached(item.props as Record<string, unknown>),
    );
    const index = firstButton < 0 ? content.length : firstButton;
    const id = newElementId();
    insertTracker.pending = null;
    dispatch({
      type: 'insert',
      componentType: preset.type,
      destinationIndex: index,
      destinationZone: ROOT_ZONE,
      id,
    });
    if (preset.props) {
      dispatch({
        type: 'replace',
        destinationIndex: index,
        destinationZone: ROOT_ZONE,
        data: { type: preset.type, props: { ...presetProps(preset), id } },
      });
    }
    insertTracker.lastAction = '';
    dispatch({ type: 'setUi', ui: { itemSelector: { index, zone: ROOT_ZONE } } });
    setHover(null);
  };

  const card = (preset: Preset, withPreview: boolean) => (
    <Drawer.Item key={preset.id} name={preset.type} label={preset.label}>
      {() => (
        <div
          className={withPreview ? shell.presetCard : shell.elementItem}
          title="Click to add, or drag onto the phone"
          onPointerDownCapture={() => arm(preset)}
          onClick={() => insert(preset)}
        >
          {withPreview ? <Preview preset={preset} /> : null}
          <div className={shell.presetRow}>
            {withPreview ? null : (
              <span className={shell.categoryIcon}>
                {CATEGORIES.find((c) => c.id === preset.category)?.icon}
              </span>
            )}
            <span className={shell.elementText}>
              <span className={shell.elementLabel}>{preset.label}</span>
              {withPreview ? null : (
                <span className={shell.elementHint}>{CATALOG_BY_TYPE.get(preset.type)?.label}</span>
              )}
            </span>
            <button
              type="button"
              className={shell.elementAdd}
              aria-label={`Add ${preset.label}`}
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                insert(preset);
              }}
            >
              <PlusIcon size={13} />
            </button>
          </div>
        </div>
      )}
    </Drawer.Item>
  );

  return (
    <div className={shell.addPanel}>
      <label className={shell.search}>
        <SearchIcon size={14} />
        <input
          type="search"
          placeholder="Search elements..."
          aria-label="Search elements"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {results === null ? (
        <>
          <div className={shell.addHeader}>
            <span>All elements</span>
            <span className={shell.addCount}>{baseCount}</span>
          </div>
          <ul className={shell.categoryList} onMouseLeave={() => scheduleClose()}>
            {CATEGORIES.filter((c) => (counts.get(c.id) ?? 0) > 0).map((c) => (
              <li
                key={c.id}
                onMouseEnter={(e) =>
                  scheduleOpen({ id: c.id, top: e.currentTarget.getBoundingClientRect().top })
                }
              >
                <button
                  type="button"
                  className={shell.categoryRow}
                  data-active={hover?.id === c.id}
                  onClick={() => {
                    setHover(null);
                    setCategory(c.id);
                  }}
                >
                  <span className={shell.categoryIcon}>{c.icon}</span>
                  <span className={shell.categoryLabel}>{c.label}</span>
                  <span className={shell.addCount}>{counts.get(c.id)}</span>
                  <ChevronRight size={13} />
                </button>
              </li>
            ))}
          </ul>
          {hover ? (
            <div
              className={shell.flyoutBridge}
              style={{ top: Math.max(8, Math.min(hover.top - 40, window.innerHeight - 520)) }}
              onMouseEnter={cancelTimers}
              onMouseLeave={() => scheduleClose()}
              onPointerDown={(e) => {
                pressed.current = { x: e.clientX, y: e.clientY };
              }}
            >
              <div className={shell.flyout}>
                <Drawer>
                  {available.filter((p) => p.category === hover.id).map((p) => card(p, true))}
                </Drawer>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {q ? (
            <div className={shell.addHeader}>
              <span>Results</span>
              <span className={shell.addCount}>{results.length}</span>
            </div>
          ) : (
            <button type="button" className={shell.addBack} onClick={() => setCategory(null)}>
              <ChevronLeft size={13} />
              {CATEGORIES.find((c) => c.id === category)?.label}
            </button>
          )}
          {results.length === 0 ? (
            <p className={shell.emptyNote}>No elements match “{query}”.</p>
          ) : (
            <Drawer>{results.map((p) => card(p, false))}</Drawer>
          )}
        </>
      )}
    </div>
  );
}
