import type { CSSProperties } from 'react';
import type { ScentDefinition } from '../types/game';

interface GlyphProps {
  scent: ScentDefinition;
  className?: string;
  decorative?: boolean;
}

export function Glyph({ scent, className = '', decorative = true }: GlyphProps) {
  return (
    <span
      className={'glyph ' + className}
      style={{ '--glyph-url': 'url("' + scent.glyph + '")' } as CSSProperties}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : scent.nameZh}
      aria-hidden={decorative ? true : undefined}
    />
  );
}
