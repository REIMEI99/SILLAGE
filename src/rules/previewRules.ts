import type {
  Customer,
  PreviewResult,
  ScentDefinition,
  ScentType,
  TechniqueResult,
  WorktableState,
} from '../types/game';
import { canDeliver } from './compatibilityRules';
import { getSatisfaction } from './customerRules';
import { appendScentFIFO } from './scentRules';
import { getBestTechnique } from './techniqueRules';

export function previewAddScent(worktable: WorktableState, scent: ScentType): PreviewResult {
  const nextFormula = appendScentFIFO(worktable.formula, scent);
  const techniqueBefore = getBestTechnique(worktable.formula);
  const techniqueAfter = getBestTechnique(nextFormula);
  const satisfactionBefore = worktable.customer ? getSatisfaction(worktable.customer, worktable.formula) : 0;
  const satisfactionAfter = worktable.customer ? getSatisfaction(worktable.customer, nextFormula) : 0;
  return {
    nextFormula,
    satisfactionBefore,
    satisfactionAfter,
    satisfactionDelta: satisfactionAfter - satisfactionBefore,
    deliverableBefore: canDeliver({ ...worktable, formula: worktable.formula }),
    deliverableAfter: canDeliver({ ...worktable, formula: nextFormula }),
    techniqueBefore,
    techniqueAfter,
    techniqueDelta: techniqueAfter.score - techniqueBefore.score,
    becomesPerfect: !techniqueBefore.isPerfect && techniqueAfter.isPerfect,
  };
}

export function formatSigned(value: number): string {
  return value > 0 ? '+' + value : String(value);
}

export interface PreviewCopy {
  satisfaction: string;
  technique: string;
  detail: string;
}

export function getPreviewCopy(
  preview: PreviewResult,
  scent: ScentType,
  scentById: Record<ScentType, ScentDefinition>,
  customer: Customer | null,
): PreviewCopy {
  const satisfaction = '\u6EE1\u610F\u5EA6 ' + formatSigned(preview.satisfactionAfter) + ' · \u53D8\u5316 ' + formatSigned(preview.satisfactionDelta);
  const technique = preview.techniqueAfter.isPerfect
    ? '\u5B8C\u7F8E\u6280\u6CD5 ' + preview.techniqueAfter.labelZh + ' · +' + preview.techniqueAfter.perfectBonus
    : preview.techniqueAfter.score > 0
      ? preview.techniqueAfter.labelZh + ' ' + preview.techniqueAfter.level + '\u7EA7 · ' + preview.techniqueAfter.score + '\u5206'
      : '\u6280\u6CD5\u65E0\u52A0\u6210';
  const detail = customer
    ? preview.becomesPerfect
      ? '\u52A0\u5165' + scentById[scent].nameZh + '\u540E\u5B8C\u6210' + preview.techniqueAfter.labelZh + '\u7ED3\u6784\u3002'
      : preview.techniqueDelta > 0
        ? '\u52A0\u5165' + scentById[scent].nameZh + '\u540E\uFF0C' + preview.techniqueAfter.labelZh + '\u8DEF\u5F84\u63D0\u5347\u3002'
        : preview.deliverableAfter && !preview.deliverableBefore
          ? '\u52A0\u5165\u540E\u8FBE\u5230\u4EA4\u4ED8\u95E8\u69DB\u3002'
          : preview.satisfactionDelta < 0
            ? '\u52A0\u5165\u540E\u6EE1\u610F\u5EA6\u4E0B\u964D\u3002'
            : '\u52A0\u5165\u540E\u4FDD\u7559\u5F53\u524D\u4F5C\u54C1\u8DEF\u5F84\u3002'
    : '\u8BE5\u5DE5\u4F5C\u53F0\u6682\u65F6\u6CA1\u6709\u987E\u5BA2\u3002';
  return { satisfaction, technique, detail };
}

export function getTechniqueResultLabel(result: TechniqueResult): string {
  return result.isPerfect ? '\u5B8C\u7F8E ' + result.labelZh : result.labelZh + ' ' + result.level + '\u7EA7';
}
