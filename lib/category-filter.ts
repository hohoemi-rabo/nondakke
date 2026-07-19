import { CATEGORIES, CATEGORY_LABELS, type Category } from '@/constants/domain';

// カレンダー画面のカテゴリフィルタ（docs/08）。
// null（全部）はDBに存在しないUI概念のため constants/domain.ts ではなくここに置く

export type CategoryFilter = Category | null; // null = 全部

export const CATEGORY_FILTER_ORDER: CategoryFilter[] = [null, ...CATEGORIES];

export function categoryFilterLabel(filter: CategoryFilter): string {
  return filter === null ? '全部' : CATEGORY_LABELS[filter];
}
