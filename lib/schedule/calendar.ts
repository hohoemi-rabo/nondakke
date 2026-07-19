// カレンダー画面用の表示ロジック（docs/07、DESIGN.md §5）。
// derive.ts の結果を画面の描画単位（グリッド・セルのマーク・サマリー数値）に変換する。
// DB・React に依存しない純粋関数のみ

import { WEEKDAY_LABELS, type Category } from '@/constants/domain';
import { type DayEntry, type TodayEntry } from '@/lib/schedule/derive';
import { datesOfMonth, weekdayOf } from '@/lib/schedule/date';

// 7列×4〜6行の月グリッド（日曜始まり）。月初前後の空きマスは null
export function buildMonthGrid(yearMonth: string): (string | null)[][] {
  const dates = datesOfMonth(yearMonth);
  const cells: (string | null)[] = [
    ...Array<null>(weekdayOf(dates[0])).fill(null),
    ...dates,
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// 日セルに表示するマーク。
// check：過去日で全エントリ記録済み（今日はまだ飲む余地があるためドットのまま）
// dots：カテゴリ色ドット最大3個。missed のエントリは輪郭のみ（filled=false）
export type DayCellMark =
  | { kind: 'check' }
  | { kind: 'dots'; dots: { category: Category; filled: boolean }[]; overflow: boolean };

const MAX_DOTS = 3;

export function summarizeDayEntries(
  entries: DayEntry[],
  date: string,
  today: string
): DayCellMark | null {
  if (entries.length === 0) {
    return null;
  }
  if (date < today && entries.every((e) => e.status === 'recorded')) {
    return { kind: 'check' };
  }
  return {
    kind: 'dots',
    dots: entries.slice(0, MAX_DOTS).map((e) => ({
      category: e.item.category,
      filled: e.status !== 'missed',
    })),
    overflow: entries.length > MAX_DOTS,
  };
}

// サマリーカードの済/残り（slots 単位。大数字は taken + remaining）
export function summarizeToday(entries: TodayEntry[]): { taken: number; remaining: number } {
  let taken = 0;
  let remaining = 0;
  for (const entry of entries) {
    for (const slot of entry.slots) {
      if (slot.taken) {
        taken++;
      } else {
        remaining++;
      }
    }
  }
  return { taken, remaining };
}

// '2026-07' → '2026年7月'
export function formatMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  return `${y}年${m}月`;
}

// '2026-07-19' → '7月19日（日）'（日別詳細シートのヘッダー用）
export function formatDateLabel(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return `${m}月${d}日（${WEEKDAY_LABELS[weekdayOf(date)]}）`;
}
