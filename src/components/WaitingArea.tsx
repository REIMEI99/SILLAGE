import type { CSSProperties } from 'react';
import { SCENT_BY_ID } from '../data/gameData';
import { getSatisfaction } from '../rules/customerRules';
import { formatSigned } from '../rules/previewRules';
import type { Customer, ScentType, Side } from '../types/game';
import { Glyph } from './Glyph';

interface WaitingAreaProps {
  customers: Customer[];
  selectionMode: 'customer' | 'transfer' | null;
  targetSide: Side | null;
  transferFormula?: ScentType[];
  onSelect: (customerId: string) => void;
}

export function WaitingArea({
  customers,
  selectionMode,
  targetSide,
  transferFormula = [],
  onSelect,
}: WaitingAreaProps) {
  const selectable = selectionMode !== null && targetSide !== null;
  const sideLabel = targetSide === 'left' ? '左' : '右';
  const instruction = selectionMode === 'transfer'
    ? `为${sideLabel}瓶选择转单顾客，配方保持不变`
    : selectionMode === 'customer'
      ? `为${sideLabel}工作台选择顾客`
      : '工作台空出后，从三人中选择';

  return (
    <section className="waiting-dock">
      <div className="dock-head">
        <span>公开顾客等候区 / 等待中的顾客</span>
        <span>{instruction}</span>
      </div>
      <div className="waiting-list">
        {customers.slice(0, 3).map((customer, index) => {
          const preferenceScent = customer.preferenceScents[0] ? SCENT_BY_ID[customer.preferenceScents[0]] : null;
          const preferenceNames = customer.preferenceScents.length
            ? customer.preferenceScents.map((scent) => SCENT_BY_ID[scent].nameZh).join(' / ')
            : '结构型偏好';
          const negativeNames = customer.negativeScents?.map((scent) => SCENT_BY_ID[scent].nameZh).join(' / ');
          const transferSatisfaction = selectionMode === 'transfer'
            ? getSatisfaction(customer, transferFormula)
            : null;
          const content = (
            <>
              <div className="wait-top">
                {preferenceScent ? <Glyph scent={preferenceScent} className="wait-icon" /> : <span className="wait-icon special-mark">✦</span>}
                <small>WAITING / {String(index + 1).padStart(2, '0')}</small>
              </div>
              <h4>{customer.name}</h4>
              <b>偏好 · {preferenceNames}{negativeNames ? ` / 回避 · ${negativeNames}` : ''}</b>
              {transferSatisfaction !== null && (
                <small className="transfer-preview">
                  转单后满意度 {formatSigned(transferSatisfaction)} / {customer.satisfactionLine}
                </small>
              )}
              <small className="wait-request">{customer.request}</small>
            </>
          );
          const style = { '--scent': preferenceScent?.color ?? 'var(--ink)' } as CSSProperties;
          return selectable ? (
            <button className="wait-card selectable" style={style} type="button" key={customer.id} onClick={() => onSelect(customer.id)}>
              {content}
            </button>
          ) : (
            <article className="wait-card" style={style} key={customer.id}>
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}