import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, spacing } from '@/constants/tokens';

// surface背景・角丸14・影なしのカード（DESIGN.md §5）
export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
  },
});
