import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, minTapSize, radius, spacing, typography } from '@/constants/tokens';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

// 選択式チップ。登録フォームの服用パターン選択などで使用（DESIGN.md §5）
export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}>
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: minTapSize,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.accentLight,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.body,
  },
  labelSelected: {
    color: colors.accentDark,
    fontWeight: '500',
  },
  labelUnselected: {
    color: colors.textSecondary,
  },
});
