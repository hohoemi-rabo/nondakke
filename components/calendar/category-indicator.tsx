import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, minTapSize, spacing, typography } from '@/constants/tokens';
import {
  CATEGORY_FILTER_ORDER,
  categoryFilterLabel,
  type CategoryFilter,
} from '@/lib/category-filter';

type CategoryIndicatorProps = {
  selected: CategoryFilter;
  // タップで次カテゴリへ。スワイプ操作の補助（スクリーンリーダー・キーボード向け）
  onPress?: () => void;
};

// 現在カテゴリのドットインジケーター＋ラベル（REQUIREMENTS.md §5.1）
export function CategoryIndicator({ selected, onPress }: CategoryIndicatorProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`カテゴリ: ${categoryFilterLabel(selected)}、タップで切り替え`}
      style={styles.row}>
      <View style={styles.dots}>
        {CATEGORY_FILTER_ORDER.map((filter) => (
          <View
            key={filter ?? 'all'}
            style={[
              styles.dot,
              { backgroundColor: filter === selected ? colors.accent : colors.textMuted },
            ]}
          />
        ))}
      </View>
      <Text style={typography.caption}>{categoryFilterLabel(selected)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTapSize,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
