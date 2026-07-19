import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryDot } from '@/components/ui/category-dot';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WEEKDAY_LABELS } from '@/constants/domain';
import { colors, minTapSize, radius, spacing, typography } from '@/constants/tokens';
import {
  buildMonthGrid,
  formatMonthLabel,
  summarizeDayEntries,
  type DayCellMark,
} from '@/lib/schedule/calendar';
import { type DayEntry } from '@/lib/schedule/derive';

type MonthCalendarProps = {
  yearMonth: string; // 'YYYY-MM'
  today: string; // 'YYYY-MM-DD'
  schedule: Map<string, DayEntry[]>; // getMonthSchedule の結果
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: string) => void;
};

// 自作の月表示カレンダー（docs/07。日セル仕様が独自のため外部ライブラリは使わない）
export function MonthCalendar({
  yearMonth,
  today,
  schedule,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: MonthCalendarProps) {
  const grid = buildMonthGrid(yearMonth);

  return (
    <View>
      <View style={styles.header}>
        <Pressable
          onPress={onPrevMonth}
          accessibilityRole="button"
          accessibilityLabel="前の月"
          style={styles.navButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={typography.monthLabel}>{formatMonthLabel(yearMonth)}</Text>
        <Pressable
          onPress={onNextMonth}
          accessibilityRole="button"
          accessibilityLabel="次の月"
          style={styles.navButton}>
          <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Text
            key={label}
            style={[
              styles.weekdayLabel,
              i === 0 && { color: colors.sunday },
              i === 6 && { color: colors.saturday },
            ]}>
            {label}
          </Text>
        ))}
      </View>

      {grid.map((week, w) => (
        <View key={w} style={styles.weekRow}>
          {week.map((date, i) =>
            date === null ? (
              <View key={`blank-${i}`} style={styles.cell} />
            ) : (
              <DayCell
                key={date}
                date={date}
                isToday={date === today}
                mark={summarizeDayEntries(schedule.get(date) ?? [], date, today)}
                onPress={() => onSelectDate(date)}
              />
            )
          )}
        </View>
      ))}
    </View>
  );
}

function DayCell({
  date,
  isToday,
  mark,
  onPress,
}: {
  date: string;
  isToday: boolean;
  mark: DayCellMark | null;
  onPress: () => void;
}) {
  const day = Number(date.slice(8));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${day}日`}
      style={[styles.cell, isToday && styles.cellToday]}>
      <Text
        style={[
          typography.calendarDay,
          isToday && styles.dayNumberToday,
          mark?.kind === 'check' && { color: colors.textMuted },
        ]}>
        {day}
      </Text>
      <View style={styles.markRow}>
        {mark?.kind === 'check' && <Text style={styles.check}>✓</Text>}
        {mark?.kind === 'dots' && (
          <>
            {mark.dots.map((dot, i) => (
              <CategoryDot
                key={i}
                category={dot.category}
                variant={dot.filled ? 'solid' : 'outline'}
              />
            ))}
            {mark.overflow && <Text style={styles.overflow}>+</Text>}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    minWidth: minTapSize,
    minHeight: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    ...typography.caption,
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  cell: {
    flex: 1,
    minHeight: minTapSize,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  cellToday: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.cell,
  },
  dayNumberToday: {
    fontWeight: '500',
  },
  // 高さを固定してマークの有無でセルの縦位置が揺れないようにする
  markRow: {
    height: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  check: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent,
  },
  overflow: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});
