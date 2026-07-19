// 予定日導出のコアロジック。予定日はDBに保存せず、items のスケジュール設定と
// intake_records から常にここで導出する（REQUIREMENTS.md §6-4）。
// DB・React に依存しない純粋関数のみ：結果は引数だけで決まる。

import { type RecordTiming } from '@/constants/domain';
import { type IntakeRecord, type Item } from '@/lib/db/types';
import { addDays, datesOfMonth, diffDays, toDateString, weekdayOf } from '@/lib/schedule/date';

export type TodaySlot = {
  timing: RecordTiming;
  taken: boolean;
};

export type TodayEntry = {
  item: Item;
  // interval 型で予定日を過ぎている（期限超過）。daily/weekly は常に false
  isOverdue: boolean;
  slots: TodaySlot[];
};

export type DayStatus = 'scheduled' | 'recorded' | 'missed';

export type DayEntry = {
  item: Item;
  status: DayStatus;
};

// アイテムの開始日（createdAt のローカル日付）。開始日より前に予定は発生しない
function startDateOf(item: Item): string {
  return toDateString(new Date(item.createdAt));
}

function lastTakenBefore(records: IntakeRecord[], itemId: number, date: string): string | null {
  let last: string | null = null;
  for (const r of records) {
    if (r.itemId === itemId && r.takenDate < date && (last === null || r.takenDate > last)) {
      last = r.takenDate;
    }
  }
  return last;
}

function lastTakenOverall(records: IntakeRecord[], itemId: number): string | null {
  let last: string | null = null;
  for (const r of records) {
    if (r.itemId === itemId && (last === null || r.takenDate > last)) {
      last = r.takenDate;
    }
  }
  return last;
}

// 次回（現在の）予定日。interval は最終服用日+N（記録なしなら開始日）で、
// 期限超過中は過去日を返す。as_needed は予定を持たないので null
export function getNextDueDate(item: Item, records: IntakeRecord[], today: string): string | null {
  if (!item.isActive) {
    return null;
  }
  const start = startDateOf(item);
  switch (item.scheduleType) {
    case 'daily':
      return today >= start ? today : start;
    case 'weekly': {
      if (item.weekdays.length === 0) {
        return null;
      }
      let d = today >= start ? today : start;
      for (let i = 0; i < 7; i++) {
        if (item.weekdays.includes(weekdayOf(d))) {
          return d;
        }
        d = addDays(d, 1);
      }
      return null;
    }
    case 'interval': {
      if (item.intervalDays == null) {
        return null;
      }
      const last = lastTakenOverall(records, item.id);
      return last === null ? start : addDays(last, item.intervalDays);
    }
    case 'as_needed':
      return null;
  }
}

// date が item の予定日か。
// interval は「date より前の最終服用日 + N ≤ date」（記録なしなら「開始日 ≤ date」）——
// 期限超過の予定が服用まで毎日残り続ける挙動はこの式から自然に導かれる。
// 未来日（today より後）は、次回予定日を起点にN日周期の「見込み」を投影する
// （カレンダーで周期が見えるようにする。実際に飲んだ日がずれれば導出方式のため自動で再計算される）
export function isScheduledOn(
  item: Item,
  records: IntakeRecord[],
  date: string,
  today: string
): boolean {
  if (!item.isActive) {
    return false;
  }
  const start = startDateOf(item);
  if (date < start) {
    return false;
  }
  switch (item.scheduleType) {
    case 'daily':
      return true;
    case 'weekly':
      return item.weekdays.includes(weekdayOf(date));
    case 'interval': {
      if (item.intervalDays == null) {
        return false;
      }
      if (date > today) {
        const due = getNextDueDate(item, records, today);
        if (due === null) {
          return false;
        }
        const diff = diffDays(due, date);
        return diff >= 0 && diff % item.intervalDays === 0;
      }
      const last = lastTakenBefore(records, item.id, date);
      const due = last === null ? start : addDays(last, item.intervalDays);
      return due <= date;
    }
    case 'as_needed':
      return false;
  }
}

// 「今日のむもの」リスト。interval の期限超過分を含む。as_needed は予定を持たないため
// 含めない（不定期アイテムの記録導線は日別詳細シート側で提供する）。
// サマリーカードの済/残りは slots（タイミング枠）単位で数える
export function getTodayItems(
  items: Item[],
  records: IntakeRecord[],
  today: string
): TodayEntry[] {
  const entries: TodayEntry[] = [];
  for (const item of items) {
    if (!isScheduledOn(item, records, today, today)) {
      continue;
    }
    const timings: RecordTiming[] = item.timings.length > 0 ? item.timings : ['none'];
    const slots = timings.map((timing) => ({
      timing,
      taken: records.some(
        (r) => r.itemId === item.id && r.takenDate === today && r.timing === timing
      ),
    }));
    const due = getNextDueDate(item, records, today);
    entries.push({
      item,
      isOverdue: item.scheduleType === 'interval' && due !== null && due < today,
      slots,
    });
  }
  return entries;
}

export type DayDetailEntry = {
  item: Item;
  slots: TodaySlot[];
  // interval 型の飲み忘れ日数（今日のシートのみ・予定日超過中のみ非 null）。「N日遅れ」表示用
  overdueDays: number | null;
};

export type DayDetail = {
  // その日の予定 or 記録があるアイテム（as_needed・非アクティブの記録も含む — 記録の事実は常に表示）
  entries: DayDetailEntry[];
  // 記録導線用：その日に記録のないアクティブな as_needed アイテム（slots はすべて taken=false）
  asNeeded: DayDetailEntry[];
};

// 日別詳細シート用：date のアイテム別スロット状態。
// slots は item.timings（空なら 'none'）を基本に、timings に無いタイミングの記録があれば
// 追記する — 後からタイミング設定を変えても既存の記録が見え、取り消せるようにするため
export function deriveDayDetail(
  items: Item[],
  records: IntakeRecord[],
  date: string,
  today: string
): DayDetail {
  const entries: DayDetailEntry[] = [];
  const asNeeded: DayDetailEntry[] = [];
  for (const item of items) {
    const recordedTimings = records
      .filter((r) => r.itemId === item.id && r.takenDate === date)
      .map((r) => r.timing);
    const baseTimings: RecordTiming[] = item.timings.length > 0 ? item.timings : ['none'];
    const slots = [
      ...baseTimings.map((timing) => ({ timing, taken: recordedTimings.includes(timing) })),
      ...recordedTimings
        .filter((timing) => !baseTimings.includes(timing))
        .map((timing) => ({ timing, taken: true })),
    ];
    // 期限超過は「今日どうすべきか」の情報なので今日のシートでのみ表示する。
    // 今日の記録があれば次回予定は未来に張り直されるため自然に消える
    const due =
      date === today && item.scheduleType === 'interval'
        ? getNextDueDate(item, records, today)
        : null;
    const overdueDays = due !== null && due < today ? diffDays(due, today) : null;
    if (recordedTimings.length > 0 || isScheduledOn(item, records, date, today)) {
      entries.push({ item, slots, overdueDays });
    } else if (item.isActive && item.scheduleType === 'as_needed') {
      asNeeded.push({ item, slots, overdueDays: null });
    }
  }
  return { entries, asNeeded };
}

// カレンダー1ヶ月分の日別状態。
// recorded：その日に記録あり（as_needed・非アクティブのアイテムの記録も含む — 記録の事実は常に表示）
// missed：予定日なのに未記録の過去日／scheduled：今日以降の予定（未記録）
export function getMonthSchedule(
  items: Item[],
  records: IntakeRecord[],
  yearMonth: string,
  today: string
): Map<string, DayEntry[]> {
  const itemById = new Map(items.map((item) => [item.id, item]));

  // 日付 → 記録済みアイテムID集合（1ヶ月分を一度の走査で構築）
  const recordedByDate = new Map<string, Set<number>>();
  for (const r of records) {
    if (!r.takenDate.startsWith(`${yearMonth}-`)) {
      continue;
    }
    let set = recordedByDate.get(r.takenDate);
    if (!set) {
      set = new Set();
      recordedByDate.set(r.takenDate, set);
    }
    set.add(r.itemId);
  }

  const schedule = new Map<string, DayEntry[]>();
  for (const date of datesOfMonth(yearMonth)) {
    const entries: DayEntry[] = [];
    const recordedIds = recordedByDate.get(date) ?? new Set<number>();
    for (const item of items) {
      if (recordedIds.has(item.id)) {
        entries.push({ item, status: 'recorded' });
      } else if (isScheduledOn(item, records, date, today)) {
        entries.push({ item, status: date < today ? 'missed' : 'scheduled' });
      }
    }
    // items に無いIDの記録（削除済み等）は無視される。deleteItem が記録も同時削除するため通常発生しない
    if (entries.length > 0) {
      schedule.set(date, entries);
    }
  }
  return schedule;
}
