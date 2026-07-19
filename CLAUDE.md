# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## プロジェクト概要

「のんだっけ？」— 服薬・サプリ摂取記録カレンダーアプリ（Expo SDK 54 / React Native / TypeScript / expo-router）。

- 仕様の唯一の情報源は **REQUIREMENTS.md**（要件・データモデル・画面構成）と **DESIGN.md**（カラートークン・タイポ・コンポーネント仕様）。実装前に必ず両方を参照すること
- 実装タスクは **docs/00-overview.md** のチケット（01〜12、依存関係つき）に分割済み。着手時は該当チケットを読み、完了条件を満たすこと。チケット完了時はチケットファイルのチェックボックスと 00-overview.md の状態列を更新する（docs: コミットで実装と分離）

## コード構成（チケット01〜09 完了時点）

- `app/(tabs)/` — 3タブ：`index.tsx`（カレンダー=ホーム。月表示＋サマリーカード＋カテゴリスワイプ＋日別詳細シート実装済み。記録トグルは `handleToggle` → `reload()` で即時反映）／`items.tsx`（一覧）／`settings.tsx`（設定）。10〜11 でプレースホルダーから実装に置き換える
- `components/calendar/` — `summary-card.tsx`／`month-calendar.tsx`（自作月グリッド。外部カレンダーライブラリ禁止）／`legend.tsx`／`category-indicator.tsx`（ドット4つ＋ラベル。タップでも循環）／`day-detail-sheet.tsx`（RNコア Modal のボトムシート。表示専用でミューテーションは親が持つ。未来日は記録不可）。表示ロジックは `lib/schedule/calendar.ts` の純粋関数（buildMonthGrid / summarizeDayEntries / summarizeToday / formatDateLabel）に分離。日別スロット導出は `lib/schedule/derive.ts` の `deriveDayDetail`
- `components/ui/record-button.tsx` — 「のんだ！」記録ボタン（未記録=白+枠／記録済み=accentLight+チェック。確認ダイアログなし・取り消しは再タップ）
- `lib/category-filter.ts` — カテゴリフィルタの循環ロジック（null=全部はUI概念のため domain.ts に置かない）。スワイプは Pan + `.runOnJS(true)`、`GestureHandlerRootView` はルートレイアウトに設置済み
- `app/item/` — `new.tsx`（新規登録）／`[id].tsx`（編集）。ルートレイアウトで `presentation: 'modal'` 登録。ルートファイルは薄く保ち、フォーム本体は `components/item-form.tsx`
- `constants/tokens.ts` — カラー・余白・角丸・タイポのデザイントークン（DESIGN.md §2〜§4 の唯一のコード化。色リテラルをここ以外に書かない）
- `constants/domain.ts` — Category / Timing / ScheduleType の型・定数・日本語ラベル＋曜日定数（WEEKDAY_LABELS / WEEKDAYS_MON_FIRST）
- `components/ui/` — Card / Chip / CategoryDot（+テンプレート由来で継続使用の icon-symbol, haptic-tab）
- `components/item-form.tsx` — 登録・編集共有フォーム。フォーム状態・バリデーションの純粋ロジックは `lib/item-form.ts`（テストは `lib/__tests__/`）
- `lib/db/` — `migrations.ts`（PRAGMA user_version 方式・スキーマv1）／`types.ts`（行型とアプリ型の分離）／`items.ts`・`records.ts`（リポジトリ。画面から生SQLを書かない）
- `lib/schedule/` — `date.ts`（YYYY-MM-DD 文字列ベースの日付演算）／`derive.ts`（予定日導出の純粋関数：`isScheduledOn` / `getNextDueDate` / `getTodayItems` / `getMonthSchedule`）。DB・React 非依存を維持すること
- `metro.config.js` — expo-sqlite の web 対応（wasm asset 解決＋COOP/COEP ヘッダー）。`npm run web` での動作確認に必要

## コマンド

```bash
npm start            # expo start（開発サーバー）
npm run android      # Android エミュレータ/実機で起動
npm run web          # ブラウザで起動
npm run lint         # expo lint（eslint-config-expo, flat config）
npx tsc --noEmit     # 型チェック
npm test             # jest（jest-expo preset）。単体テストは lib/schedule/__tests__/
```

## アーキテクチャ上の重要な決定

REQUIREMENTS.md に詳細があるが、コードを書く際に特に効いてくる制約：

- **完全ローカル完結**：expo-sqlite にすべて保存。ネットワーク通信・外部API・認証・通知は一切なし（Phase 2まで導入禁止）。ネットワーク権限も原則付与しない
- **予定日はDBに保存しない**：服用予定日は常に `intake_records` と `items` のスケジュール設定から導出する。interval型は「最終服用日＋N日」で自動でずれ、daily/weekly型はカレンダー固定。過去日の記録を追記・修正・削除しても再計算だけで整合する設計
- **二重記録防止**：`intake_records` に UNIQUE(item_id, taken_date, timing) 制約。`taken_date`（服用日）と `recorded_at`（記録日時）は分離されている — 過去日の追記が主要ユースケースのため
- **ルーティング**：expo-router のファイルベース。ボトムタブ3つ固定（カレンダー=ホーム／一覧／設定）＋日別詳細はボトムシート。typedRoutes と reactCompiler が有効

## Expo SDK 54 ベストプラクティス

（context7 経由で SDK 54 公式ドキュメントから取得。詳細は https://docs.expo.dev/versions/v54.0.0/ ）

### expo-router

- 画面は `app/` 配下のファイルベースルーティングで定義。タブは `app/(tabs)/_layout.tsx` の `<Tabs>` + `<Tabs.Screen name="..." options={{ title, tabBarIcon }}>` で構成する
- `typedRoutes` が有効なので、`router.push()` や `<Link href>` のパスは型チェックされる。ルート追加後に型エラーが出たら開発サーバー起動で型が再生成される

### expo-sqlite

- DBアクセスはルートレイアウトで `<SQLiteProvider databaseName="..." onInit={migrateDbIfNeeded}>` を設置し、画面側は `useSQLiteContext()` で取得する（都度 `openDatabaseAsync` しない）
- マイグレーションは `onInit` 内で `PRAGMA user_version` によるバージョン管理方式を使う。初回マイグレーションで `PRAGMA journal_mode = 'wal'` を設定する
- クエリは必ずプレースホルダ（`?`）でパラメータ化する。読み取りは `getFirstAsync` / `getAllAsync`、書き込みは `runAsync`
- 複数の書き込みは `withTransactionAsync` でアトミックに行う。**注意**：トランザクション実行中に外側で発行された並行クエリもそのトランザクションに巻き込まれるため、`withTransactionAsync` 中に別のDB操作を並行実行しない

### React Compiler / New Architecture

- `reactCompiler` が有効なのでメモ化は自動。**`useCallback` / `useMemo` / `React.memo` を手書きしない**。クラスコンポーネントは最適化対象外なので関数コンポーネントのみ使用
- New Architecture はSDK 53以降デフォルト有効（`newArchEnabled: true` 設定済み）。無効化しない

## デザイン制約（DESIGN.md 準拠）

- 色は DESIGN.md のカラートークンのみ使用可。新しい色（特に赤・紫・ピンク、独自の緑）を追加しない。エラー色は `#C4442A` のみ
- フォントウェイトは 400 / 500 の2つだけ。bold・カスタムフォント禁止
- MVP はライトモードのみ（ダークモード対応しない）。テンプレート由来の `useColorScheme` / ダークテーマ分岐は実装時に不要
- タップ領域は最低 44×44。カードに影を使わない
