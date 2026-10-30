'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SLUG_PATTERN } from '@funnel/schema';
import { FUNNELS_ROUTE, SLUG_INPUT_PATTERN, SLUG_MAX_LENGTH } from '@/lib/api-routes';
import styles from '@/app/studio/studio.module.css';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH);
}

export function NewFunnelForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const slugValid = SLUG_PATTERN.test(slug);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError('Enter a name.');
      return;
    }
    if (!slugValid) {
      setError(
        `Slug must be 3-${SLUG_MAX_LENGTH} characters: lowercase letters, digits and hyphens.`,
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(FUNNELS_ROUTE, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: trimmed, slug }),
      });
      if (res.status === 409) {
        setError('That slug is already taken.');
        return;
      }
      if (!res.ok) {
        setError(`Could not create the funnel (HTTP ${res.status}).`);
        return;
      }
      setName('');
      setSlug('');
      setSlugTouched(false);
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Network error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} className={styles.inlineForm}>
      <label className={styles.field}>
        Name
        <input
          type="text"
          value={name}
          maxLength={200}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </label>
      <label className={styles.field}>
        Slug
        <input
          type="text"
          value={slug}
          maxLength={SLUG_MAX_LENGTH}
          pattern={SLUG_INPUT_PATTERN}
          aria-invalid={slug.length > 0 && !slugValid}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
        />
      </label>
      <button type="submit" className={styles.btnPrimary} disabled={busy}>
        New funnel
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
