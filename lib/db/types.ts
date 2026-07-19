import {
  type Category,
  type RecordTiming,
  type ScheduleType,
  type Timing,
} from '@/constants/domain';

// ---- DB行の型（SELECT結果の生の形。カラム名・表現はスキーマそのまま） ----

export type ItemRow = {
  id: number;
  name: string;
  category: string;
  schedule_type: string;
  interval_days: number | null;
  weekdays: string | null;
  timings: string; // CSV: "morning,noon" など。空文字あり
  memo: string | null;
  is_active: number; // 0 / 1
  created_at: string;
};

export type IntakeRecordRow = {
  id: number;
  item_id: number;
  taken_date: string; // YYYY-MM-DD
  timing: string;
  recorded_at: string;
};

// ---- アプリ内で使う型（列挙型・配列・booleanに正規化した形） ----

export type Item = {
  id: number;
  name: string;
  category: Category;
  scheduleType: ScheduleType;
  intervalDays: number | null;
  weekdays: number[]; // 0=日〜6=土。weekly以外は空配列
  timings: Timing[];
  memo: string | null;
  isActive: boolean;
  createdAt: string;
};

export type IntakeRecord = {
  id: number;
  itemId: number;
  takenDate: string; // YYYY-MM-DD
  timing: RecordTiming;
  recordedAt: string;
};
