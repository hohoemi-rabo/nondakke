import { type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

// SQLiteProvider の onInit から呼ばれる。PRAGMA user_version でバージョン管理し、
// 適用済みのマイグレーションはスキップする
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // 外部キー制約は接続ごとの設定のため、バージョンに関係なく毎回有効化する
  await db.execAsync('PRAGMA foreign_keys = ON');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
PRAGMA journal_mode = 'wal';

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
`);
    currentDbVersion = 1;
  }
  // 将来のマイグレーションはここに if (currentDbVersion === 1) { ... } を追記する

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
