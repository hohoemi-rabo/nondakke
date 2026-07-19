import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryTabs } from '@/components/calendar/category-tabs';
import { categoryFilterTheme } from '@/components/calendar/category-theme';
import { DayDetailSheet } from '@/components/calendar/day-detail-sheet';
import { Legend } from '@/components/calendar/legend';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { SummaryCard } from '@/components/calendar/summary-card';
import { colors, minTapSize, radius, spacing, typography } from '@/constants/tokens';
import { type CategoryFilter } from '@/lib/category-filter';
import { listItems } from '@/lib/db/items';
import { addRecord, listRecords, removeRecord, type RecordKey } from '@/lib/db/records';
import { type IntakeRecord, type Item } from '@/lib/db/types';
import { summarizeToday } from '@/lib/schedule/calendar';
import { addMonths, monthOf, toDateString } from '@/lib/schedule/date';
import { getMonthSchedule, getTodayItems } from '@/lib/schedule/derive';

export default function CalendarScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [today, setToday] = useState(() => toDateString(new Date()));
  const [yearMonth, setYearMonth] = useState(() => monthOf(toDateString(new Date())));
  // カテゴリフィルタ。タブで切替
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(null);
  // タップで選択した日。非 null の間、日別詳細シートを表示する
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [items, setItems] = useState<Item[] | null>(null); // null = 初回ロード前
  // 記録は全件保持する。interval 型の予定導出が表示月外の最終服用日に依存するため月単位では不十分
  const [records, setRecords] = useState<IntakeRecord[]>([]);

  // フォーカス時に再取得。記録変更後（09）は reload を直接呼ぶ
  async function reload() {
    const now = toDateString(new Date());
    setToday(now);
    const [allItems, allRecords] = await Promise.all([
      // 非アクティブのアイテムの記録も表示対象のため全件取得（derive 側が isActive を処理）
      listItems(db),
      listRecords(db),
    ]);
    setItems(allItems);
    setRecords(allRecords);
  }

  useFocusEffect(() => {
    void reload();
  });

  // 記録のトグル。連打で UNIQUE 制約に当たっても reload で状態が収束する
  async function handleToggle(key: RecordKey, taken: boolean) {
    try {
      if (taken) {
        await removeRecord(db, key);
      } else {
        await addRecord(db, key);
      }
    } catch {
      // 収束のため reload だけ行う
    }
    await reload();
  }

  if (items === null) {
    return <SafeAreaView style={styles.container} />;
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>まだ何も登録されていません</Text>
          <Text style={typography.caption}>のむものを登録すると、カレンダーに予定が表示されます</Text>
          <Pressable
            onPress={() => router.push('/item/new')}
            accessibilityRole="button"
            style={styles.registerButton}>
            <Text style={styles.registerButtonLabel}>のむものを登録する</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const filteredItems =
    selectedCategory === null ? items : items.filter((i) => i.category === selectedCategory);
  const schedule = getMonthSchedule(filteredItems, records, yearMonth, today);
  const { taken, remaining } = summarizeToday(getTodayItems(filteredItems, records, today));
  // タブ・サマリーカード・今日セルを選択中カテゴリの色で揃える
  const theme = categoryFilterTheme(selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />
        <Animated.View
          key={selectedCategory ?? 'all'}
          entering={FadeIn.duration(150)}
          style={styles.fadeGroup}>
          <SummaryCard taken={taken} remaining={remaining} theme={theme} />
          <MonthCalendar
            yearMonth={yearMonth}
            today={today}
            schedule={schedule}
            todayHighlight={theme.background}
            onPrevMonth={() => setYearMonth(addMonths(yearMonth, -1))}
            onNextMonth={() => setYearMonth(addMonths(yearMonth, 1))}
            onSelectDate={setSelectedDate}
          />
        </Animated.View>
        <Legend />
      </ScrollView>
      <DayDetailSheet
        date={selectedDate}
        today={today}
        items={items}
        records={records}
        onToggle={handleToggle}
        onClose={() => setSelectedDate(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  fadeGroup: {
    gap: spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  registerButton: {
    marginTop: spacing.md,
    minHeight: minTapSize,
    borderRadius: radius.card,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  registerButtonLabel: {
    ...typography.body,
    fontWeight: '500',
    color: colors.accentDark,
  },
});
