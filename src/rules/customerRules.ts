import { SCENT_ORDER, wheelDistance } from './scentRules';
import type { Customer, ScentType } from '../types/game';

export type ScentWeight = -1 | 0 | 1 | 2;

export function getCustomerScentWeight(customer: Customer, scent: ScentType): ScentWeight {
  if (customer.type === 'SPECIAL') return 0;
  if (customer.type === 'FOCUS') {
    const distance = wheelDistance(customer.preferenceScents[0], scent);
    if (distance === 0) return 2;
    if (distance <= 2) return 0;
    return -1;
  }
  if (customer.type === 'TRIO') return customer.preferenceScents.includes(scent) ? 1 : 0;
  if (customer.preferenceScents.includes(scent)) return 1;
  if (customer.negativeScents?.includes(scent)) return -1;
  return 0;
}

export function getCustomerScentWeights(customer: Customer): Record<ScentType, ScentWeight> {
  return Object.fromEntries(
    SCENT_ORDER.map((scent) => [scent, getCustomerScentWeight(customer, scent)]),
  ) as Record<ScentType, ScentWeight>;
}

export function getPositiveScentIds(customer: Customer): ScentType[] {
  return SCENT_ORDER.filter((scent) => getCustomerScentWeight(customer, scent) > 0);
}

function highestScentCount(formula: ScentType[]): number {
  const counts = new Map<ScentType, number>();
  for (const scent of formula) counts.set(scent, (counts.get(scent) ?? 0) + 1);
  return counts.size ? Math.max(...counts.values()) : 0;
}

function uniqueScentCount(formula: ScentType[]): number {
  return new Set(formula).size;
}

export function getSatisfaction(customer: Customer, formula: ScentType[]): number {
  if (customer.specialRule === 'COUNT_FOCUS') return Math.max(0, highestScentCount(formula) - 1);
  if (customer.specialRule === 'UNIQUE_LAYERS') return Math.max(0, uniqueScentCount(formula) - 1);
  return formula.reduce((total, scent) => total + getCustomerScentWeight(customer, scent), 0);
}

export function getSatisfactionRuleText(customer: Customer): string {
  if (customer.specialRule === 'COUNT_FOCUS') return '最高香气重复次数 − 1';
  if (customer.specialRule === 'UNIQUE_LAYERS') return '不同香气种类数 − 1';
  if (customer.type === 'TRIO') return '偏好香气每枚 +1，其余 0';
  if (customer.type === 'DUET') return '偏好双香 +1，指定对立香 −1，其余 0';
  return '主香 +2，远离香 −1';
}