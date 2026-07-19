# 03 — SQLiteデータベース基盤

## 概要

expo-sqlite を導入し、REQUIREMENTS.md §3 のスキーマでデータベースを初期化する。マイグレーションの仕組みもここで確立する。

## 参照

- REQUIREMENTS.md §3（データモデル）
- CLAUDE.md「Expo SDK 54 ベストプラクティス > expo-sqlite」

## タスク

- [x] `npx expo install expo-sqlite` で導入
- [x] `app/_layout.tsx` に `<SQLiteProvider databaseName="nodakke.db" onInit={migrateDbIfNeeded}>` を設置
- [x] `lib/db/migrations.ts` にマイグレーション関数を実装
  - `PRAGMA user_version` によるバージョン管理方式（CLAUDE.md参照）
  - 初回マイグレーションで `PRAGMA journal_mode = 'wal'` を設定
- [x] スキーマ定義（バージョン1）

```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,              -- medicine / supplement / other
  schedule_type TEXT NOT NULL,         -- daily / interval / weekly / as_needed
  interval_days INTEGER,               -- interval のとき必須
  weekdays TEXT,                       -- weekly のとき必須（例 "1,4"）
  timings TEXT NOT NULL DEFAULT '',    -- CSV: morning/noon/evening/bedtime
  memo TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE intake_records (
  id INTEGER PRIMARY KEY NOT NULL,
  item_id INTEGER NOT NULL REFERENCES items(id),
  taken_date TEXT NOT NULL,            -- YYYY-MM-DD
  timing TEXT NOT NULL,                -- morning/noon/evening/bedtime/none
  recorded_at TEXT NOT NULL,
  UNIQUE(item_id, taken_date, timing)
);

CREATE INDEX idx_records_item_date ON intake_records(item_id, taken_date);
```

- [x] `PRAGMA foreign_keys = ON` を接続時に有効化
- [x] TypeScript の型定義（`Item`, `IntakeRecord`）を `lib/db/types.ts` に作成。DB行の型とアプリ内で使う型（timings を配列に変換した形など）を分ける

## 設計メモ

- 予定日はDBに保存しない（導出方式）。テーブルは上記2つだけでMVPは完結する
- 「毎日」を `interval_days=1` に集約するかは実装判断とされているが、**daily は独立した schedule_type として扱う**（カレンダー固定でずれない挙動が interval と異なるため。REQUIREMENTS.md §6-4）

## 完了条件

- アプリ起動でDBが作成され、2テーブルが存在する
- 2回目以降の起動でマイグレーションがスキップされる（user_version 管理が機能）
- UNIQUE 制約違反（同一 item_id + taken_date + timing の重複挿入）がエラーになることを確認

## 依存

- 01（プロジェクト基盤整備）
