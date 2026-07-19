import { Pressable, StyleSheet, Text, View } from 'react-native';

import { categoryFilterTheme } from '@/components/calendar/category-theme';
import { CategoryDot } from '@/components/ui/category-dot';
import { colors, minTapSize, radius, spacing, typography } from '@/constants/tokens';
import {
  CATEGORY_FILTER_ORDER,
  categoryFilterLabel,
  type CategoryFilter,
} from '@/lib/category-filter';

type CategoryTabsProps = {
  selected: CategoryFilter;
  onSelect: (filter: CategoryFilter) => void;
};

// カテゴリ切替タブ（全部／お薬／サプリ／その他）。カテゴリタブには凡例と同じ色ドットを常時表示し、
// 選択中はカテゴリテーマの淡色に染まる（DESIGN.md §5）
export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {CATEGORY_FILTER_ORDER.map((filter) => {
        const isSelected = filter === selected;
        const theme = categoryFilterTheme(filter);
        return (
          <Pressable
            key={filter ?? 'all'}
            onPress={() => onSelect(filter)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.tab,
              isSelected ? { backgroundColor: theme.background } : styles.tabUnselected,
            ]}>
            {filter !== null && <CategoryDot category={filter} size={8} />}
            <Text
              style={[
                styles.label,
                isSelected ? { color: theme.dark, fontWeight: '500' } : styles.labelUnselected,
              ]}>
              {categoryFilterLabel(filter)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    minHeight: minTapSize,
    borderRadius: radius.chip,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tabUnselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.body,
  },
  labelUnselected: {
    color: colors.textSecondary,
  },
});
