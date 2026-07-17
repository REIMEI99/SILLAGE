import type { CSSProperties } from 'react';
import { SCENT_BY_ID } from '../data/gameData';
import { canDeliver, getWorktableSatisfaction } from '../rules/compatibilityRules';
import { requiresDeliveryDecision } from '../rules/deliveryRules';
import { formatSigned } from '../rules/previewRules';
import type { GamePhase, Side, WorktableState } from '../types/game';
import { Glyph } from './Glyph';

interface FormulaBottleProps {
  side: Side;
  phase: GamePhase;
  worktable: WorktableState;
  decision: boolean | undefined;
  onDecision: (deliver: boolean) => void;
}

export function FormulaBottle({ side, phase, worktable, decision, onDecision }: FormulaBottleProps) {
  const accent = side === 'left' ? 'var(--left)' : 'var(--right)';
  const wash = side === 'left' ? 'var(--left-glow)' : 'var(--right-glow)';
  const satisfaction = getWorktableSatisfaction(worktable.customer, worktable.formula);
  const deliverable = canDeliver(worktable);
  const deliveryDecisionRequired = requiresDeliveryDecision(worktable);
  const deliveryPhase = phase === 'delivery';
  return (
    <article className="panel bottle-panel" style={{ '--wash': wash, '--action': accent } as CSSProperties}>
      <div className="bottle-head">
        <div className="eyebrow">WORKTABLE / {side.toUpperCase()} BOTTLE</div>
        <div className="status"><b>{worktable.formula.length} / 6</b> {'\u683C'} · {'\u6EE1\u610F\u5EA6'} {formatSigned(satisfaction)}{worktable.customer ? ' / ' + worktable.customer.satisfactionLine : ''}</div>
      </div>
      <div className="bottle-stage">
        <svg className="bottle-svg" viewBox="0 0 205 340" aria-hidden="true">
          <rect className="neck" x="75" y="8" width="55" height="48" rx="10" />
          <path className="glass" d="M59 56 C59 78 40 91 31 118 C16 163 17 213 25 278 C32 316 58 329 102 336 C146 329 173 316 180 278 C188 213 189 163 174 118 C165 91 146 78 146 56 Z" />
        </svg>
        <div className="dropstack" aria-label={'\u5F53\u524D\u914D\u65B9 ' + worktable.formula.length + ' \u679A'}>
          {Array.from({ length: 6 }, (_, index) => {
            const scentId = worktable.formula[index];
            if (!scentId) return <span className="ghost" key={'ghost-' + index} />;
            const scent = SCENT_BY_ID[scentId];
            return (
              <span className="drop" style={{ '--drop-color': scent.color } as CSSProperties} key={scent.id + '-' + index} title={scent.nameZh}>
                <Glyph scent={scent} className="drop-icon" />
              </span>
            );
          })}
        </div>
      </div>
      {deliveryPhase ? (
        deliveryDecisionRequired ? (
          <div className="bottle-actions">
            <button className="deliver" type="button" disabled={decision !== undefined} onClick={() => onDecision(true)}>
              {'\u4EA4\u4ED8\u8FD9\u74F6\u9999\u6C34'}<span>{decision === true ? '\u5DF2\u9009\u62E9' : 'DELIVER ORDER'}</span>
            </button>
            <button className="keep-button" type="button" disabled={decision !== undefined} onClick={() => onDecision(false)}>
              {'\u4FDD\u7559\u5230\u4E0B\u56DE\u5408'}<span>{decision === false ? '\u5DF2\u9009\u62E9' : 'KEEP FOR NEXT ROUND'}</span>
            </button>
          </div>
        ) : (
          <div className="decision-status">{worktable.customer ? '\u672A\u8FBE\u5230\u6EE1\u610F\u7EBF\uFF0C\u672C\u74F6\u81EA\u52A8\u4FDD\u7559' : '\u5DE5\u4F5C\u53F0\u65E0\u987E\u5BA2\uFF0C\u81EA\u52A8\u8DF3\u8FC7'}</div>
        )
      ) : (
        <button className="deliver" type="button" disabled>
          {phase === 'game_over' ? '\u672C\u5C40\u5DF2\u7ED3\u675F' : '\u5B8C\u6210\u6295\u6599\u540E\u51B3\u5B9A'}<span>{phase.toUpperCase()}</span>
        </button>
      )}
      {deliveryPhase && decision !== undefined && (
        <div className="decision-status">{decision ? '\u5DF2\u9009\u62E9\u4EA4\u4ED8' : '\u5DF2\u9009\u62E9\u4FDD\u7559'}</div>
      )}
    </article>
  );
}
