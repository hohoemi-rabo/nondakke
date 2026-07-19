import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { CategoryDot } from '@/components/ui/category-dot';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CATEGORIES, CATEGORY_LABELS } from '@/constants/domain';
import { colors, minTapSize, radius, spacing, typography } from '@/constants/tokens';
import { confirmAsync } from '@/lib/confirm';
import { deactivateItem, listItems, reactivateItem } from '@/lib/db/items';
import { getLastTakenDates } from '@/lib/db/records';
import { type Item } from '@/lib/db/types';
import { formatDateLabel, formatScheduleLabel } from '@/lib/schedule/calendar';

export default function ItemsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [items, setItems] = useState<Item[] | null>(null); // null = 初回ロード前
  const [lastTaken, setLastTaken] = useState<Map<number, string>>(new Map());

  async function reload() {
    const [allItems, lastDates] = await Promise.all([listItems(db), getLastTakenDates(db)]);
    setItems(allItems);
    setLastTaken(lastDates);
  }

  useFocusEffect(() => {
    void reload();
  });

  async function handleDeactivate(item: Item) {
    const ok = await confirmAsync(
      '服用を中止しますか？',
      '過去の記録はカレンダーに残ります',
      '中止する'
    );
    if (!ok) {
      return;
    }
    await deactivateItem(db, item.id);
    await reload();
  }

  async function handleReactivate(item: Item) {
    await reactivateItem(db, item.id);
    await reload();
  }

  const renderRow = (item: Item, index: number) => {
    const last = lastTaken.get(item.id);
    return (
      <View key={item.id} style={[styles.row, index > 0 && styles.rowSeparator]}>
        <Pressable
          onPress={() => router.push(`/item/${item.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}を編集`}
          style={styles.rowMain}>
          <View style={styles.nameRow}>
            <CategoryDot category={item.category} size={8} />
            <Text style={[typography.body, !item.isActive && styles.mutedText]} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <Text style={[styles.rowCaption, !item.isActive && styles.mutedText]} numberOfLines={1}>
            {formatScheduleLabel(item)}・最終服用日 {last ? formatDateLabel(last) : '記録なし'}
          </Text>
        </Pressable>
        {item.isActive ? (
          <Pressable
            onPress={() => handleDeactivate(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}の服用を中止`}
            style={styles.rowAction}>
            <Text style={styles.deactivateLabel}>中止</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => handleReactivate(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}の服用を再開`}
            style={styles.rowAction}>
            <Text style={styles.reactivateLabel}>再開</Text>
          </Pressable>
        )}
      </View>
    );
  };

  const inactiveItems = (items ?? []).filter((i) => !i.isActive);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.screenTitle}>一覧</Text>
        <Pressable
          onPress={() => router.push('/item/new')}
          accessibilityRole="button"
          accessibilityLabel="新規登録"
          style={styles.addButton}>
          <IconSymbol name="plus" size={24} color={colors.accentDeep} />
        </Pressable>
      </View>

      {items !== null &&
        (items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>まだ何も登録されていません</Text>
            <Text style={typography.caption}>のむものを登録すると、ここに一覧表示されます</Text>
            <Pressable
              onPress={() => router.push('/item/new')}
              accessibilityRole="button"
              style={styles.registerButton}>
              <Text style={styles.registerButtonLabel}>のむものを登録する</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {CATEGORIES.map((category) => {
              const sectionItems = items.filter((i) => i.isActive && i.category === category);
              if (sectionItems.length === 0) {
                return null;
              }
              return (
                <View key={category} style={styles.section}>
                  <Text style={styles.sectionLabel}>{CATEGORY_LABELS[category]}</Text>
                  <Card style={styles.sectionCard}>{sectionItems.map(renderRow)}</Card>
                </View>
              );
            })}
            {inactiveItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>中止中（記録は残っています）</Text>
                <Card style={styles.sectionCard}>{inactiveItems.map(renderRow)}</Card>
              </View>
            )}
          </ScrollView>
        ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  addButton: {
    minWidth: minTapSize,
    minHeight: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    ...typography.caption,
  },
  sectionCard: {
    paddingVertical: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: minTapSize,
  },
  rowSeparator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowMain: {
    flex: 1,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowCaption: {
    ...typography.caption,
    // ドット(8px)＋gap ぶん字下げして名前の頭と揃える
    paddingLeft: 8 + spacing.sm,
  },
  rowAction: {
    minWidth: minTapSize,
    minHeight: minTapSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deactivateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  reactivateLabel: {
    ...typography.caption,
    color: colors.accentDeep,
    fontWeight: '500',
  },
  mutedText: {
    color: colors.textMuted,
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
