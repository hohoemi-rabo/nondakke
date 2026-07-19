import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors, minTapSize, spacing, typography } from '@/constants/tokens';
import { confirmAsync } from '@/lib/confirm';
import { deleteAllData } from '@/lib/db/maintenance';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  async function handleDeleteAll() {
    const ok = await confirmAsync(
      'データをすべて削除しますか？',
      'すべてのアイテムと服用記録を削除します。この操作は取り消せません。',
      '削除する'
    );
    if (!ok) {
      return;
    }
    await deleteAllData(db);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.screenTitle}>設定</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>アプリ情報</Text>
          <Card style={styles.sectionCard}>
            <View style={styles.row}>
              <Text style={typography.body}>アプリ名</Text>
              <Text style={styles.rowValue}>{Constants.expoConfig?.name ?? 'のんだっけ？'}</Text>
            </View>
            <View style={[styles.row, styles.rowSeparator]}>
              <Text style={typography.body}>バージョン</Text>
              <Text style={styles.rowValue}>{Constants.expoConfig?.version ?? '-'}</Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>このアプリについて</Text>
          <Card style={styles.sectionCard}>
            <Pressable
              onPress={() => router.push('/privacy')}
              accessibilityRole="button"
              accessibilityLabel="プライバシーポリシーを表示"
              style={styles.row}>
              <Text style={typography.body}>プライバシーポリシー</Text>
              <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
            </Pressable>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>免責事項</Text>
          <Card>
            <Text style={styles.disclaimer}>
              本アプリは服用の記録を補助するツールであり、医療上の助言を行うものではありません。
              服用については医師・薬剤師にご相談ください。
            </Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>データ</Text>
          <Card style={styles.sectionCard}>
            <Pressable
              onPress={handleDeleteAll}
              accessibilityRole="button"
              accessibilityLabel="データをすべて削除"
              style={styles.row}>
              <Text style={styles.deleteLabel}>データをすべて削除</Text>
            </Pressable>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: minTapSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
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
    justifyContent: 'space-between',
    minHeight: minTapSize,
  },
  rowSeparator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  disclaimer: {
    ...typography.caption,
    lineHeight: 16,
  },
  deleteLabel: {
    ...typography.body,
    color: colors.error,
  },
});
