import { StyleSheet, Text, View } from 'react-native';

import { type CategoryTheme } from '@/components/calendar/category-theme';
import { Card } from '@/components/ui/card';
import { typography } from '@/constants/tokens';

type SummaryCardProps = {
  taken: number;
  remaining: number;
  // 選択中カテゴリのテーマ。タブ・今日セルと同じ色に染まる
  theme: CategoryTheme;
};

// 「今日のむもの」サマリーカード（DESIGN.md §5）。
// 全部飲み終えたら文言を変え、数字ゼロを見せない
export function SummaryCard({ taken, remaining, theme }: SummaryCardProps) {
  const total = taken + remaining;

  if (total === 0) {
    return (
      <Card style={{ backgroundColor: theme.background }}>
        <Text style={[styles.doneText, { color: theme.dark }]}>今日のむものはありません</Text>
      </Card>
    );
  }

  if (remaining === 0) {
    return (
      <Card style={{ backgroundColor: theme.background }}>
        <Text style={[styles.doneText, { color: theme.dark }]}>今日はぜんぶのんだ！</Text>
      </Card>
    );
  }

  return (
    <Card style={[styles.row, { backgroundColor: theme.background }]}>
      <View>
        <Text style={[styles.label, { color: theme.deep }]}>今日のむもの</Text>
        <Text style={[typography.summaryNumber, { color: theme.dark }]}>{total}</Text>
      </View>
      <View style={styles.counts}>
        <Text style={[styles.countText, { color: theme.deep }]}>✓ のんだ {taken}</Text>
        <Text style={[styles.countText, { color: theme.deep }]}>のこり {remaining}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.caption,
  },
  counts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '400',
  },
  doneText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
