import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIndicator } from '@/components/calendar/category-indicator';
import { Legend } from '@/components/calendar/legend';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { SummaryCard } from '@/components/calendar/summary-card';
import { colors, minTapSize, radius, spacing, typography } from '@/constants/tokens';
import { cycleCategoryFilter, type CategoryFilter } from '@/lib/category-filter';
import { listItems } from '@/lib/db/items';
import { listRecordsByMonth } from '@/lib/db/records';
import { type IntakeRecord, type Item } from '@/lib/db/types';
import { summarizeToday } from '@/lib/schedule/calendar';
import { addMonths, monthOf, toDateString } from '@/lib/schedule/date';
import { getMonthSchedule, getTodayItems } from '@/lib/schedule/derive';

export default function CalendarScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [today, setToday] = useState(() => toDateString(new Date()));
  const [yearMonth, setYearMonth] = useState(() => monthOf(toDateString(new Date())));
  // カテゴリフィルタ。スワイプ・インジケータータップで循環切替
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(null);
  // タップで選択した日。日別詳細シート（チケット09）がこの値を消費するまで参照は void のみ
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  void selectedDate;
  const [items, setItems] = useState<Item[] | null>(null); // null = 初回ロード前
  const [monthRecords, setMonthRecords] = useState<IntakeRecord[]>([]);
  const [todayRecords, setTodayRecords] = useState<IntakeRecord[]>([]);

  // フォーカス時・月送り時に再取得。記録変更後（09）は reload を直接呼ぶ
  async function reload() {
    const now = toDateString(new Date());
    setToday(now);
    const [allItems, mRecords] = await Promise.all([
      // 非アクティブのアイテムの記録も表示対象のため全件取得（derive 側が isActive を処理）
      listItems(db),
      listRecordsByMonth(db, yearMonth),
    ]);
    // サマリーカードは常に「今日」を表示する。表示月が今日の月でない場合は別途取得
    const tRecords =
      yearMonth === monthOf(now) ? mRecords : await listRecordsByMonth(db, monthOf(now));
    setItems(allItems);
    setMonthRecords(mRecords);
    setTodayRecords(tRecords);
  }

  useFocusEffect(() => {
    void reload();
  });

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
  const schedule = getMonthSchedule(filteredItems, monthRecords, yearMonth, today);
  const { taken, remaining } = summarizeToday(getTodayItems(filteredItems, todayRecords, today));

  // 左スワイプ = 次のカテゴリ（ページ送り方向）。横16pxまで非活性でタップと、
  // 縦12pxで失敗にして縦スクロールと役割分担する（docs/08 設計メモ）
  const swipeFilter = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .failOffsetY([-12, 12])
    .runOnJS(true)
    .onEnd((e) => {
      if (Math.abs(e.translationX) < 48 && Math.abs(e.velocityX) < 500) {
        return;
      }
      setSelectedCategory((c) => cycleCategoryFilter(c, e.translationX < 0 ? 1 : -1));
    });

  return (
    <SafeAreaView style={styles.container}>
      <GestureDetector gesture={swipeFilter}>
        <ScrollView contentContainerStyle={styles.content}>
          <CategoryIndicator
            selected={selectedCategory}
            onPress={() => setSelectedCategory((c) => cycleCategoryFilter(c, 1))}
          />
          <Animated.View
            key={selectedCategory ?? 'all'}
            entering={FadeIn.duration(150)}
            style={styles.fadeGroup}>
            <SummaryCard taken={taken} remaining={remaining} />
            <MonthCalendar
              yearMonth={yearMonth}
              today={today}
              schedule={schedule}
              onPrevMonth={() => setYearMonth(addMonths(yearMonth, -1))}
              onNextMonth={() => setYearMonth(addMonths(yearMonth, 1))}
              onSelectDate={setSelectedDate}
            />
          </Animated.View>
          <Legend />
        </ScrollView>
      </GestureDetector>
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
