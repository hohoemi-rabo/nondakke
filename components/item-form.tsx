import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/ui/chip';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  SCHEDULE_TYPES,
  SCHEDULE_TYPE_LABELS,
  TIMINGS,
  TIMING_LABELS,
  WEEKDAY_LABELS,
  WEEKDAYS_MON_FIRST,
} from '@/constants/domain';
import { colors, minTapSize, radius, spacing, typography } from '@/constants/tokens';
import { type ItemInput } from '@/lib/db/items';
import { type Item } from '@/lib/db/types';
import {
  emptyItemFormState,
  itemFormStateFromItem,
  itemFormToInput,
  toggleInArray,
  validateItemForm,
} from '@/lib/item-form';

type ItemFormProps = {
  initialItem?: Item;
  // 保存成功時のナビゲーションは呼び出し側が行う
  onSave: (input: ItemInput) => Promise<void>;
  // 編集時のみ渡す。確認ダイアログ・削除実行・ナビゲーションは呼び出し側が行う
  onDelete?: () => Promise<void>;
};

// アイテム登録・編集フォーム（docs/06、DESIGN.md §5）。
// 必須2項目（名前・服用パターン）を最上部、任意項目は下に寄せる
export function ItemForm({ initialItem, onSave, onDelete }: ItemFormProps) {
  const [form, setForm] = useState(() =>
    initialItem ? itemFormStateFromItem(initialItem) : emptyItemFormState()
  );
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Android はエッジトゥエッジ表示のため、下端インセットを足さないと
  // ボタンがナビゲーションバーに重なる
  const insets = useSafeAreaInsets();

  // エラーは保存を試みた後だけ表示し、修正されれば自動で消える
  const errors = attempted ? validateItemForm(form) : {};

  const handleSave = async () => {
    setAttempted(true);
    if (Object.keys(validateItemForm(form)).length > 0) {
      return;
    }
    setSaving(true);
    try {
      await onSave(itemFormToInput(form));
    } catch (e) {
      setSaving(false);
      Alert.alert('保存できませんでした', e instanceof Error ? e.message : String(e));
    }
  };

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }
    setDeleting(true);
    try {
      await onDelete();
    } catch (e) {
      Alert.alert('削除できませんでした', e instanceof Error ? e.message : String(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xl + insets.bottom }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>名前</Text>
            <Text style={styles.required}>必須</Text>
          </View>
          <TextInput
            style={[styles.input, errors.name != null && styles.inputError]}
            value={form.name}
            onChangeText={(name) => setForm((f) => ({ ...f, name }))}
            placeholder="例：血圧の薬、ビタミンD など自分がわかる名前でOK"
            placeholderTextColor={colors.textMuted}
          />
          {errors.name != null && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>服用パターン</Text>
            <Text style={styles.required}>必須</Text>
          </View>
          <View style={styles.chipRow}>
            {SCHEDULE_TYPES.map((type) => (
              <Chip
                key={type}
                label={SCHEDULE_TYPE_LABELS[type]}
                selected={form.scheduleType === type}
                onPress={() => setForm((f) => ({ ...f, scheduleType: type }))}
              />
            ))}
          </View>
          {form.scheduleType === 'interval' && (
            <>
              <View style={styles.intervalRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.intervalInput,
                    errors.intervalDays != null && styles.inputError,
                  ]}
                  value={form.intervalDaysText}
                  onChangeText={(intervalDaysText) => setForm((f) => ({ ...f, intervalDaysText }))}
                  keyboardType="number-pad"
                  placeholder="3"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.body}>日に1回</Text>
              </View>
              {errors.intervalDays != null && (
                <Text style={styles.errorText}>{errors.intervalDays}</Text>
              )}
            </>
          )}
          {form.scheduleType === 'weekly' && (
            <>
              <View style={styles.chipRow}>
                {WEEKDAYS_MON_FIRST.map((day) => (
                  <Chip
                    key={day}
                    label={WEEKDAY_LABELS[day]}
                    selected={form.weekdays.includes(day)}
                    onPress={() =>
                      setForm((f) => ({ ...f, weekdays: toggleInArray(f.weekdays, day) }))
                    }
                  />
                ))}
              </View>
              {errors.weekdays != null && <Text style={styles.errorText}>{errors.weekdays}</Text>}
            </>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>カテゴリ</Text>
            <Text style={styles.optional}>任意</Text>
          </View>
          <View style={styles.chipRow}>
            {CATEGORIES.map((category) => (
              <Chip
                key={category}
                label={CATEGORY_LABELS[category]}
                selected={form.category === category}
                onPress={() => setForm((f) => ({ ...f, category }))}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>タイミング</Text>
            <Text style={styles.optional}>任意</Text>
          </View>
          <View style={styles.chipRow}>
            {TIMINGS.map((timing) => (
              <Chip
                key={timing}
                label={TIMING_LABELS[timing]}
                selected={form.timings.includes(timing)}
                onPress={() =>
                  setForm((f) => ({ ...f, timings: toggleInArray(f.timings, timing) }))
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>メモ</Text>
            <Text style={styles.optional}>任意</Text>
          </View>
          <TextInput
            style={[styles.input, styles.memoInput]}
            value={form.memo}
            onChangeText={(memo) => setForm((f) => ({ ...f, memo }))}
            placeholder="用量・注意事項など"
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving || deleting}
          accessibilityRole="button"
          style={[styles.saveButton, (saving || deleting) && styles.saveButtonDisabled]}>
          <Text style={styles.saveButtonLabel}>保存する</Text>
        </Pressable>

        {onDelete != null && (
          <Pressable
            onPress={handleDelete}
            disabled={saving || deleting}
            accessibilityRole="button"
            style={[styles.deleteButton, (saving || deleting) && styles.saveButtonDisabled]}>
            <Text style={styles.deleteButtonLabel}>このアイテムを削除</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  label: {
    ...typography.body,
    fontWeight: '500',
  },
  required: {
    ...typography.caption,
    color: colors.accentDeep,
  },
  optional: {
    ...typography.caption,
    color: colors.textMuted,
  },
  body: {
    ...typography.body,
  },
  input: {
    ...typography.body,
    minHeight: minTapSize,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.cell,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  intervalInput: {
    width: 72,
    textAlign: 'center',
  },
  memoInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  saveButton: {
    minHeight: minTapSize + 4,
    borderRadius: radius.card,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonLabel: {
    ...typography.body,
    fontWeight: '500',
    color: colors.accentDark,
  },
  deleteButton: {
    minHeight: minTapSize,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonLabel: {
    ...typography.body,
    color: colors.error,
  },
});
