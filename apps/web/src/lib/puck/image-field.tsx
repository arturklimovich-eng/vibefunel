'use client';

import dynamic from 'next/dynamic';
import { FieldLabel } from '@puckeditor/core';
import type { ImageAspect } from '@/components/ai/ImageAssets';

const ImageField = dynamic(() => import('@/components/ai/ImageField').then((m) => m.ImageField), {
  ssr: false,
});

export function imageField(label: string, aspect: ImageAspect) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange }: { value?: string; onChange: (value: string) => void }) => (
      <FieldLabel label={label} el="div">
        <ImageField value={value ?? ''} onChange={onChange} aspect={aspect} label={label} />
      </FieldLabel>
    ),
  };
}
