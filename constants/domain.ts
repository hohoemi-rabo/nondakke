// REQUIREMENTS.md データモデルの列挙値と日本語ラベル。
// DBに保存される値はここで定義したキーのみ

export type Category = 'medicine' | 'supplement' | 'other';

export const CATEGORIES: Category[] = ['medicine', 'supplement', 'other'];

export const CATEGORY_LABELS: Record<Category, string> = {
  medicine: 'お薬',
  supplement: 'サプリ',
  other: 'その他',
};

export type Timing = 'morning' | 'noon' | 'evening' | 'bedtime';

// intake_records.timing は 1日1回系の記録で 'none' を取れる（REQUIREMENTS.md）
export type RecordTiming = Timing | 'none';

export const TIMINGS: Timing[] = ['morning', 'noon', 'evening', 'bedtime'];

export const TIMING_LABELS: Record<Timing, string> = {
  morning: '朝',
  noon: '昼',
  evening: '夕',
  bedtime: '就寝前',
};

// index = JS getDay() / items.weekdays の値（0=日〜6=土）
export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;

// UI表示順（月〜日）。値はDBに保存する weekday 番号
export const WEEKDAYS_MON_FIRST = [1, 2, 3, 4, 5, 6, 0] as const;

export type ScheduleType = 'daily' | 'interval' | 'weekly' | 'as_needed';

export const SCHEDULE_TYPES: ScheduleType[] = ['daily', 'interval', 'weekly', 'as_needed'];

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  daily: '毎日',
  interval: 'N日に1回',
  weekly: '曜日指定',
  as_needed: '不定期',
};
