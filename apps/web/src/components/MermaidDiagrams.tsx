'use client';

import { useEffect } from 'react';

export function MermaidDiagrams() {
  useEffect(() => {
    let cancelled = false;
    import('mermaid')
      .then(async ({ default: mermaid }) => {
        if (cancelled) return;
        mermaid.initialize({ startOnLoad: false, securityLevel: 'antiscript', theme: 'dark' });
        await mermaid.run({ querySelector: 'pre.mermaid' });
      })
      .catch((error: unknown) => console.error('Mermaid render failed', error));
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
