import { type SQLiteDatabase } from 'expo-sqlite';

import { TIMINGS, type RecordTiming, type Timing } from '@/constants/domain';
import { type IntakeRecord, type IntakeRecordRow } from '@/lib/db/types';

export type RecordKey = {
  itemId: number;
  takenDate: string; // YYYY-MM-DD
  timing: RecordTiming;
};

export function recordFromRow(row: IntakeRecordRow): IntakeRecord {
  return {
    id: row.id,
    itemId: row.item_id,
    takenDate: row.taken_date,
    timing: row.timing as RecordTiming,
    recordedAt: row.recorded_at,
  };
}

function validateRecordKey(key: RecordKey): void {
  if (key.timing !== 'none' && !TIMINGS.includes(key.timing as Timing)) {
    throw new Error(`不正なタイミングです: ${key.timing}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key.takenDate)) {
    throw new Error(`不正な日付形式です: ${key.takenDate}`);
  }
}

// 記録を追加する。taken_date（服用日）と recorded_at（記録日時）は分離されており、
// 過去日の追記でも recorded_at は常に現在時刻
export async function addRecord(db: SQLiteDatabase, key: RecordKey): Promise<void> {
  validateRecordKey(key);
  await db.runAsync(
    `INSERT INTO intake_records (item_id, taken_date, timing, recorded_at)
     VALUES (?, ?, ?, ?)`,
    key.itemId,
    key.takenDate,
    key.timing,
    new Date().toISOString()
  );
}

// 記録の取り消し（記録ボタンの再タップ）
export async function removeRecord(db: SQLiteDatabase, key: RecordKey): Promise<void> {
  validateRecordKey(key);
  await db.runAsync(
    'DELETE FROM intake_records WHERE item_id = ? AND taken_date = ? AND timing = ?',
    key.itemId,
    key.takenDate,
    key.timing
  );
}

// カレンダー描画・予定導出用の全件取得。
// interval 型の予定は表示月の外にある最終服用日に依存するため、月単位の取得では正しく導出できない。
// 個人の服薬記録なので全件でも小規模（数年分で数千行程度）
export async function listRecords(db: SQLiteDatabase): Promise<IntakeRecord[]> {
  const rows = await db.getAllAsync<IntakeRecordRow>(
    'SELECT * FROM intake_records ORDER BY taken_date, item_id'
  );
  return rows.map(recordFromRow);
}

// 全アイテムの最終服用日を1クエリで取得（一覧画面用。アイテムごとに発行しない — N+1回避）
export async function getLastTakenDates(db: SQLiteDatabase): Promise<Map<number, string>> {
  const rows = await db.getAllAsync<{ item_id: number; last_taken: string }>(
    'SELECT item_id, MAX(taken_date) AS last_taken FROM intake_records GROUP BY item_id'
  );
  return new Map(rows.map((row) => [row.item_id, row.last_taken]));
}
