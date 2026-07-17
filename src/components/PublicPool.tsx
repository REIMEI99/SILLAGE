import type { CSSProperties } from 'react';
import { SCENT_BY_ID } from '../data/gameData';
import type { GamePhase, ScentType } from '../types/game';
import { Glyph } from './Glyph';

interface PublicPoolProps {
  pool: ScentType[];
  phase: GamePhase;
  usedPoolIndexes: number[];
  selectedPoolIndex: number | null;
  onPreviewChange: (index: number | null) => void;
  onSelect: (index: number) => void;
}

const cardClasses = ['one', 'two', 'three', 'four'];

export function PublicPool({ pool, phase, usedPoolIndexes, selectedPoolIndex, onPreviewChange, onSelect }: PublicPoolProps) {
  return (
    <div className="pool" aria-label={'\u672C\u56DE\u5408\u516C\u5171\u6C60'}>
      {pool.map((scentId, index) => {
        const scent = SCENT_BY_ID[scentId];
        const used = usedPoolIndexes.includes(index);
        const disabled = phase !== 'mixing' || used;
        return (
          <button
            className={'pool-card ' + (cardClasses[index] ?? '') + ' ' + (used ? 'used' : '') + ' ' + (selectedPoolIndex === index ? 'selected' : '')}
            style={{ '--card-color': scent.color } as CSSProperties}
            type="button"
            key={scentId + '-' + index}
            disabled={disabled}
            aria-pressed={selectedPoolIndex === index}
            aria-label={(used ? '\u5DF2\u4F7F\u7528' : '\u9009\u62E9') + ' ' + scent.nameZh}
            onMouseEnter={() => onPreviewChange(index)}
            onMouseLeave={() => onPreviewChange(null)}
            onFocus={() => onPreviewChange(index)}
            onBlur={() => onPreviewChange(null)}
            onClick={() => onSelect(index)}
          >
            <span className="card-content">
              <Glyph scent={scent} className="pool-icon" />
              <b>{scent.nameZh}</b>
              {selectedPoolIndex === index && <small>{'\u9009\u62E9\u5DE5\u4F5C\u53F0'}</small>}
            </span>
            {used && <span className="used-mark">{'\u5DF2\u6295\u6599'}</span>}
          </button>
        );
      })}
    </div>
  );
}
