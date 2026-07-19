# 05 — 予定日導出ロジック（コア）

## 概要

このアプリの核心ロジック。**予定日はDBに保存せず、items のスケジュール設定と intake_records から常に導出する**（REQUIREMENTS.md §6-4）。純粋関数として実装し、単体テストで固める。

## 参照

- REQUIREMENTS.md §6-4（予定日の自動算出）
- CLAUDE.md「アーキテクチャ上の重要な決定」

## 仕様（REQUIREMENTS.md より整理）

| schedule_type | 予定日の決まり方 |
|---------------|------------------|
| daily | 毎日（カレンダー固定。飲み忘れてもずれない） |
| weekly | 指定曜日（カレンダー固定。同上） |
| interval | 最終服用日＋N日（自動でずれる）。記録が1件もない場合は開始日（created_at の日付）を初回予定とする |
| as_needed | 予定なし（任意日に記録のみ） |

- interval 型で予定日を過ぎて未服用の場合：予定は消えず「今日のむもの」に**期限超過として残り続ける**。服用記録が入った日を起点に次回を再計算
- 過去日の記録の追記・修正・削除後も、導出方式のため特別な整合処理は不要（再計算するだけ）

## タスク

- [x] `lib/schedule/derive.ts` に純粋関数として実装（DBに依存しない：items と records の配列を受け取る）
  - `isScheduledOn(item, records, date): boolean` — その日が予定日か
  - `getTodayItems(items, records, today)` — 「今日のむもの」リスト（interval の期限超過分を含む）
  - `getMonthSchedule(items, records, yearMonth)` — カレンダー1ヶ月分の日別予定・記録状態（予定あり／記録済み／予定なのに未記録）
- [x] 日付演算は文字列 `YYYY-MM-DD` ベースのユーティリティで行う（`lib/schedule/date.ts`）。タイムゾーンによる日付ズレを避けるため `Date` の UTC/ローカル混在に注意
- [x] テスト環境を導入：`jest-expo` + `npx expo install jest-expo jest @types/jest`、package.json に `"test": "jest"` を追加
- [x] 単体テストを作成（`lib/schedule/__tests__/`）
  - daily / weekly：記録の有無にかかわらず予定日が固定であること
  - interval：記録なし→開始日が初回予定、記録あり→最終服用日＋N日
  - interval 期限超過：予定日を過ぎても「今日のむもの」に残り続けること
  - interval 再計算：過去日の記録を追加・削除すると予定が正しくずれること
  - as_needed：どの日も予定日にならないこと
  - 月末・月跨ぎ・年跨ぎの境界ケース

## 完了条件

- `npm test` が通り、上記テストケースをすべてカバー
- 導出関数がDB・React に依存しない純粋関数である（引数のみで結果が決まる）

## 依存

- 04（データアクセス層）— 型定義を共有するため。ロジック自体は独立して実装可能
