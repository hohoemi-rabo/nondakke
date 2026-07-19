# 04 — データアクセス層（リポジトリ）

## 概要

画面から直接SQLを書かず、すべてのDB操作をリポジトリ関数経由にする。items と intake_records のCRUDを実装する。

## 参照

- REQUIREMENTS.md §3（データモデル）、§6（機能要件 1・3）
- CLAUDE.md「expo-sqlite」（パラメータ化クエリ、withTransactionAsync の注意点）

## タスク

- [x] `lib/db/items.ts` — アイテムのリポジトリ
  - `createItem(db, input)` / `updateItem(db, id, input)` / `getItem(db, id)` / `listItems(db, { category?, activeOnly? })`
  - `deactivateItem(db, id)`（is_active=0。物理削除しない — 履歴を残すため）
  - `deleteItem(db, id)`（物理削除。関連する intake_records も同一トランザクションで削除）
- [x] `lib/db/records.ts` — 摂取記録のリポジトリ
  - `addRecord(db, { itemId, takenDate, timing })`（recorded_at は現在日時）
  - `removeRecord(db, { itemId, takenDate, timing })`（再タップでの取り消しに使用）
  - `listRecordsByMonth(db, yearMonth)`（カレンダー描画用。月単位で一括取得）
  - `listRecordsByDate(db, date)`（日別詳細シート用）
  - `getLastTakenDate(db, itemId)`（一覧画面の「最終服用日」と interval 型の予定算出に使用）
- [x] すべてのクエリをプレースホルダ（`?`）でパラメータ化
- [x] 入力バリデーション：category / schedule_type / timing は定義済みの値のみ受け付ける。interval 型は interval_days 必須、weekly 型は weekdays 必須

## 設計メモ

- 記録のトグル（飲んだ⇄取り消し）は UNIQUE 制約前提で「あれば削除・なければ挿入」。二重タップ対策は制約側で担保される
- N+1 回避：カレンダー1ヶ月分の描画で日ごとにクエリを発行しない。`listRecordsByMonth` で一括取得して画面側でグルーピングする

## 完了条件

- 全リポジトリ関数が型付きで実装され、`npx tsc --noEmit` が通る
- 画面コードに生SQLが存在しない構造になっている

## 依存

- 03（SQLiteデータベース基盤）
