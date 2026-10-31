'use client';

import { useEffect } from 'react';

// Turns <pre class="mermaid"> blocks rendered by server/docs.ts into SVG diagrams.
// mermaid is large, so it loads only on documentation pages. 'antiscript' keeps `click` links
// working (strict disables them); graphs come from repository docs, not user input.
export function MermaidDiagrams() {
  useEffect(() => {
    let cancelled = false;
    import('mermaid')
      .then(async ({ default: mermaid }) => {
        if (cancelled) return;
        mermaid.initialize({ startOnLoad: false, securityLevel: 'antiscript', theme: 'neutral' });
        await mermaid.run({ querySelector: 'pre.mermaid' });
      })
      .catch((error: unknown) => console.error('Mermaid render failed', error));
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
