import type { CSSProperties } from 'react';
import { SCENT_BY_ID } from '../data/gameData';
import type { Customer, Side } from '../types/game';
import { Glyph } from './Glyph';

interface WaitingAreaProps {
  customers: Customer[];
  selectable: boolean;
  selectionSide: Side | null;
  onSelect: (customerId: string) => void;
}

export function WaitingArea({ customers, selectable, selectionSide, onSelect }: WaitingAreaProps) {
  return (
    <section className="waiting-dock">
      <div className="dock-head">
        <span>公开顾客等候区 / 等待中的顾客</span>
        <span>{selectable ? `为${selectionSide === 'left' ? '左' : '右'}工作台选择顾客` : '工作台空出后，从三人中选择'}</span>
      </div>
      <div className="waiting-list">
        {customers.slice(0, 3).map((customer, index) => {
          const preferenceScent = customer.preferenceScents[0] ? SCENT_BY_ID[customer.preferenceScents[0]] : null;
          const preferenceNames = customer.preferenceScents.length
            ? customer.preferenceScents.map((scent) => SCENT_BY_ID[scent].nameZh).join(' / ')
            : '结构型偏好';
          const content = (
            <>
              <div className="wait-top">
                {preferenceScent ? <Glyph scent={preferenceScent} className="wait-icon" /> : <span className="wait-icon special-mark">✦</span>}
                <small>WAITING / {String(index + 1).padStart(2, '0')}</small>
              </div>
              <h4>{customer.name}</h4>
              <b>偏好 · {preferenceNames}</b>
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
