# 01 — プロジェクト基盤整備

## 概要

create-expo-app テンプレートの残骸を整理し、「のんだっけ？」の3タブ構成の骨組みを作る。以降のチケットが乗る土台。

## 参照

- REQUIREMENTS.md §4（下部タブナビ3つ）、§5（画面構成）
- CLAUDE.md（テンプレートコードは置き換え・削除対象）

## タスク

- [ ] テンプレート由来の不要コードを削除
  - `app/(tabs)/explore.tsx`、`app/modal.tsx`
  - `components/` の hello-wave, parallax-scroll-view, external-link, themed-text, themed-view, ui/collapsible
  - `hooks/use-color-scheme*` / `use-theme-color`（MVPはライトモードのみのため不要）
  - `constants/theme.ts`（02で新しいトークンに置き換え）
  - `scripts/reset-project.js` と package.json の `reset-project` スクリプト
- [ ] `app/(tabs)/_layout.tsx` を3タブ構成に変更
  - `index`（カレンダー＝ホーム）／`items`（一覧）／`settings`（設定）
  - タブラベルは日本語：「カレンダー」「一覧」「設定」
- [ ] 各タブにプレースホルダー画面を作成（画面タイトルのみ表示）
- [ ] `app.json` の `userInterfaceStyle` を `"light"` に変更（ダークモード非対応のため）
- [ ] アプリ表示名を「のんだっけ？」に設定（`app.json` の `name`）

## 完了条件

- `npm run lint` と `npx tsc --noEmit` がエラーなしで通る
- Android（エミュレータまたは実機）で起動し、3タブが表示・遷移できる
- テンプレート由来の画面・コンポーネントが残っていない

## 依存

なし（最初のチケット）
