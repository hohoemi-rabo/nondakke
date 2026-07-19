import { type IntakeRecord, type Item } from '@/lib/db/types';
import {
  deriveDayDetail,
  getMonthSchedule,
  getNextDueDate,
  getTodayItems,
  isScheduledOn,
} from '@/lib/schedule/derive';

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
    // 2026-07-01 のローカル日付が開始日になる（正午UTCならどのTZでも同日）
    createdAt: '2026-07-01T12:00:00.000Z',
    ...overrides,
  };
}

function makeRecord(itemId: number, takenDate: string, timing = 'morning'): IntakeRecord {
  return {
    id: nextId++,
    itemId,
    takenDate,
    timing: timing as IntakeRecord['timing'],
    recordedAt: `${takenDate}T12:00:00.000Z`,
  };
}

const TODAY = '2026-07-19';

describe('daily', () => {
  const item = makeItem({ scheduleType: 'daily' });

  it('開始日以降は毎日予定', () => {
    expect(isScheduledOn(item, [], '2026-07-01', TODAY)).toBe(true);
    expect(isScheduledOn(item, [], TODAY, TODAY)).toBe(true);
    expect(isScheduledOn(item, [], '2026-08-15', TODAY)).toBe(true);
  });

  it('開始日より前は予定なし', () => {
    expect(isScheduledOn(item, [], '2026-06-30', TODAY)).toBe(false);
  });

  it('記録があっても予定日は動かない（カレンダー固定）', () => {
    const records = [makeRecord(item.id, '2026-07-18')];
    expect(isScheduledOn(item, records, TODAY, TODAY)).toBe(true);
    expect(isScheduledOn(item, records, '2026-07-20', TODAY)).toBe(true);
  });

  it('次回予定は今日', () => {
    expect(getNextDueDate(item, [], TODAY)).toBe(TODAY);
  });
});

describe('weekly', () => {
  // 月・木（2026-07-20=月、2026-07-23=木）
  const item = makeItem({ scheduleType: 'weekly', weekdays: [1, 4] });

  it('指定曜日のみ予定', () => {
    expect(isScheduledOn(item, [], '2026-07-20', TODAY)).toBe(true); // 月
    expect(isScheduledOn(item, [], '2026-07-23', TODAY)).toBe(true); // 木
    expect(isScheduledOn(item, [], '2026-07-21', TODAY)).toBe(false); // 火
    expect(isScheduledOn(item, [], TODAY, TODAY)).toBe(false); // 日
  });

  it('記録の有無で予定日が動かない', () => {
    const records = [makeRecord(item.id, '2026-07-16')];
    expect(isScheduledOn(item, records, '2026-07-20', TODAY)).toBe(true);
    expect(isScheduledOn(item, records, '2026-07-21', TODAY)).toBe(false);
  });

  it('週を跨いで次の指定曜日が次回予定になる', () => {
    // 今日=日曜 → 直近の指定曜日は明日の月曜
    expect(getNextDueDate(item, [], TODAY)).toBe('2026-07-20');
    // 金曜時点 → 翌週月曜（週跨ぎ）
    expect(getNextDueDate(item, [], '2026-07-24')).toBe('2026-07-27');
  });
});

describe('interval', () => {
  const item = makeItem({ scheduleType: 'interval', intervalDays: 3 });

  it('記録なし：開始日が初回予定', () => {
    expect(getNextDueDate(item, [], TODAY)).toBe('2026-07-01');
    expect(isScheduledOn(item, [], '2026-07-01', TODAY)).toBe(true);
    expect(isScheduledOn(item, [], '2026-06-30', TODAY)).toBe(false);
  });

  it('記録あり：最終服用日＋N日が次回予定', () => {
    const records = [makeRecord(item.id, '2026-07-10'), makeRecord(item.id, '2026-07-16')];
    expect(getNextDueDate(item, records, TODAY)).toBe('2026-07-19');
    expect(isScheduledOn(item, records, '2026-07-19', TODAY)).toBe(true);
    expect(isScheduledOn(item, records, '2026-07-18', TODAY)).toBe(false);
  });

  it('期限超過：予定日を過ぎても今日の予定に残り続ける', () => {
    const records = [makeRecord(item.id, '2026-07-10')]; // 予定は 07-13 だった
    expect(isScheduledOn(item, records, '2026-07-13', TODAY)).toBe(true);
    expect(isScheduledOn(item, records, '2026-07-15', TODAY)).toBe(true); // 超過中の過去日
    expect(isScheduledOn(item, records, TODAY, TODAY)).toBe(true); // 今日も残っている
    const today = getTodayItems([item], records, TODAY);
    expect(today).toHaveLength(1);
    expect(today[0].isOverdue).toBe(true);
  });

  it('期限超過中は未来日に予定を出さない（服用時に再計算）', () => {
    const records = [makeRecord(item.id, '2026-07-10')];
    expect(isScheduledOn(item, records, '2026-07-20', TODAY)).toBe(false);
    expect(isScheduledOn(item, records, '2026-07-22', TODAY)).toBe(false);
  });

  it('未来日は次回予定日のみ予定になる', () => {
    const records = [makeRecord(item.id, TODAY)];
    expect(isScheduledOn(item, records, '2026-07-22', TODAY)).toBe(true);
    expect(isScheduledOn(item, records, '2026-07-21', TODAY)).toBe(false);
    expect(isScheduledOn(item, records, '2026-07-25', TODAY)).toBe(false); // 次々回は出さない
  });

  it('再計算：過去日の記録を追加すると予定がずれる', () => {
    const before = [makeRecord(item.id, '2026-07-10')];
    expect(getNextDueDate(item, before, TODAY)).toBe('2026-07-13');
    // 07-12 に飲んでいたことに後から気づいて追記
    const after = [...before, makeRecord(item.id, '2026-07-12')];
    expect(getNextDueDate(item, after, TODAY)).toBe('2026-07-15');
  });

  it('再計算：記録を削除すると予定が戻る', () => {
    const records = [makeRecord(item.id, '2026-07-10'), makeRecord(item.id, '2026-07-16')];
    expect(getNextDueDate(item, records, TODAY)).toBe('2026-07-19');
    const removed = records.filter((r) => r.takenDate !== '2026-07-16');
    expect(getNextDueDate(item, removed, TODAY)).toBe('2026-07-13');
  });

  it('月末・月跨ぎ：7/30 服用の3日後は 8/2', () => {
    const records = [makeRecord(item.id, '2026-07-30')];
    expect(getNextDueDate(item, records, '2026-07-31')).toBe('2026-08-02');
    expect(isScheduledOn(item, records, '2026-08-02', '2026-07-31')).toBe(true);
  });

  it('年跨ぎ：12/30 服用の3日後は 1/2', () => {
    const records = [makeRecord(item.id, '2026-12-30')];
    expect(getNextDueDate(item, records, '2026-12-31')).toBe('2027-01-02');
  });
});

describe('as_needed', () => {
  const item = makeItem({ scheduleType: 'as_needed' });

  it('どの日も予定にならない', () => {
    expect(isScheduledOn(item, [], TODAY, TODAY)).toBe(false);
    expect(isScheduledOn(item, [], '2026-07-01', TODAY)).toBe(false);
    expect(getNextDueDate(item, [], TODAY)).toBeNull();
  });

  it('今日のむものに含まれない', () => {
    expect(getTodayItems([item], [], TODAY)).toHaveLength(0);
  });

  it('記録した日はカレンダー上 recorded になる', () => {
    const records = [makeRecord(item.id, '2026-07-15', 'none')];
    const schedule = getMonthSchedule([item], records, '2026-07', TODAY);
    expect(schedule.get('2026-07-15')).toEqual([{ item, status: 'recorded' }]);
    expect(schedule.has('2026-07-14')).toBe(false);
  });
});

describe('非アクティブのアイテム', () => {
  it('予定導出から除外されるが記録は recorded として残る', () => {
    const item = makeItem({ scheduleType: 'daily', isActive: false });
    const records = [makeRecord(item.id, '2026-07-10')];
    expect(isScheduledOn(item, records, TODAY, TODAY)).toBe(false);
    expect(getTodayItems([item], records, TODAY)).toHaveLength(0);
    const schedule = getMonthSchedule([item], records, '2026-07', TODAY);
    expect(schedule.get('2026-07-10')).toEqual([{ item, status: 'recorded' }]);
    expect(schedule.has('2026-07-11')).toBe(false);
  });
});

describe('getTodayItems', () => {
  it('タイミングごとの記録状態を slots で返す', () => {
    const item = makeItem({ scheduleType: 'daily', timings: ['morning', 'evening'] });
    const records = [makeRecord(item.id, TODAY, 'morning')];
    const [entry] = getTodayItems([item], records, TODAY);
    expect(entry.slots).toEqual([
      { timing: 'morning', taken: true },
      { timing: 'evening', taken: false },
    ]);
  });

  it('タイミング未設定は none の1枠', () => {
    const item = makeItem({ scheduleType: 'daily', timings: [] });
    const [entry] = getTodayItems([item], [], TODAY);
    expect(entry.slots).toEqual([{ timing: 'none', taken: false }]);
  });

  it('daily/weekly は期限超過にならない', () => {
    const item = makeItem({ scheduleType: 'daily' });
    const [entry] = getTodayItems([item], [], TODAY);
    expect(entry.isOverdue).toBe(false);
  });
});

describe('getMonthSchedule', () => {
  it('予定・記録済み・未記録の3状態を日別に返す', () => {
    const item = makeItem({ scheduleType: 'daily' });
    const records = [makeRecord(item.id, '2026-07-10')];
    const schedule = getMonthSchedule([item], records, '2026-07', TODAY);
    expect(schedule.get('2026-07-10')).toEqual([{ item, status: 'recorded' }]);
    expect(schedule.get('2026-07-11')).toEqual([{ item, status: 'missed' }]); // 未記録の過去日
    expect(schedule.get(TODAY)).toEqual([{ item, status: 'scheduled' }]); // 今日（未記録）
    expect(schedule.get('2026-07-25')).toEqual([{ item, status: 'scheduled' }]); // 未来
    expect(schedule.has('2026-06-30')).toBe(false); // 開始日前・月範囲外
  });

  it('過去月・未来月も導出できる（月送り）', () => {
    const item = makeItem({
      scheduleType: 'weekly',
      weekdays: [1],
      createdAt: '2026-01-01T12:00:00.000Z',
    });
    const past = getMonthSchedule([item], [], '2026-02', TODAY);
    expect(past.get('2026-02-02')).toEqual([{ item, status: 'missed' }]); // 2月の月曜
    const future = getMonthSchedule([item], [], '2026-08', TODAY);
    expect(future.get('2026-08-03')).toEqual([{ item, status: 'scheduled' }]);
  });

  it('複数アイテムが同じ日に並ぶ', () => {
    const a = makeItem({ scheduleType: 'daily', name: 'A' });
    const b = makeItem({ scheduleType: 'daily', name: 'B', category: 'supplement' });
    const records = [makeRecord(a.id, TODAY)];
    const schedule = getMonthSchedule([a, b], records, '2026-07', TODAY);
    expect(schedule.get(TODAY)).toEqual([
      { item: a, status: 'recorded' },
      { item: b, status: 'scheduled' },
    ]);
  });
});

describe('deriveDayDetail', () => {
  it('daily アイテムのタイミングをスロット展開する', () => {
    const item = makeItem({ timings: ['morning', 'evening'] });
    const { entries, asNeeded } = deriveDayDetail([item], [], TODAY, TODAY);
    expect(entries).toEqual([
      {
        item,
        slots: [
          { timing: 'morning', taken: false },
          { timing: 'evening', taken: false },
        ],
      },
    ]);
    expect(asNeeded).toEqual([]);
  });

  it('記録済みのスロットは taken=true', () => {
    const item = makeItem({ timings: ['morning', 'evening'] });
    const records = [makeRecord(item.id, TODAY, 'morning')];
    const { entries } = deriveDayDetail([item], records, TODAY, TODAY);
    expect(entries[0].slots).toEqual([
      { timing: 'morning', taken: true },
      { timing: 'evening', taken: false },
    ]);
  });

  it('タイミング未設定は none 1スロット', () => {
    const item = makeItem({ timings: [] });
    const { entries } = deriveDayDetail([item], [], TODAY, TODAY);
    expect(entries[0].slots).toEqual([{ timing: 'none', taken: false }]);
  });

  it('weekly の非予定日でも記録があれば entries に含める', () => {
    // 2026-07-19 は日曜。月曜のみ予定の weekly
    const item = makeItem({ scheduleType: 'weekly', weekdays: [1], timings: ['morning'] });
    const records = [makeRecord(item.id, TODAY, 'morning')];
    const { entries } = deriveDayDetail([item], records, TODAY, TODAY);
    expect(entries).toHaveLength(1);
    expect(entries[0].slots[0].taken).toBe(true);
    const without = deriveDayDetail([item], [], TODAY, TODAY);
    expect(without.entries).toHaveLength(0);
  });

  it('as_needed は未記録なら asNeeded、記録済みなら entries に入る', () => {
    const item = makeItem({ scheduleType: 'as_needed', timings: [] });
    const empty = deriveDayDetail([item], [], TODAY, TODAY);
    expect(empty.entries).toHaveLength(0);
    expect(empty.asNeeded).toEqual([{ item, slots: [{ timing: 'none', taken: false }] }]);

    const records = [makeRecord(item.id, TODAY, 'none')];
    const recorded = deriveDayDetail([item], records, TODAY, TODAY);
    expect(recorded.entries).toEqual([{ item, slots: [{ timing: 'none', taken: true }] }]);
    expect(recorded.asNeeded).toHaveLength(0);
  });

  it('非アクティブは記録がある日だけ entries に出て、asNeeded には出ない', () => {
    const inactive = makeItem({ scheduleType: 'as_needed', isActive: false, timings: [] });
    const without = deriveDayDetail([inactive], [], TODAY, TODAY);
    expect(without.entries).toHaveLength(0);
    expect(without.asNeeded).toHaveLength(0);

    const records = [makeRecord(inactive.id, TODAY, 'none')];
    const withRecord = deriveDayDetail([inactive], records, TODAY, TODAY);
    expect(withRecord.entries).toHaveLength(1);
  });

  it('timings に無いタイミングの記録は追記スロットとして表示する', () => {
    const item = makeItem({ timings: ['morning'] });
    const records = [makeRecord(item.id, TODAY, 'noon')];
    const { entries } = deriveDayDetail([item], records, TODAY, TODAY);
    expect(entries[0].slots).toEqual([
      { timing: 'morning', taken: false },
      { timing: 'noon', taken: true },
    ]);
  });

  it('開始日前の日は entries に含めない', () => {
    const item = makeItem({ createdAt: '2026-07-10T12:00:00.000Z' });
    const { entries } = deriveDayDetail([item], [], '2026-07-05', TODAY);
    expect(entries).toHaveLength(0);
  });

  it('interval の過去予定日（期限超過）も entries に含める', () => {
    const item = makeItem({ scheduleType: 'interval', intervalDays: 3 });
    // 開始日 2026-07-01・記録なし → 7/1 以降ずっと予定が残る
    const { entries } = deriveDayDetail([item], [], '2026-07-10', TODAY);
    expect(entries).toHaveLength(1);
  });
});
