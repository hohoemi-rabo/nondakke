import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors, radius, spacing, typography } from '@/constants/tokens';

type RecordButtonProps = {
  // 'none' スロット（タイミング未設定）は null で表示を省く
  timingLabel: string | null;
  taken: boolean;
  // 未来日は記録不可
  disabled?: boolean;
  onPress: () => void;
};

// 「のんだ！」記録ボタン（DESIGN.md §5）。タップで即時切替・確認ダイアログなし。
// チェックは常時表示（記録時に色だけ変える）でレイアウトを動かさない
export function RecordButton({ timingLabel, taken, disabled = false, onPress }: RecordButtonProps) {
  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${timingLabel ?? ''}のんだ`.trim()}
      accessibilityState={{ checked: taken, disabled }}
      style={[
        styles.button,
        taken ? styles.buttonTaken : styles.buttonUntaken,
        disabled && styles.buttonDisabled,
      ]}>
      {timingLabel !== null && (
        <Text style={[styles.timing, taken && styles.timingTaken]}>{timingLabel}</Text>
      )}
      <Text style={[styles.label, taken && styles.labelTaken]}>のんだ！</Text>
      <IconSymbol name="checkmark" size={18} color={taken ? colors.accent : colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  buttonUntaken: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  buttonTaken: {
    backgroundColor: colors.accentLight,
    borderColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  timing: {
    ...typography.body,
    fontWeight: '500',
    color: colors.textSecondary,
    minWidth: 48,
  },
  timingTaken: {
    color: colors.accentDark,
  },
  label: {
    ...typography.body,
    flex: 1,
  },
  labelTaken: {
    color: colors.accentDark,
    fontWeight: '500',
  },
});
