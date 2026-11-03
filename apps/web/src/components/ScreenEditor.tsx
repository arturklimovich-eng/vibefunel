'use client';

import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Puck, createUsePuck } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import type { PuckData, ScreenType, Theme } from '@funnel/schema';
import { fromPuckData, toPuckData } from '@/lib/puck/adapters';
import { configForScreenType } from '@/lib/puck/config';
import { ThemeContext } from '@/lib/puck/theme-context';
import { EditorDataContext } from '@/lib/puck/editor-context';
import { insertTracker } from '@/lib/puck/insert-tracker';
import { AddElementPanel } from './AddElementPanel';
import { LayersPanel } from './LayersPanel';

export interface ScreenEditorSlots {
  preview: HTMLElement | null;
  fields: HTMLElement | null;
  blocks: HTMLElement | null;
  outline: HTMLElement | null;
}

export interface EditorSelection {
  id: string;
  type: string;
  label: string;
  props: Record<string, unknown>;
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
  updateProps: (patch: Record<string, unknown>) => void;
}

interface ScreenEditorProps {
  screenId: string;
  screenType: ScreenType;
  theme: Theme;
  screens: { id: string; title: string }[];
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
  const selectedProps = usePuck(
    (s) => s.selectedItem?.props as Record<string, unknown> | undefined,
  );
  const getItemBySelector = usePuck((s) => s.getItemBySelector);
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
        selectedId && selectedType
          ? {
              id: selectedId,
              type: selectedType,
              label: label ?? selectedType,
              props: selectedProps ?? {},
            }
          : null,
      canUndo,
      canRedo,
    });
  }, [selectedId, selectedType, selectedProps, label, canUndo, canRedo, onBridgeChange]);

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
      updateProps: (patch) => {
        const selector = selectedId ? getSelectorForId(selectedId) : undefined;
        const item = selector ? getItemBySelector(selector) : undefined;
        if (!selector || !item) return;
        const props: Record<string, unknown> = { ...item.props };
        for (const [key, value] of Object.entries(patch)) {
          if (value === undefined) delete props[key];
          else props[key] = value;
        }
        dispatch({
          type: 'replace',
          destinationIndex: selector.index,
          destinationZone: selector.zone,
          data: { ...item, props: { ...props, id: item.props.id } },
        });
      },
    };
  }, [commandsRef, history, dispatch, getSelectorForId, getItemBySelector, selectedId]);

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
  theme,
  screens,
  screenId,
  content,
  slots,
  commandsRef,
  onBridgeChange,
  onChange,
}: ScreenEditorProps) {
  const [config] = useState(() => configForScreenType(screenType));
  const [initialData] = useState(() => toPuckData(content));
  return (
    <ThemeContext.Provider value={theme}>
      <EditorDataContext.Provider value={{ screens, screenId, screenType }}>
        <Puck
          config={config}
          data={initialData}
          iframe={{ enabled: false }}
          onAction={(action) => {
            insertTracker.lastAction = action.type;
          }}
          onChange={(data) => {
            const parsed = fromPuckData(data);
            if (parsed) onChange(parsed);
          }}
        >
          <Bridge commandsRef={commandsRef} onBridgeChange={onBridgeChange} />
          {slots.preview ? createPortal(<Puck.Preview />, slots.preview) : null}
          {slots.fields ? createPortal(<Puck.Fields />, slots.fields) : null}
          {slots.blocks
            ? createPortal(<AddElementPanel screenType={screenType} />, slots.blocks)
            : null}
          {slots.outline ? createPortal(<LayersPanel />, slots.outline) : null}
        </Puck>
      </EditorDataContext.Provider>
    </ThemeContext.Provider>
  );
}
