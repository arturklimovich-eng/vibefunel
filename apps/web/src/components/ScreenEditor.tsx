'use client';

import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Puck, createUsePuck } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import type { PuckData, ScreenType } from '@funnel/schema';
import { applyOptionMode, fromPuckData, toPuckData } from '@/lib/puck/adapters';
import { configForScreenType } from '@/lib/puck/config';

export interface ScreenEditorSlots {
  preview: HTMLElement | null;
  fields: HTMLElement | null;
  blocks: HTMLElement | null;
}

export interface EditorSelection {
  id: string;
  label: string;
}

export interface EditorBridgeState {
  selection: EditorSelection | null;
  canUndo: boolean;
  canRedo: boolean;
}

export interface EditorCommands {
  undo: () => void;
  redo: () => void;
  duplicate: () => void;
  remove: () => void;
  deselect: () => void;
}

interface ScreenEditorProps {
  screenId: string;
  screenType: ScreenType;
  content: PuckData;
  slots: ScreenEditorSlots;
  commandsRef: RefObject<EditorCommands | null>;
  onBridgeChange: (state: EditorBridgeState) => void;
  onChange: (content: PuckData) => void;
}

const usePuck = createUsePuck();

function Bridge({
  commandsRef,
  onBridgeChange,
}: {
  commandsRef: RefObject<EditorCommands | null>;
  onBridgeChange: (state: EditorBridgeState) => void;
}) {
  const selectedId = usePuck((s) => s.selectedItem?.props.id as string | undefined);
  const selectedType = usePuck((s) => s.selectedItem?.type);
  const label = usePuck((s) => {
    const type = s.selectedItem?.type;
    if (!type) return undefined;
    return s.config.components[type]?.label ?? type;
  });
  const canUndo = usePuck((s) => s.history.hasPast);
  const canRedo = usePuck((s) => s.history.hasFuture);
  const history = usePuck((s) => s.history);
  const dispatch = usePuck((s) => s.dispatch);
  const getSelectorForId = usePuck((s) => s.getSelectorForId);

  useEffect(() => {
    onBridgeChange({
      selection:
        selectedId && selectedType ? { id: selectedId, label: label ?? selectedType } : null,
      canUndo,
      canRedo,
    });
  }, [selectedId, selectedType, label, canUndo, canRedo, onBridgeChange]);

  useEffect(() => {
    commandsRef.current = {
      undo: () => history.back(),
      redo: () => history.forward(),
      duplicate: () => {
        const selector = selectedId ? getSelectorForId(selectedId) : undefined;
        if (!selector) return;
        dispatch({ type: 'duplicate', sourceIndex: selector.index, sourceZone: selector.zone });
      },
      remove: () => {
        const selector = selectedId ? getSelectorForId(selectedId) : undefined;
        if (!selector) return;
        dispatch({ type: 'remove', index: selector.index, zone: selector.zone });
      },
      deselect: () => dispatch({ type: 'setUi', ui: { itemSelector: null } }),
    };
  }, [commandsRef, history, dispatch, getSelectorForId, selectedId]);

  useEffect(
    () => () => {
      commandsRef.current = null;
    },
    [commandsRef],
  );

  return null;
}

export function ScreenEditor({
  screenType,
  content,
  slots,
  commandsRef,
  onBridgeChange,
  onChange,
}: ScreenEditorProps) {
  const [config] = useState(() => configForScreenType(screenType));
  const [initialData] = useState(() => toPuckData(applyOptionMode(content, screenType)));
  return (
    <Puck
      config={config}
      data={initialData}
      iframe={{ enabled: false }}
      onChange={(data) => {
        const parsed = fromPuckData(data);
        if (parsed) onChange(applyOptionMode(parsed, screenType));
      }}
    >
      <Bridge commandsRef={commandsRef} onBridgeChange={onBridgeChange} />
      {slots.preview ? createPortal(<Puck.Preview />, slots.preview) : null}
      {slots.fields ? createPortal(<Puck.Fields />, slots.fields) : null}
      {slots.blocks ? createPortal(<Puck.Components />, slots.blocks) : null}
    </Puck>
  );
}
