import { ScrollView, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '@/constants/tokens';

// プライバシーポリシー＋免責事項（アプリ内静的表示。docs/11、REQUIREMENTS.md §7・§9）
export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.body}>
        「のんだっけ？」（以下「本アプリ」）は、ユーザーのプライバシーを尊重します。
      </Text>

      <Text style={styles.heading}>データの取り扱い</Text>
      <Text style={styles.body}>
        ・記録されたデータ（のむものの情報・服用記録）は、すべてお使いの端末内にのみ保存されます。{'\n'}
        ・本アプリは、データを外部サーバーへ送信しません。{'\n'}
        ・本アプリは、個人情報・利用状況などのいかなる情報も収集しません。{'\n'}
        ・アカウント登録は不要で、アクセス解析や広告のための仕組みも含まれていません。
      </Text>

      <Text style={styles.heading}>データの削除</Text>
      <Text style={styles.body}>
        記録されたデータは、設定画面の「データをすべて削除」からいつでも削除できます。
        アプリを端末から削除した場合、データもすべて削除されます。
      </Text>

      <Text style={styles.heading}>免責事項</Text>
      <Text style={styles.body}>
        本アプリは服用の記録を補助するツールであり、医療上の助言・診断・治療を提供するものではありません。
        服用方法や体調に関する判断は、医師または薬剤師にご相談ください。
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  heading: {
    ...typography.body,
    fontWeight: '500',
    color: colors.accentDark,
  },
  body: {
    ...typography.body,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
