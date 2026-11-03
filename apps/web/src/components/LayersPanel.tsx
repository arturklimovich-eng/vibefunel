'use client';

import { useState } from 'react';
import { createUsePuck } from '@puckeditor/core';
import { CATALOG_BY_TYPE } from '@/lib/puck/catalog';
import { SearchIcon } from './EditorIcons';
import shell from './EditorShell.module.css';

const usePuck = createUsePuck();
const ROOT_ZONE = 'root:default-zone';

interface Layer {
  id: string;
  type: string;
  name: string;
  detail: string;
  attached: boolean;
  depth: number;
  index: number;
  zone: string;
}

type Item = { type: string; props: Record<string, unknown> };

function isItem(v: unknown): v is Item {
  return (
    typeof v === 'object' &&
    v !== null &&
    'type' in v &&
    typeof v.type === 'string' &&
    'props' in v &&
    typeof v.props === 'object' &&
    v.props !== null
  );
}

function describe(item: Item): { name: string; detail: string; attached: boolean } {
  const p = item.props;
  const label = CATALOG_BY_TYPE.get(item.type)?.label ?? item.type;
  const name = typeof p.name === 'string' && p.name.trim() !== '' ? p.name : label;
  const raw =
    typeof p.text === 'string'
      ? p.text
      : typeof p.label === 'string'
        ? p.label
        : typeof p.title === 'string'
          ? p.title
          : '';
  const style = p.style;
  const attached =
    typeof style === 'object' &&
    style !== null &&
    'position' in style &&
    style.position === 'attached';
  const detail = raw
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*/g, '')
    .slice(0, 40);
  return { name, detail, attached };
}

function flatten(items: Item[], zone: string, depth: number, out: Layer[]) {
  items.forEach((item, index) => {
    const id = String(item.props.id);
    out.push({ id, type: item.type, ...describe(item), depth, index, zone });
    for (const [key, value] of Object.entries(item.props)) {
      if (Array.isArray(value) && value.every(isItem) && value.length > 0) {
        flatten(value, `${id}:${key}`, depth + 1, out);
      }
    }
  });
}

export function LayersPanel() {
  const [filter, setFilter] = useState('');
  const [dragging, setDragging] = useState<Layer | null>(null);
  const content = usePuck((s) => s.appState.data.content) as Item[];
  const selectedId = usePuck((s) => s.selectedItem?.props.id as string | undefined);
  const dispatch = usePuck((s) => s.dispatch);

  const layers: Layer[] = [];
  flatten(content, ROOT_ZONE, 0, layers);
  const q = filter.trim().toLowerCase();
  const shown = q
    ? layers.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.detail.toLowerCase().includes(q) ||
          l.id.includes(q),
      )
    : layers;

  return (
    <div className={shell.layers}>
      <label className={shell.search}>
        <SearchIcon size={14} />
        <input
          type="search"
          placeholder="Filter elements..."
          aria-label="Filter elements"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </label>
      {shown.length === 0 ? (
        <p className={shell.emptyNote}>
          {layers.length === 0 ? 'No elements yet.' : 'Nothing matches.'}
        </p>
      ) : (
        <ul className={shell.layerList}>
          {shown.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className={shell.layerRow}
                data-selected={l.id === selectedId}
                data-drop={dragging !== null && dragging.zone === l.zone && dragging.id !== l.id}
                style={{ paddingLeft: 10 + l.depth * 14 }}
                draggable={q === ''}
                onDragStart={(e) => {
                  setDragging(l);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => setDragging(null)}
                onDragOver={(e) => {
                  if (dragging && dragging.zone === l.zone) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!dragging || dragging.zone !== l.zone || dragging.id === l.id) return;
                  dispatch({
                    type: 'move',
                    sourceIndex: dragging.index,
                    sourceZone: dragging.zone,
                    destinationIndex: l.index,
                    destinationZone: l.zone,
                  });
                  setDragging(null);
                }}
                onClick={() =>
                  dispatch({
                    type: 'setUi',
                    ui: { itemSelector: { index: l.index, zone: l.zone } },
                  })
                }
              >
                <span className={shell.layerName}>{l.name}</span>
                <span className={shell.layerDetail}>
                  {l.attached ? <span className={shell.layerTag}>[attached]</span> : null}
                  {l.detail}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
