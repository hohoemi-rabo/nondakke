import { colors } from '@/constants/tokens';
import { type CategoryFilter } from '@/lib/category-filter';

export type CategoryTheme = {
  background: string; // 淡色背景（選択中タブ・サマリーカード・今日セル）
  deep: string; // 淡背景上の小テキスト
  dark: string; // 淡背景上の見出し・数字・タブラベル
};

// カテゴリフィルタ連動の配色テーマ（DESIGN.md §5）。
// タブ・サマリーカード・今日セルが同じテーマで染まり、いまどのカテゴリ表示かを色で伝える
export function categoryFilterTheme(filter: CategoryFilter): CategoryTheme {
  switch (filter) {
    // お薬はアクセントと同系だが、「全部」（accentLight）と見分けられるよう一段濃いミント
    case 'medicine':
      return {
        background: colors.catMedicineLight,
        deep: colors.accentDeep,
        dark: colors.accentDark,
      };
    case 'supplement':
      return {
        background: colors.catSupplementLight,
        deep: colors.catSupplementDark,
        dark: colors.catSupplementDark,
      };
    case 'other':
      return {
        background: colors.catOtherLight,
        deep: colors.textSecondary,
        dark: colors.textPrimary,
      };
    // null（全部）はアプリの基本色
    default:
      return {
        background: colors.accentLight,
        deep: colors.accentDeep,
        dark: colors.accentDark,
      };
  }
}
