'use client';

import { memo, useMemo } from 'react';
import type { CSSProperties } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Connection,
  type Edge as FlowEdge,
  type Node as FlowNode,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Render } from '@puckeditor/core';
import type { FunnelDefinition, Screen, Theme } from '@funnel/schema';
import { toPuckData } from '@/lib/puck/adapters';
import { puckConfig } from '@/lib/puck/config';
import { contrastingForeground } from './FunnelRuntime';
import styles from './EditorShell.module.css';

const DEVICE_W = 390;
const DEVICE_H = 844;
const NODE_W = 220;
const SCALE = NODE_W / DEVICE_W;
const NODE_H = Math.round(DEVICE_H * SCALE);
const COL_GAP = 120;
const ROW_GAP = 90;
const LABEL_H = 34;

export interface ScreenNodeData extends Record<string, unknown> {
  screen: Screen;
  theme: Theme;
  index: number;
  typeLabel: string;
  typeColor: string;
  isStart: boolean;
  severity: 'error' | 'warning' | undefined;
}

type ScreenFlowNode = FlowNode<ScreenNodeData, 'screen'>;

function screenStyle(theme: Theme): CSSProperties {
  return {
    '--funnel-primary': theme.primaryColor,
    '--funnel-on-primary': contrastingForeground(theme.primaryColor),
    background: theme.backgroundColor,
    color: theme.textColor,
    fontSize: `${theme.fontScale ?? 1}rem`,
    width: DEVICE_W,
    height: DEVICE_H,
    transform: `scale(${SCALE})`,
  } as CSSProperties;
}

const ScreenNode = memo(function ScreenNode({ data, selected }: NodeProps<ScreenFlowNode>) {
  const { screen, theme, index, typeLabel, typeColor, isStart, severity } = data;
  const puckData = useMemo(() => toPuckData(screen.content), [screen.content]);
  return (
    <div
      className={styles.canvasNode}
      data-selected={selected}
      data-severity={severity}
      style={{ '--type-color': typeColor, width: NODE_W } as CSSProperties}
    >
      <div className={styles.canvasNodeHead}>
        <span className={styles.canvasNodeIndex}>{String(index + 1).padStart(2, '0')}</span>
        <span className={styles.canvasNodeTitle}>{screen.title || screen.id}</span>
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
      <div className={styles.canvasDevice} style={{ height: NODE_H }}>
        <Handle type="target" position={Position.Left} className={styles.canvasHandle} />
        <div className={styles.canvasScreen} style={screenStyle(theme)} inert>
          <div className={styles.canvasScreenInner}>
            <Render config={puckConfig} data={puckData} />
          </div>
        </div>
        <Handle type="source" position={Position.Right} className={styles.canvasHandle} />
      </div>
      <span className={styles.canvasNodeType}>{typeLabel}</span>
    </div>
  );
});

const NODE_TYPES = { screen: ScreenNode };

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

export function ScreenCanvas({
  definition,
  selectedId,
  typeMeta,
  severityByScreen,
  describeEdge,
  onSelect,
  onOpen,
  onConnect,
}: {
  definition: FunnelDefinition;
  selectedId: string | undefined;
  typeMeta: (screen: Screen) => { label: string; color: string };
  severityByScreen: Map<string, 'error' | 'warning'>;
  describeEdge: (edge: FunnelDefinition['edges'][number]) => string;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onConnect: (connection: Connection) => void;
}) {
  const nodes = useMemo<ScreenFlowNode[]>(() => {
    const placed = layoutColumns(definition);
    return definition.screens.map((screen, index) => {
      const slot = placed.get(screen.id) ?? { col: 0, row: index };
      const meta = typeMeta(screen);
      return {
        id: screen.id,
        type: 'screen',
        position: {
          x: slot.col * (NODE_W + COL_GAP),
          y: slot.row * (NODE_H + LABEL_H * 2 + ROW_GAP),
        },
        selected: screen.id === selectedId,
        draggable: false,
        data: {
          screen,
          theme: definition.theme,
          index,
          typeLabel: meta.label,
          typeColor: meta.color,
          isStart: screen.id === definition.startScreenId,
          severity: severityByScreen.get(screen.id),
        },
      };
    });
  }, [definition, selectedId, typeMeta, severityByScreen]);

  const edges = useMemo<FlowEdge[]>(
    () =>
      definition.edges.map((e) => ({
        id: e.id,
        source: e.sourceScreenId,
        target: e.targetScreenId,
        type: 'smoothstep',
        label: describeEdge(e),
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 6,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      })),
    [definition.edges, describeEdge],
  );

  return (
    <ReactFlow
      className={styles.canvasFlow}
      colorMode="dark"
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      nodesDraggable={false}
      nodesFocusable
      edgesFocusable={false}
      elementsSelectable
      onConnect={onConnect}
      onNodeClick={(_event, node) => onSelect(node.id)}
      onNodeDoubleClick={(_event, node) => onOpen(node.id)}
      deleteKeyCode={null}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.1}
      maxZoom={1.5}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
}
