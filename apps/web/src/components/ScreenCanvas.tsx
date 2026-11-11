'use client';

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useReactFlow,
  useStore,
  useStoreApi,
  type Connection,
  type Edge as FlowEdge,
  type Node as FlowNode,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Render } from '@puckeditor/core';
import { flattenContent } from '@funnel/schema';
import type { FunnelDefinition, Screen, Theme } from '@funnel/schema';
import { depthFromStart, longestPathFrom, previewStep } from '@funnel/schema';
import type { StepPosition } from '@funnel/schema';
import { splitAttached, toPuckData } from '@/lib/puck/adapters';
import { puckConfig } from '@/lib/puck/config';
import { ThemeContext } from '@/lib/puck/theme-context';
import { screenSurface } from '@/lib/styles';
import { contrastingForeground } from './FunnelRuntime';
import { ScreenHeaderBar } from './ScreenHeaderBar';
import styles from './EditorShell.module.css';

export const PHONE_W = 380;
export const PHONE_H = 780;
const HEAD_H = 30;
const PILL_H = 56;
const COL_GAP = 200;
const ROW_GAP = 120;

export type CanvasMode = 'editor' | 'flow';

export interface ScreenNodeData extends Record<string, unknown> {
  screen: Screen;
  definition: FunnelDefinition;
  position: StepPosition;
  groupsKey: string;
  index: number;
  typeLabel: string;
  typeColor: string;
  isStart: boolean;
  severity: 'error' | 'warning' | undefined;
  editing: boolean;
  showPill: boolean;
}

type ScreenFlowNode = FlowNode<ScreenNodeData, 'screen'>;

export function phoneVars(theme: Theme): CSSProperties {
  return {
    '--funnel-primary': theme.primaryColor,
    '--funnel-on-primary': contrastingForeground(theme.primaryColor),
    background: theme.backgroundColor,
    color: theme.textColor,
    fontSize: `${theme.fontScale ?? 1}rem`,
  } as CSSProperties;
}

interface StaticScreenProps {
  screen: Screen;
  definition: FunnelDefinition;
  position: StepPosition;
  groupsKey: string;
}

export const StaticScreen = memo(function StaticScreen({
  screen,
  definition,
  position,
}: StaticScreenProps) {
  const split = useMemo(
    () => splitAttached(toPuckData(screen.content), definition.theme),
    [screen.content, definition.theme],
  );
  const surface = screenSurface(screen, definition.theme);
  return (
    <div
      className={styles.phoneScreen}
      style={{ ...phoneVars(definition.theme), ...surface.surface }}
      inert
    >
      {surface.videoUrl ? (
        <video className={styles.phoneVideo} src={surface.videoUrl} muted aria-hidden="true" />
      ) : null}
      <div className={styles.phoneHeader}>
        <ScreenHeaderBar
          definition={definition}
          screen={screen}
          position={position}
          canGoBack={position.step > 1}
        />
      </div>
      <div className={styles.previewSlot} style={surface.body}>
        <Render config={puckConfig} data={split.main} />
        {split.attached ? (
          <div className={styles.attachedBar}>
            <Render config={puckConfig} data={split.attached} />
          </div>
        ) : null}
      </div>
    </div>
  );
}, sameStaticScreen);

function sameStaticScreen(a: StaticScreenProps, b: StaticScreenProps): boolean {
  return (
    a.screen === b.screen &&
    a.definition.theme === b.definition.theme &&
    a.position.step === b.position.step &&
    a.position.total === b.position.total &&
    a.groupsKey === b.groupsKey
  );
}

const ScreenNode = memo(function ScreenNode({ data, selected }: NodeProps<ScreenFlowNode>) {
  const {
    screen,
    definition,
    position,
    groupsKey,
    index,
    typeLabel,
    typeColor,
    isStart,
    severity,
  } = data;
  return (
    <div
      className={styles.canvasNode}
      data-selected={selected}
      data-editing={data.editing}
      data-severity={severity}
      style={{ '--type-color': typeColor, width: PHONE_W } as CSSProperties}
    >
      <div className={styles.canvasNodeHead} style={{ height: HEAD_H }}>
        <span className={styles.canvasNodeType}>{typeLabel}</span>
        {isStart ? <span className={styles.startBadge}>Start</span> : null}
        {severity ? (
          <span
            className={styles.severityDot}
            data-severity={severity}
            aria-label={`has ${severity}s`}
            role="img"
          />
        ) : null}
      </div>
      <div
        className={styles.canvasPhone}
        data-selected={selected && data.showPill ? 'true' : undefined}
        style={{ height: PHONE_H }}
      >
        <Handle type="target" position={Position.Left} className={styles.canvasHandle} />
        <span className={styles.island} aria-hidden="true" />
        <StaticScreen
          screen={screen}
          definition={definition}
          position={position}
          groupsKey={groupsKey}
        />
        <Handle type="source" position={Position.Right} className={styles.canvasHandle} />
      </div>
      <div className={styles.canvasPillRow} style={{ height: PILL_H }}>
        <span className={styles.canvasPill} data-active={selected && data.showPill}>
          <span>{index + 1}</span>
          <span aria-hidden="true">·</span>
          {screen.title || screen.id}
        </span>
      </div>
    </div>
  );
});

const NODE_TYPES = { screen: ScreenNode };
const NODE_H = HEAD_H + PHONE_H + PILL_H;

function buttonEdges(definition: FunnelDefinition): FlowEdge[] {
  const ids = new Set(definition.screens.map((s) => s.id));
  const out: FlowEdge[] = [];
  for (const screen of definition.screens) {
    for (const item of flattenContent(screen.content.content)) {
      const p = item.props;
      if (item.type !== 'Button' || (p.action ?? 'next') !== 'next') continue;
      if (typeof p.destination !== 'string' || !ids.has(p.destination)) continue;
      out.push({
        id: `button-${screen.id}-${String(p.id)}`,
        source: screen.id,
        target: p.destination,
        type: 'smoothstep',
        label: typeof p.label === 'string' ? `button: ${p.label}` : 'button',
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 6,
        style: { strokeDasharray: '6 4' },
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      });
    }
  }
  return out;
}

function layoutColumns(definition: FunnelDefinition): Map<string, { col: number; row: number }> {
  const depth = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  for (const edge of definition.edges) {
    const list = outgoing.get(edge.sourceScreenId) ?? [];
    list.push(edge.targetScreenId);
    outgoing.set(edge.sourceScreenId, list);
  }
  const queue: string[] = [];
  if (definition.screens.some((s) => s.id === definition.startScreenId)) {
    depth.set(definition.startScreenId, 0);
    queue.push(definition.startScreenId);
  }
  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined) break;
    const d = depth.get(id) ?? 0;
    for (const next of outgoing.get(id) ?? []) {
      if (depth.has(next)) continue;
      depth.set(next, d + 1);
      queue.push(next);
    }
  }
  const maxDepth = Math.max(-1, ...depth.values());
  const rows = new Map<number, number>();
  const placed = new Map<string, { col: number; row: number }>();
  for (const screen of definition.screens) {
    const col = depth.get(screen.id) ?? maxDepth + 1;
    const row = rows.get(col) ?? 0;
    rows.set(col, row + 1);
    placed.set(screen.id, { col, row });
  }
  return placed;
}

const BEZEL = 11;

function EditOverlay({
  node,
  settled,
  onHost,
}: {
  node: ScreenFlowNode | undefined;
  settled: boolean;
  onHost: (el: HTMLDivElement | null) => void;
}) {
  const store = useStoreApi();
  const zoomIsOne = useStore((st) => Math.abs(st.transform[2] - 1) <= 0.001);
  const host = useStore((st) => st.domNode?.parentElement ?? null);
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const nx = node?.position.x;
  const ny = node?.position.y;
  const visible = node !== undefined && settled && host !== null && zoomIsOne;

  useLayoutEffect(() => {
    onHost(visible ? el : null);
  }, [onHost, visible, el]);

  useLayoutEffect(() => () => onHost(null), [onHost]);

  useLayoutEffect(() => {
    if (!el || nx === undefined || ny === undefined) return;
    const place = ([x, y, zoom]: [number, number, number]) => {
      el.style.left = `${(nx + BEZEL) * zoom + x}px`;
      el.style.top = `${(ny + HEAD_H + BEZEL) * zoom + y}px`;
    };
    place(store.getState().transform);
    return store.subscribe((st) => place(st.transform));
  }, [store, el, nx, ny]);

  if (!visible) return null;
  return createPortal(
    <div
      ref={setEl}
      className={`${styles.canvasOverlay} nodrag nopan nowheel`}
      data-puck-host=""
      style={{ width: PHONE_W - BEZEL * 2, height: PHONE_H - BEZEL * 2 }}
    >
      <span className={styles.island} aria-hidden="true" />
    </div>,
    host,
  );
}

function ConnectionChrome() {
  const zoom = useStore((st) => Math.round(st.transform[2] * 20) / 20);
  const connecting = useStore((st) => st.connection.inProgress);
  const dom = useStore((st) => st.domNode);
  useEffect(() => {
    dom?.style.setProperty('--canvas-zoom', String(Math.max(zoom, 0.05)));
  }, [dom, zoom]);
  useEffect(() => {
    if (!dom) return;
    if (connecting) dom.dataset.connecting = 'true';
    else delete dom.dataset.connecting;
  }, [dom, connecting]);
  return null;
}

function Focus({
  mode,
  selectedId,
  nodes,
  onSettled,
}: {
  mode: CanvasMode;
  selectedId: string | undefined;
  nodes: ScreenFlowNode[];
  onSettled: (id: string | null) => void;
}) {
  const flow = useReactFlow();
  const first = useRef(true);
  const run = useRef(0);
  const target = mode === 'editor' ? (selectedId ?? null) : null;
  const node = target ? nodes.find((n) => n.id === target) : undefined;
  const x = node?.position.x;
  const y = node?.position.y;
  useEffect(() => {
    const duration = first.current ? 0 : 450;
    first.current = false;
    const id = ++run.current;
    onSettled(null);
    if (mode === 'editor' && target && x !== undefined && y !== undefined) {
      void flow
        .setCenter(x + PHONE_W / 2, y + HEAD_H + PHONE_H / 2 + PILL_H / 2, { zoom: 1, duration })
        .then(() => {
          if (run.current === id) onSettled(target);
        });
      return;
    }
    void flow.fitView({ padding: 0.12, duration, maxZoom: 1 });
  }, [flow, mode, target, x, y, onSettled]);
  return null;
}

export const ScreenCanvas = memo(function ScreenCanvas({
  definition,
  mode,
  selectedId,
  showPill,
  onEditHost,
  typeMeta,
  severityKey,
  describeEdge,
  onFocusScreen,
  onConnect,
}: {
  definition: FunnelDefinition;
  mode: CanvasMode;
  selectedId: string | undefined;
  showPill: boolean;
  onEditHost: (el: HTMLDivElement | null) => void;
  typeMeta: (screen: Screen) => { label: string; color: string };
  severityKey: string;
  describeEdge: (edge: FunnelDefinition['edges'][number]) => string;
  onFocusScreen: (id: string) => void;
  onConnect: (connection: Connection) => void;
}) {
  const [settledId, setSettledId] = useState<string | null>(null);
  const severityByScreen = useMemo(() => {
    const map = new Map<string, 'error' | 'warning'>();
    for (const part of severityKey.split('|')) {
      const at = part.lastIndexOf(':');
      const sev = part.slice(at + 1);
      if (at > 0 && (sev === 'error' || sev === 'warning')) map.set(part.slice(0, at), sev);
    }
    return map;
  }, [severityKey]);

  const nodes = useMemo<ScreenFlowNode[]>(() => {
    const placed = layoutColumns(definition);
    const depths = depthFromStart(definition);
    const lengths = longestPathFrom(definition);
    const groupsKey = definition.screens.map((s) => `${s.id}:${s.group ?? ''}`).join('|');
    return definition.screens.map((screen, index) => {
      const slot = placed.get(screen.id) ?? { col: 0, row: index };
      const meta = typeMeta(screen);
      const editing = mode === 'editor' && screen.id === selectedId;
      return {
        id: screen.id,
        type: 'screen',
        position: {
          x: slot.col * (PHONE_W + COL_GAP),
          y: slot.row * (NODE_H + ROW_GAP),
        },
        selected: screen.id === selectedId,
        draggable: false,
        data: {
          screen,
          definition,
          position: previewStep(definition, screen.id, depths, lengths),
          groupsKey,
          index,
          typeLabel: meta.label,
          typeColor: meta.color,
          isStart: screen.id === definition.startScreenId,
          severity: severityByScreen.get(screen.id),
          editing,
          showPill: editing ? showPill : true,
        },
      };
    });
  }, [definition, selectedId, mode, showPill, typeMeta, severityByScreen]);

  const edges = useMemo<FlowEdge[]>(
    () => [
      ...definition.edges.map((e): FlowEdge => ({
        id: e.id,
        source: e.sourceScreenId,
        target: e.targetScreenId,
        type: 'smoothstep',
        label: describeEdge(e),
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 6,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      })),
      ...buttonEdges(definition),
    ],
    [definition, describeEdge],
  );

  return (
    <ThemeContext.Provider value={definition.theme}>
      <ReactFlow
        className={styles.canvasFlow}
        colorMode="dark"
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        nodesDraggable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable
        onConnect={onConnect}
        connectionRadius={60}
        onNodeClick={(_event, node) => {
          if (mode === 'editor' && node.id === selectedId) return;
          onFocusScreen(node.id);
        }}
        deleteKeyCode={null}
        zoomOnDoubleClick={false}
        minZoom={0.08}
        maxZoom={1.5}
      >
        <ConnectionChrome />
        <Focus mode={mode} selectedId={selectedId} nodes={nodes} onSettled={setSettledId} />
        <EditOverlay
          node={mode === 'editor' ? nodes.find((n) => n.id === selectedId) : undefined}
          settled={settledId !== null && settledId === selectedId}
          onHost={onEditHost}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </ThemeContext.Provider>
  );
});
