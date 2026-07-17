import { SCENT_BY_ID } from '../data/gameData';
import { getPreviewCopy } from '../rules/previewRules';
import type { Customer, PreviewResult, ScentType, Side } from '../types/game';

interface ImpactPreviewProps {
  scent: ScentType;
  left: PreviewResult;
  right: PreviewResult;
  leftCustomer: Customer | null;
  rightCustomer: Customer | null;
  actionable: boolean;
  onAddToSide: (side: Side) => void;
}

function PreviewSide({
  side,
  scent,
  preview,
  customer,
  actionable,
  onAddToSide,
}: {
  side: Side;
  scent: ScentType;
  preview: PreviewResult;
  customer: Customer | null;
  actionable: boolean;
  onAddToSide: (side: Side) => void;
}) {
  const copy = getPreviewCopy(preview, scent, SCENT_BY_ID, customer);
  return (
    <div className={'impact-side ' + side}>
      <small>{side.toUpperCase()} / {customer ? customer.name + '\u987E\u5BA2' : '\u7A7A\u5DE5\u4F5C\u53F0'}</small>
      <b>{copy.satisfaction} · {copy.technique}</b>
      <p>{copy.detail}</p>
      {actionable && customer && (
        <button className="add-to-bottle" type="button" onClick={() => onAddToSide(side)}>
          {'\u52A0\u5165'} {side === 'left' ? '\u5DE6\u74F6' : '\u53F3\u74F6'}
        </button>
      )}
    </div>
  );
}

export function ImpactPreview({ scent, left, right, leftCustomer, rightCustomer, actionable, onAddToSide }: ImpactPreviewProps) {
  return (
    <aside className="impact-preview" aria-live="polite">
      <div className="impact-title">
        <span>{'\u52A0\u5165'} {SCENT_BY_ID[scent].nameZh} {'\u540E\u7684\u9884\u6F14'}</span>
        <small>CUSTOMER PREVIEW · {'\u5DE6\u53F3\u74F6\u540C\u65F6\u8BA1\u7B97'}</small>
      </div>
      <div className="impact-grid">
        <PreviewSide side="left" scent={scent} preview={left} customer={leftCustomer} actionable={actionable} onAddToSide={onAddToSide} />
        <PreviewSide side="right" scent={scent} preview={right} customer={rightCustomer} actionable={actionable} onAddToSide={onAddToSide} />
      </div>
    </aside>
  );
}
