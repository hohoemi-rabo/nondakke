import { type Item } from '@/lib/db/types';
import {
  buildMonthGrid,
  formatMonthLabel,
  summarizeDayEntries,
  summarizeToday,
} from '@/lib/schedule/calendar';
import { type DayEntry, type DayStatus, type TodayEntry } from '@/lib/schedule/derive';

let nextId = 1;

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: nextId++,
    name: 'テスト薬',
    category: 'medicine',
    scheduleType: 'daily',
    intervalDays: null,
    weekdays: [],
    timings: ['morning'],
    memo: null,
    isActive: true,
    createdAt: '2026-07-01T12:00:00.000Z',
    ...overrides,
  };
}

function makeEntry(status: DayStatus, itemOverrides: Partial<Item> = {}): DayEntry {
  return { item: makeItem(itemOverrides), status };
}

const TODAY = '2026-07-19';

describe('buildMonthGrid', () => {
  it('2026年7月は5行・1日が水曜（先頭3マス空き）', () => {
    const grid = buildMonthGrid('2026-07');
    expect(grid).toHaveLength(5);
    for (const week of grid) {
      expect(week).toHaveLength(7);
    }
    expect(grid[0].slice(0, 3)).toEqual([null, null, null]);
    expect(grid[0][3]).toBe('2026-07-01');
    expect(grid[4][5]).toBe('2026-07-31');
    expect(grid.flat().filter(Boolean)).toHaveLength(31);
  });

  it('2026年2月は1日が日曜・28日でぴったり4行（空きマスなし）', () => {
    const grid = buildMonthGrid('2026-02');
    expect(grid).toHaveLength(4);
    expect(grid.flat().every((d) => d !== null)).toBe(true);
  });

  it('2026年8月は1日が土曜で6行', () => {
    const grid = buildMonthGrid('2026-08');
    expect(grid).toHaveLength(6);
    expect(grid[0][6]).toBe('2026-08-01');
    expect(grid[5][0]).toBe('2026-08-30');
  });
});

describe('summarizeDayEntries', () => {
  it('エントリなしは null', () => {
    expect(summarizeDayEntries([], '2026-07-20', TODAY)).toBeNull();
  });

  it('未来日の予定は塗りドット', () => {
    const mark = summarizeDayEntries(
      [makeEntry('scheduled'), makeEntry('scheduled', { category: 'supplement' })],
      '2026-07-20',
      TODAY
    );
    expect(mark).toEqual({
      kind: 'dots',
      dots: [
        { category: 'medicine', filled: true },
        { category: 'supplement', filled: true },
      ],
      overflow: false,
    });
  });

  it('過去日・全記録済みはチェック', () => {
    const mark = summarizeDayEntries(
      [makeEntry('recorded'), makeEntry('recorded')],
      '2026-07-15',
      TODAY
    );
    expect(mark).toEqual({ kind: 'check' });
  });

  it('過去日・全未記録は輪郭のみのドット', () => {
    const mark = summarizeDayEntries([makeEntry('missed')], '2026-07-15', TODAY);
    expect(mark).toEqual({
      kind: 'dots',
      dots: [{ category: 'medicine', filled: false }],
      overflow: false,
    });
  });

  it('過去日・記録と未記録の混在はチェックにならず塗り＋輪郭', () => {
    const mark = summarizeDayEntries(
      [makeEntry('recorded'), makeEntry('missed', { category: 'other' })],
      '2026-07-15',
      TODAY
    );
    expect(mark).toEqual({
      kind: 'dots',
      dots: [
        { category: 'medicine', filled: true },
        { category: 'other', filled: false },
      ],
      overflow: false,
    });
  });

  it('今日は全記録済みでもチェックにしない（チェックは過去日限定）', () => {
    const mark = summarizeDayEntries([makeEntry('recorded')], TODAY, TODAY);
    expect(mark?.kind).toBe('dots');
  });

  it('4件以上はドット3個＋overflow', () => {
    const entries = [
      makeEntry('scheduled'),
      makeEntry('scheduled'),
      makeEntry('scheduled'),
      makeEntry('scheduled'),
    ];
    const mark = summarizeDayEntries(entries, '2026-07-20', TODAY);
    expect(mark?.kind).toBe('dots');
    if (mark?.kind === 'dots') {
      expect(mark.dots).toHaveLength(3);
      expect(mark.overflow).toBe(true);
    }
  });

  it('3件ちょうどは overflow なし', () => {
    const entries = [makeEntry('scheduled'), makeEntry('scheduled'), makeEntry('scheduled')];
    const mark = summarizeDayEntries(entries, '2026-07-20', TODAY);
    if (mark?.kind === 'dots') {
      expect(mark.dots).toHaveLength(3);
      expect(mark.overflow).toBe(false);
    }
  });
});

describe('summarizeToday', () => {
  function makeTodayEntry(slots: { timing: string; taken: boolean }[]): TodayEntry {
    return {
      item: makeItem(),
      isOverdue: false,
      slots: slots as TodayEntry['slots'],
    };
  }

  it('slots 単位で済/残りを数える', () => {
    const entries = [
      makeTodayEntry([
        { timing: 'morning', taken: true },
        { timing: 'evening', taken: false },
      ]),
      makeTodayEntry([{ timing: 'none', taken: false }]),
    ];
    expect(summarizeToday(entries)).toEqual({ taken: 1, remaining: 2 });
  });

  it('全部飲み終えたら remaining 0', () => {
    const entries = [makeTodayEntry([{ timing: 'morning', taken: true }])];
    expect(summarizeToday(entries)).toEqual({ taken: 1, remaining: 0 });
  });

  it('予定なしはゼロ', () => {
    expect(summarizeToday([])).toEqual({ taken: 0, remaining: 0 });
  });
});

describe('formatMonthLabel', () => {
  it('ゼロ埋めなしの年月表記', () => {
    expect(formatMonthLabel('2026-07')).toBe('2026年7月');
    expect(formatMonthLabel('2026-12')).toBe('2026年12月');
  });
});
