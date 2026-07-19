import { type Category, type ScheduleType, type Timing } from '@/constants/domain';
import { type ItemInput } from '@/lib/db/items';
import { type Item } from '@/lib/db/types';

// 登録フォームの状態とバリデーション（docs/06）。
// lib/schedule と同様に React / DB 非依存の純粋ロジックとして分離する

export type ItemFormState = {
  name: string;
  scheduleType: ScheduleType;
  intervalDaysText: string; // 数値入力はテキストのまま保持し、保存時に変換する
  weekdays: number[]; // 0=日〜6=土
  category: Category;
  timings: Timing[];
  memo: string;
};

export type ItemFormErrors = {
  name?: string;
  intervalDays?: string;
  weekdays?: string;
};

export function emptyItemFormState(): ItemFormState {
  return {
    name: '',
    scheduleType: 'daily',
    intervalDaysText: '',
    weekdays: [],
    category: 'medicine',
    timings: [],
    memo: '',
  };
}

// 編集画面のプリフィル用
export function itemFormStateFromItem(item: Item): ItemFormState {
  return {
    name: item.name,
    scheduleType: item.scheduleType,
    intervalDaysText: item.intervalDays != null ? String(item.intervalDays) : '',
    weekdays: [...item.weekdays],
    category: item.category,
    timings: [...item.timings],
    memo: item.memo ?? '',
  };
}

// validateItemInput（lib/db/items.ts）と同じ条件をフィールド別エラーとして返す
export function validateItemForm(state: ItemFormState): ItemFormErrors {
  const errors: ItemFormErrors = {};
  if (!state.name.trim()) {
    errors.name = '名前を入力してください';
  }
  if (state.scheduleType === 'interval') {
    const text = state.intervalDaysText.trim();
    if (!/^\d+$/.test(text) || Number(text) < 1) {
      errors.intervalDays = '1以上の日数を入力してください';
    }
  }
  if (state.scheduleType === 'weekly' && state.weekdays.length === 0) {
    errors.weekdays = '曜日を1つ以上選択してください';
  }
  return errors;
}

// バリデーション済みの状態を ItemInput に変換する
export function itemFormToInput(state: ItemFormState): ItemInput {
  return {
    name: state.name.trim(),
    category: state.category,
    scheduleType: state.scheduleType,
    intervalDays:
      state.scheduleType === 'interval' ? Number(state.intervalDaysText.trim()) : null,
    weekdays: state.scheduleType === 'weekly' ? [...state.weekdays].sort((a, b) => a - b) : [],
    timings: state.timings,
    memo: state.memo.trim() || null,
  };
}

// 複数選択チップのトグル（タイミング・曜日で使用）。元配列は変更しない
export function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}
