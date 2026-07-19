import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryDot } from '@/components/ui/category-dot';
import { type Category } from '@/constants/domain';
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

// 選択中タブの配色。カテゴリの識別色で「いまどのカテゴリ表示か」を伝える（DESIGN.md §5）。
// お薬はアクセントと共通のため「全部」と同じトーンになるが、ドットの有無で区別できる
const SELECTED_COLORS: Record<'all' | Category, { background: string; label: string }> = {
  all: { background: colors.accentLight, label: colors.accentDark },
  medicine: { background: colors.accentLight, label: colors.accentDark },
  supplement: { background: colors.catSupplementLight, label: colors.catSupplementDark },
  other: { background: colors.catOtherLight, label: colors.textSecondary },
};

// カテゴリ切替タブ（全部／お薬／サプリ／その他）。カテゴリタブには凡例と同じ色ドットを常時表示
export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {CATEGORY_FILTER_ORDER.map((filter) => {
        const isSelected = filter === selected;
        const selectedColors = SELECTED_COLORS[filter ?? 'all'];
        return (
          <Pressable
            key={filter ?? 'all'}
            onPress={() => onSelect(filter)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.tab,
              isSelected
                ? { backgroundColor: selectedColors.background }
                : styles.tabUnselected,
            ]}>
            {filter !== null && <CategoryDot category={filter} size={8} />}
            <Text
              style={[
                styles.label,
                isSelected
                  ? { color: selectedColors.label, fontWeight: '500' }
                  : styles.labelUnselected,
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
