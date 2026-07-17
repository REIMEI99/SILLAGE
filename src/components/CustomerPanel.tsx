import { SCENT_BY_ID } from '../data/gameData';
import { canDeliver, getWorktableSatisfaction } from '../rules/compatibilityRules';
import { getCustomerScentWeights, getPositiveScentIds, getSatisfactionRuleText } from '../rules/customerRules';
import { formatSigned } from '../rules/previewRules';
import type { Side, WorktableState } from '../types/game';

interface CustomerPanelProps {
  side: Side;
  worktable: WorktableState;
}

export function CustomerPanel({ side, worktable }: CustomerPanelProps) {
  const accent = side === 'left' ? 'var(--left)' : 'var(--right)';
  const customer = worktable.customer;
  if (!customer) {
    return (
      <article className="panel customer-panel empty-customer">
        <div className="eyebrow">CUSTOMER / {side === 'left' ? '01' : '02'}</div>
        <div className="customer-name">工作台空出</div>
        <p>等待从公开等候区选择下一位顾客。</p>
      </article>
    );
  }

  const weights = getCustomerScentWeights(customer);
  const positiveScents = getPositiveScentIds(customer);
  const preferenceNames = customer.preferenceScents.length
    ? customer.preferenceScents.map((scent) => SCENT_BY_ID[scent].nameZh).join(' / ')
    : '结构型偏好';
  const positiveNames = positiveScents.length
    ? positiveScents.map((scent) => `${SCENT_BY_ID[scent].nameZh} ${formatSigned(weights[scent])}`).join(' / ')
    : '由结构规则结算';
  const negativeNames = customer.negativeScents?.length
    ? customer.negativeScents.map((scent) => SCENT_BY_ID[scent].nameZh).join(' / ')
    : null;
  const satisfaction = getWorktableSatisfaction(customer, worktable.formula);
  const deliverable = canDeliver(worktable);

  return (
    <article className="panel customer-panel">
      <div className="eyebrow">CUSTOMER / {side === 'left' ? '01' : '02'}</div>
      <div className="customer-name">{customer.name}</div>
      <p className="request-copy">{customer.request}</p>
      <div className="request-row">
        <b style={{ color: accent }}>{preferenceNames}</b>
        <small>SCENT TENDENCY<br />DELIVER IF ≥ {customer.satisfactionLine}</small>
      </div>
      <div className="requirement-chip" style={{ color: accent }}>
        <i />
        加分香气 {positiveNames}{negativeNames ? `；回避 ${negativeNames} −1` : ''}；满意线 {customer.satisfactionLine}
      </div>
      <div className="rulelist">
        <div className="rulerow">
          <span>当前满意度</span>
          <b>{formatSigned(satisfaction)} / {customer.satisfactionLine} {deliverable ? '可交付' : '继续调香'}</b>
        </div>
        <div className="rulerow">
          <span>结算规则</span>
          <b>{getSatisfactionRuleText(customer)}</b>
        </div>
      </div>
    </article>
  );
}