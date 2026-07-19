# 02 — デザイントークン・共通UI部品

## 概要

DESIGN.md のカラートークン・余白・形状・タイポグラフィをコード化し、全画面で使い回す基本UI部品を作る。以降の画面チケットはここで定義したトークン以外の色・値を使わない。

## 参照

- DESIGN.md §2（カラートークン）、§3（タイポグラフィ）、§4（余白・形状）、§6（Do/Don't）

## タスク

- [ ] `constants/tokens.ts` を作成
  - `colors`：DESIGN.md §2 の定義をそのまま転記（background / surface / border / textPrimary / textSecondary / textMuted / accent / accentDeep / accentDark / accentLight / catMedicine / catSupplement / catOther / sunday / saturday、エラー色 `#C4442A`）
  - `spacing = { xs: 4, sm: 8, md: 14, lg: 18, xl: 24 }`
  - `radius = { card: 14, sheet: 20, chip: 999, cell: 8 }`
- [ ] タイポグラフィのプリセットを定義（DESIGN.md §3 の表に対応：サマリー大数字 26/500、画面タイトル 17/500、本文 14/400 など）。ウェイトは 400 / 500 のみ
- [ ] 共通部品を作成
  - `Card`：surface背景・角丸14・影なし・内側パディング14–16
  - `Chip`：選択式チップ（選択中 = accentLight背景＋accentDark文字）。登録フォームの服用パターン選択で使用
  - カテゴリ色ドット（カテゴリ→色のマッピング関数を含む）
- [ ] カテゴリ・タイミング・服用パターンの定数と日本語ラベルを定義
  - category: `medicine`「お薬」/ `supplement`「サプリ」/ `other`「その他」
  - timing: `morning`「朝」/ `noon`「昼」/ `evening`「夕」/ `bedtime`「就寝前」
  - schedule_type: `daily`「毎日」/ `interval`「N日に1回」/ `weekly`「曜日指定」/ `as_needed`「不定期」

## 完了条件

- 色・余白・角丸のリテラル値が画面コードに直接現れず、すべてトークン経由で参照できる状態
- `npm run lint` / `npx tsc --noEmit` が通る

## 依存

- 01（プロジェクト基盤整備）
