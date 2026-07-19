import { CATEGORIES, CATEGORY_LABELS, type Category } from '@/constants/domain';

// カレンダー画面のカテゴリフィルタ（docs/08）。
// null（全部）はDBに存在しないUI概念のため constants/domain.ts ではなくここに置く。
// Phase 2 でスワイプがタブUIに変わっても、この循環ロジックはそのまま使う

export type CategoryFilter = Category | null; // null = 全部

export const CATEGORY_FILTER_ORDER: CategoryFilter[] = [null, ...CATEGORIES];

// 全部 → お薬 → サプリ → その他 → 全部 のループ。direction -1 で逆順
export function cycleCategoryFilter(current: CategoryFilter, direction: 1 | -1): CategoryFilter {
  const order = CATEGORY_FILTER_ORDER;
  const index = order.indexOf(current);
  return order[(index + direction + order.length) % order.length];
}

export function categoryFilterLabel(filter: CategoryFilter): string {
  return filter === null ? '全部' : CATEGORY_LABELS[filter];
}
