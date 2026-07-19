import type { TextStyle } from 'react-native';

// DESIGN.md §2 カラートークン。ここ以外で色リテラルを定義しない
export const colors = {
  // ベース
  background: '#FFFFFF', // 画面背景（全画面共通）
  surface: '#FFFFFF', // カード背景
  border: '#F1EFE8', // 区切り線（0.5px相当の薄さで使う）

  // テキスト
  textPrimary: '#2C2C2A', // 本文・日付数字
  textSecondary: '#5F5E5A', // 補足・凡例
  textMuted: '#B4B2A9', // 非活性・過去日

  // アクセント（ティール）
  accent: '#1D9E75', // ドット・チェック・選択中タブ
  accentDeep: '#0F6E56', // アクセント上の小テキスト
  accentDark: '#04342C', // アクセント淡背景上の見出し・数字
  accentLight: '#E1F5EE', // サマリーカード背景・今日セルのハイライト

  // カテゴリ色
  catMedicine: '#1D9E75', // お薬（アクセントと共通）
  catSupplement: '#D85A30', // サプリ（コーラル）
  catOther: '#B4B2A9', // その他（グレー）

  // カテゴリ淡色トーン（選択中タブの背景・ラベル。お薬は accentLight / accentDark を共用）
  catSupplementLight: '#F9E7DF', // サプリ選択タブの背景
  catSupplementDark: '#7E3418', // サプリ淡背景上のラベル
  catOtherLight: '#F0EFEB', // その他選択タブの背景（ラベルは textSecondary を共用）

  // 曜日
  sunday: '#993C1D',
  saturday: '#185FA5',

  // エラー表示にのみ使用可
  error: '#C4442A',

  // ボトムシートのバックドロップ（textPrimary 由来の中立スクリム）
  overlay: 'rgba(44, 44, 42, 0.3)',
} as const;

// DESIGN.md §4 余白・形状
export const spacing = { xs: 4, sm: 8, md: 14, lg: 18, xl: 24 } as const;
export const radius = { card: 14, sheet: 20, chip: 999, cell: 8 } as const;

// タップ領域の最低サイズ（DESIGN.md §4）
export const minTapSize = 44;

// DESIGN.md §3 タイポグラフィ。ウェイトは 400 / 500 のみ
export const typography = {
  // サマリーカードの大数字
  summaryNumber: { fontSize: 26, fontWeight: '500', color: colors.accentDark },
  // 画面タイトル・アプリ名
  screenTitle: { fontSize: 17, fontWeight: '500', color: colors.accentDark },
  // 月表示（2026年7月）
  monthLabel: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  // 本文・リスト項目
  body: { fontSize: 14, fontWeight: '400', color: colors.textPrimary },
  // カレンダー日付（今日のみ画面側で 500 に上書き）
  calendarDay: { fontSize: 12, fontWeight: '400', color: colors.textPrimary },
  // 補足・凡例・タブラベル
  caption: { fontSize: 11, fontWeight: '400', color: colors.textSecondary },
} as const satisfies Record<string, TextStyle>;
