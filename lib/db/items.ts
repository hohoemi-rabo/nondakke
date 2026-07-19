import { type SQLiteDatabase } from 'expo-sqlite';

import {
  CATEGORIES,
  SCHEDULE_TYPES,
  TIMINGS,
  type Category,
  type ScheduleType,
  type Timing,
} from '@/constants/domain';
import { type Item, type ItemRow } from '@/lib/db/types';

export type ItemInput = {
  name: string;
  category: Category;
  scheduleType: ScheduleType;
  intervalDays?: number | null;
  weekdays?: number[];
  timings: Timing[];
  memo?: string | null;
};

export function itemFromRow(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Category,
    scheduleType: row.schedule_type as ScheduleType,
    intervalDays: row.interval_days,
    weekdays: row.weekdays ? row.weekdays.split(',').map(Number) : [],
    timings: row.timings ? (row.timings.split(',') as Timing[]) : [],
    memo: row.memo,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

export function validateItemInput(input: ItemInput): void {
  if (!input.name.trim()) {
    throw new Error('名前を入力してください');
  }
  if (!CATEGORIES.includes(input.category)) {
    throw new Error(`不正なカテゴリです: ${input.category}`);
  }
  if (!SCHEDULE_TYPES.includes(input.scheduleType)) {
    throw new Error(`不正な服用パターンです: ${input.scheduleType}`);
  }
  for (const timing of input.timings) {
    if (!TIMINGS.includes(timing)) {
      throw new Error(`不正なタイミングです: ${timing}`);
    }
  }
  if (input.scheduleType === 'interval') {
    if (
      input.intervalDays == null ||
      !Number.isInteger(input.intervalDays) ||
      input.intervalDays < 1
    ) {
      throw new Error('「N日に1回」は間隔（1以上の日数）を指定してください');
    }
  }
  if (input.scheduleType === 'weekly') {
    const weekdays = input.weekdays ?? [];
    if (weekdays.length === 0) {
      throw new Error('「曜日指定」は曜日を1つ以上選択してください');
    }
    if (weekdays.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
      throw new Error('不正な曜日指定です');
    }
  }
}

// ItemInput をDBカラムの形（バインド値）に変換する
function toColumns(input: ItemInput) {
  return {
    name: input.name.trim(),
    category: input.category,
    schedule_type: input.scheduleType,
    interval_days: input.scheduleType === 'interval' ? (input.intervalDays ?? null) : null,
    weekdays: input.scheduleType === 'weekly' ? (input.weekdays ?? []).join(',') : null,
    timings: input.timings.join(','),
    memo: input.memo?.trim() || null,
  };
}

export async function createItem(db: SQLiteDatabase, input: ItemInput): Promise<Item> {
  validateItemInput(input);
  const c = toColumns(input);
  const result = await db.runAsync(
    `INSERT INTO items (name, category, schedule_type, interval_days, weekdays, timings, memo, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    c.name,
    c.category,
    c.schedule_type,
    c.interval_days,
    c.weekdays,
    c.timings,
    c.memo,
    new Date().toISOString()
  );
  const item = await getItem(db, result.lastInsertRowId);
  if (!item) {
    throw new Error('アイテムの作成に失敗しました');
  }
  return item;
}

export async function updateItem(db: SQLiteDatabase, id: number, input: ItemInput): Promise<void> {
  validateItemInput(input);
  const c = toColumns(input);
  await db.runAsync(
    `UPDATE items
     SET name = ?, category = ?, schedule_type = ?, interval_days = ?, weekdays = ?, timings = ?, memo = ?
     WHERE id = ?`,
    c.name,
    c.category,
    c.schedule_type,
    c.interval_days,
    c.weekdays,
    c.timings,
    c.memo,
    id
  );
}

export async function getItem(db: SQLiteDatabase, id: number): Promise<Item | null> {
  const row = await db.getFirstAsync<ItemRow>('SELECT * FROM items WHERE id = ?', id);
  return row ? itemFromRow(row) : null;
}

export async function listItems(
  db: SQLiteDatabase,
  options: { category?: Category; activeOnly?: boolean } = {}
): Promise<Item[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  if (options.category) {
    conditions.push('category = ?');
    params.push(options.category);
  }
  if (options.activeOnly) {
    conditions.push('is_active = 1');
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db.getAllAsync<ItemRow>(
    `SELECT * FROM items ${where} ORDER BY created_at, id`,
    ...params
  );
  return rows.map(itemFromRow);
}

// 服用中止。履歴（intake_records）を残すため物理削除しない
export async function deactivateItem(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('UPDATE items SET is_active = 0 WHERE id = ?', id);
}

// 物理削除。関連する記録も同一トランザクションで削除する
export async function deleteItem(db: SQLiteDatabase, id: number): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM intake_records WHERE item_id = ?', id);
    await db.runAsync('DELETE FROM items WHERE id = ?', id);
  });
}
