import { Pressable, StyleSheet, Text, View } from 'react-native';

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

// カテゴリ切替タブ（全部／お薬／サプリ／その他）。選択スタイルは登録フォームのチップと共通（DESIGN.md §5）
export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {CATEGORY_FILTER_ORDER.map((filter) => {
        const isSelected = filter === selected;
        return (
          <Pressable
            key={filter ?? 'all'}
            onPress={() => onSelect(filter)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={[styles.tab, isSelected ? styles.tabSelected : styles.tabUnselected]}>
            <Text style={isSelected ? styles.labelSelected : styles.labelUnselected}>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: colors.accentLight,
  },
  tabUnselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  labelSelected: {
    ...typography.body,
    fontWeight: '500',
    color: colors.accentDark,
  },
  labelUnselected: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
