import { View } from 'react-native';

import { type Category } from '@/constants/domain';
import { colors } from '@/constants/tokens';

const CATEGORY_COLORS: Record<Category, string> = {
  medicine: colors.catMedicine,
  supplement: colors.catSupplement,
  other: colors.catOther,
};

export function categoryColor(category: Category): string {
  return CATEGORY_COLORS[category];
}

type CategoryDotProps = {
  category: Category;
  size?: number;
  // outline = 予定があったのに未記録の過去日（塗りなし・輪郭のみ、DESIGN.md §5）
  variant?: 'solid' | 'outline';
};

// カレンダー日セル・凡例で使うカテゴリ色ドット（デフォルト5px、DESIGN.md §5）
export function CategoryDot({ category, size = 5, variant = 'solid' }: CategoryDotProps) {
  const color = categoryColor(category);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        ...(variant === 'solid'
          ? { backgroundColor: color }
          : { borderWidth: 1, borderColor: color, backgroundColor: 'transparent' }),
      }}
    />
  );
}
