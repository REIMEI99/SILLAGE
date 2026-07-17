import type { CSSProperties } from 'react';
import { SCENTS } from '../data/gameData';
import { getPositiveScentIds } from '../rules/customerRules';
import { countRemainingScents } from '../rules/scentRules';
import type { GamePhase, GameState } from '../types/game';
import { Glyph } from './Glyph';
import { PublicPool } from './PublicPool';

interface ScentWheelProps {
  state: GameState;
  selectedPoolIndex: number | null;
  onPreviewChange: (index: number | null) => void;
  onSelectPool: (index: number) => void;
}

export function ScentWheel({ state, selectedPoolIndex, onPreviewChange, onSelectPool }: ScentWheelProps) {
  const leftPositive = new Set(state.left.customer ? getPositiveScentIds(state.left.customer) : []);
  const rightPositive = new Set(state.right.customer ? getPositiveScentIds(state.right.customer) : []);
  const remainingCounts = countRemainingScents(state.bag, state.pool, state.usedPoolIndexes);
  return (
    <div className="worktable">
      <div className="ring" />
      <div className="ring ring-two" />
      <div className="ring ring-three" />
      <div className="haze left" />
      <div className="haze right" />
      {SCENTS.map((scent) => {
        const targetClasses = [
          leftPositive.has(scent.id) ? 'left-target' : '',
          rightPositive.has(scent.id) ? 'right-target' : '',
        ].filter(Boolean).join(' ');
        const nodeStyle = {
          '--angle': scent.wheelIndex * 45 + 'deg',
          '--radius': '324px',
          '--scent': scent.color,
        } as CSSProperties;
        return (
          <div className={'node ' + targetClasses} style={nodeStyle} key={scent.id}>
            <div className="node-content">
              <Glyph scent={scent} className="node-icon" />
              <span><strong>{scent.nameZh}</strong><small>{scent.nameEn.toUpperCase()}</small></span>
              <em className="node-count">{'\u5269\u4F59 ' + remainingCounts[scent.id] + ' \u679A'}</em>
            </div>
          </div>
        );
      })}
      <PublicPool
        pool={state.pool}
        phase={state.phase as GamePhase}
        usedPoolIndexes={state.usedPoolIndexes}
        selectedPoolIndex={selectedPoolIndex}
        onPreviewChange={onPreviewChange}
        onSelect={onSelectPool}
      />
      <div className="center-label">
        <small>ROUND {String(state.round).padStart(2, '0')} / PUBLIC POOL</small>
        <h3>{state.phase === 'mixing' ? '\u9009\u62E9\u9999\u6599' : state.phase.toUpperCase()}</h3>
      </div>
    </div>
  );
}
