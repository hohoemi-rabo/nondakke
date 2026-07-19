import { StyleSheet, Text, View } from 'react-native';

import { CategoryDot } from '@/components/ui/category-dot';
import { CATEGORIES, CATEGORY_LABELS } from '@/constants/domain';
import { spacing, typography } from '@/constants/tokens';

// カテゴリ色の凡例。カレンダー直下に常時表示（DESIGN.md §5）
export function Legend() {
  return (
    <View style={styles.row}>
      {CATEGORIES.map((category) => (
        <View key={category} style={styles.entry}>
          <CategoryDot category={category} />
          <Text style={typography.caption}>{CATEGORY_LABELS[category]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
