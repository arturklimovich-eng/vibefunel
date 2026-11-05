'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { isHttpsUrl } from '@funnel/schema';
import { useEditorData } from '@/lib/puck/editor-context';
import { IMAGE_ASPECTS, useImageAssets } from './ImageAssets';
import type { ImageAspect, LibraryAsset } from './ImageAssets';
import css from './ImageField.module.css';

type Panel = 'none' | 'generate' | 'library';

export function ImageField({
  value,
  onChange,
  aspect: defaultAspect = '1:1',
  placeholder = 'https://…',
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  aspect?: ImageAspect;
  placeholder?: string;
  label?: string;
}) {
  const assets = useImageAssets();
  const { screens, screenId } = useEditorData();
  const [panel, setPanel] = useState<Panel>('none');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState<ImageAspect>(defaultAspect);
  const [library, setLibrary] = useState<LibraryAsset[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const taskRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const input = (
    <input
      className={css.url}
      type="url"
      aria-label={label ?? 'Image URL'}
      placeholder={placeholder}
      maxLength={2000}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
  if (!assets) return input;

  const pick = (url: string) => {
    onChange(url);
    setPanel('none');
  };

  const run = async (task: () => Promise<void>, label: string, signal?: AbortSignal) => {
    const token = ++taskRef.current;
    const current = () => mountedRef.current && taskRef.current === token;
    setBusy(label);
    setError(null);
    try {
      await task();
    } catch (err) {
      if (current() && !signal?.aborted) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    } finally {
      if (current()) setBusy(null);
    }
  };

  const openLibrary = () => {
    setPanel(panel === 'library' ? 'none' : 'library');
    if (library === null) {
      void run(async () => {
        const list = await assets.library();
        if (mountedRef.current) setLibrary(list);
      }, 'Loading...');
    }
  };

  const openGenerate = () => {
    if (panel !== 'generate' && prompt === '') {
      const title = screens.find((s) => s.id === screenId)?.title;
      setPrompt(title ? `${title}, ` : '');
    }
    setPanel(panel === 'generate' ? 'none' : 'generate');
  };

  return (
    <div className={css.field}>
      <div className={css.row}>
        {isHttpsUrl(value) ? (
          <Image className={css.thumb} src={value} alt="" width={30} height={30} unoptimized />
        ) : (
          <span className={css.thumb} aria-hidden />
        )}
        {input}
      </div>
      <div className={css.actions}>
        <button
          type="button"
          className={css.chip}
          disabled={busy !== null}
          onClick={() => fileRef.current?.click()}
        >
          Upload
        </button>
        {assets.canGenerate ? (
          <button
            type="button"
            className={css.chip}
            aria-pressed={panel === 'generate'}
            disabled={busy !== null}
            onClick={openGenerate}
          >
            Generate
          </button>
        ) : null}
        <button
          type="button"
          className={css.chip}
          aria-pressed={panel === 'library'}
          disabled={busy !== null && panel !== 'library'}
          onClick={openLibrary}
        >
          Library
        </button>
        {value ? (
          <button type="button" className={css.link} onClick={() => onChange('')}>
            Clear
          </button>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            void run(async () => {
              const asset = await assets.upload(file);
              if (!mountedRef.current) return;
              setLibrary((list) => (list ? [asset, ...list] : list));
              pick(asset.url);
            }, 'Uploading...');
          }}
        />
      </div>
      {panel === 'generate' ? (
        <div className={css.panel}>
          <textarea
            className={css.prompt}
            rows={3}
            maxLength={1000}
            placeholder="What should the image show? Style, mood, colors."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className={css.generateRow}>
            <select
              className={css.select}
              aria-label="Aspect ratio"
              value={aspect}
              onChange={(e) => setAspect(e.target.value as ImageAspect)}
            >
              {IMAGE_ASPECTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={css.primary}
              disabled={busy !== null || prompt.trim().length < 3}
              onClick={() => {
                abortRef.current?.abort();
                const controller = new AbortController();
                abortRef.current = controller;
                void run(
                  async () => {
                    const asset = await assets.generate(prompt.trim(), aspect, controller.signal);
                    if (!mountedRef.current || controller.signal.aborted) return;
                    setLibrary((list) => (list ? [asset, ...list] : list));
                    pick(asset.url);
                  },
                  'Generating...',
                  controller.signal,
                );
              }}
            >
              Generate
            </button>
          </div>
        </div>
      ) : null}
      {panel === 'library' && library ? (
        library.length === 0 ? (
          <p className={css.note}>No images yet. Upload or generate one.</p>
        ) : (
          <div className={css.grid}>
            {library.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className={css.tile}
                title={asset.prompt ?? 'Uploaded image'}
                data-active={asset.url === value}
                onClick={() => pick(asset.url)}
              >
                <Image
                  src={asset.url}
                  alt={asset.prompt ?? ''}
                  width={120}
                  height={120}
                  unoptimized
                />
              </button>
            ))}
          </div>
        )
      ) : null}
      {busy ? (
        <div className={css.busy}>
          <span>{busy}</span>
          {busy === 'Generating...' ? (
            <button
              type="button"
              className={css.link}
              onClick={() => {
                abortRef.current?.abort();
                abortRef.current = null;
                taskRef.current++;
                setBusy(null);
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p className={css.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
