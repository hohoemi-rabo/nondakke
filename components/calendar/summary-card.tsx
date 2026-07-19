import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { colors, typography } from '@/constants/tokens';

type SummaryCardProps = {
  taken: number;
  remaining: number;
};

// 「今日のむもの」サマリーカード（DESIGN.md §5）。
// 全部飲み終えたら文言を変え、数字ゼロを見せない
export function SummaryCard({ taken, remaining }: SummaryCardProps) {
  const total = taken + remaining;

  if (total === 0) {
    return (
      <Card style={styles.card}>
        <Text style={styles.doneText}>今日のむものはありません</Text>
      </Card>
    );
  }

  if (remaining === 0) {
    return (
      <Card style={styles.card}>
        <Text style={styles.doneText}>今日はぜんぶのんだ！</Text>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, styles.row]}>
      <View>
        <Text style={styles.label}>今日のむもの</Text>
        <Text style={typography.summaryNumber}>{total}</Text>
      </View>
      <View style={styles.counts}>
        <Text style={styles.countText}>✓ のんだ {taken}</Text>
        <Text style={styles.countText}>のこり {remaining}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.caption,
    color: colors.accentDeep,
  },
  counts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.accentDeep,
  },
  doneText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accentDark,
  },
});
