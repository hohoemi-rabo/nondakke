import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryDot } from '@/components/ui/category-dot';
import { RecordButton } from '@/components/ui/record-button';
import { TIMING_LABELS } from '@/constants/domain';
import { colors, minTapSize, radius, spacing, typography } from '@/constants/tokens';
import { type RecordKey } from '@/lib/db/records';
import { type IntakeRecord, type Item } from '@/lib/db/types';
import { formatDateLabel } from '@/lib/schedule/calendar';
import { deriveDayDetail, type DayDetailEntry } from '@/lib/schedule/derive';

type DayDetailSheetProps = {
  date: string | null; // null = 閉じている
  today: string;
  items: Item[]; // 全アイテム（カテゴリフィルタ非適用 — シートはその日の全記録の真実）
  records: IntakeRecord[]; // 表示月の記録（選択日は常に表示月内）
  onToggle: (key: RecordKey, taken: boolean) => void;
  onClose: () => void;
};

// 日別詳細ボトムシート（docs/09）。予定・記録の一覧とワンタップ記録。
// 過去日の追記・取り消しも当日と同じ操作。未来日は記録不可
export function DayDetailSheet({
  date,
  today,
  items,
  records,
  onToggle,
  onClose,
}: DayDetailSheetProps) {
  return (
    <Modal
      visible={date !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      {date !== null && (
        <View style={styles.container}>
          <Pressable
            style={styles.backdrop}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="閉じる"
          />
          <SheetBody
            date={date}
            today={today}
            items={items}
            records={records}
            onToggle={onToggle}
            onClose={onClose}
          />
        </View>
      )}
    </Modal>
  );
}

function SheetBody({
  date,
  today,
  items,
  records,
  onToggle,
  onClose,
}: DayDetailSheetProps & { date: string }) {
  const { entries, asNeeded } = deriveDayDetail(items, records, date, today);
  const isFuture = date > today;
  const isEmpty = entries.length === 0 && (isFuture || asNeeded.length === 0);

  const renderEntry = ({ item, slots }: DayDetailEntry) => (
    <View key={item.id} style={styles.entry}>
      <View style={styles.itemRow}>
        <CategoryDot category={item.category} size={8} />
        <Text style={styles.itemName}>{item.name}</Text>
      </View>
      {slots.map((slot) => (
        <RecordButton
          key={slot.timing}
          timingLabel={slot.timing === 'none' ? null : TIMING_LABELS[slot.timing]}
          taken={slot.taken}
          disabled={isFuture}
          onPress={() =>
            onToggle({ itemId: item.id, takenDate: date, timing: slot.timing }, slot.taken)
          }
        />
      ))}
    </View>
  );

  return (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <Text style={typography.screenTitle}>{formatDateLabel(date)}</Text>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="シートを閉じる"
          style={styles.closeButton}>
          <Text style={styles.closeLabel}>閉じる</Text>
        </Pressable>
      </View>
      {isFuture && <Text style={styles.futureNote}>未来の日付には記録できません</Text>}
      <ScrollView contentContainerStyle={styles.content}>
        {isEmpty ? (
          <Text style={styles.emptyText}>この日の予定はありません</Text>
        ) : (
          <>
            {entries.map(renderEntry)}
            {!isFuture && asNeeded.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>不定期のアイテムを記録</Text>
                {asNeeded.map(renderEntry)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    maxHeight: '70%',
    paddingTop: spacing.sm,
    // 弱い影（elevation 2 相当まで。DESIGN.md §4）
    elevation: 2,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  closeButton: {
    minHeight: minTapSize,
    minWidth: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  closeLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  futureNote: {
    ...typography.caption,
    paddingHorizontal: spacing.md,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  entry: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemName: {
    ...typography.body,
    fontWeight: '500',
  },
  sectionLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
