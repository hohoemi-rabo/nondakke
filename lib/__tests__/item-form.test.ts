import { type Item } from '@/lib/db/types';
import {
  emptyItemFormState,
  itemFormStateFromItem,
  itemFormToInput,
  toggleInArray,
  validateItemForm,
  type ItemFormState,
} from '@/lib/item-form';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 1,
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

function makeState(overrides: Partial<ItemFormState> = {}): ItemFormState {
  return { ...emptyItemFormState(), name: 'テスト薬', ...overrides };
}

describe('emptyItemFormState', () => {
  it('デフォルトは毎日・お薬・空の任意項目', () => {
    expect(emptyItemFormState()).toEqual({
      name: '',
      scheduleType: 'daily',
      intervalDaysText: '',
      weekdays: [],
      category: 'medicine',
      timings: [],
      memo: '',
    });
  });
});

describe('itemFormStateFromItem', () => {
  it('interval アイテムの日数を文字列に変換して反映する', () => {
    const item = makeItem({
      scheduleType: 'interval',
      intervalDays: 3,
      category: 'supplement',
      timings: ['morning', 'evening'],
      memo: '食後に飲む',
    });
    expect(itemFormStateFromItem(item)).toEqual({
      name: 'テスト薬',
      scheduleType: 'interval',
      intervalDaysText: '3',
      weekdays: [],
      category: 'supplement',
      timings: ['morning', 'evening'],
      memo: '食後に飲む',
    });
  });

  it('weekly アイテムの曜日を保持し、memo null は空文字にする', () => {
    const item = makeItem({ scheduleType: 'weekly', weekdays: [1, 4], memo: null });
    const state = itemFormStateFromItem(item);
    expect(state.weekdays).toEqual([1, 4]);
    expect(state.intervalDaysText).toBe('');
    expect(state.memo).toBe('');
  });
});

describe('validateItemForm', () => {
  it('名前あり・毎日ならエラーなし', () => {
    expect(validateItemForm(makeState())).toEqual({});
  });

  it('名前が空白のみならエラー', () => {
    expect(validateItemForm(makeState({ name: '  ' })).name).toBe('名前を入力してください');
  });

  it.each(['', '0', 'abc', '1.5'])('interval で日数 "%s" はエラー', (text) => {
    const errors = validateItemForm(
      makeState({ scheduleType: 'interval', intervalDaysText: text })
    );
    expect(errors.intervalDays).toBe('1以上の日数を入力してください');
  });

  it('interval で正の整数ならエラーなし', () => {
    expect(
      validateItemForm(makeState({ scheduleType: 'interval', intervalDaysText: '3' }))
    ).toEqual({});
  });

  it('weekly で曜日未選択ならエラー', () => {
    const errors = validateItemForm(makeState({ scheduleType: 'weekly', weekdays: [] }));
    expect(errors.weekdays).toBe('曜日を1つ以上選択してください');
  });

  it('weekly で曜日選択済みならエラーなし', () => {
    expect(validateItemForm(makeState({ scheduleType: 'weekly', weekdays: [1] }))).toEqual({});
  });

  it('複数のエラーは独立して返る', () => {
    const errors = validateItemForm(makeState({ name: '', scheduleType: 'weekly' }));
    expect(errors.name).toBeDefined();
    expect(errors.weekdays).toBeDefined();
  });
});

describe('itemFormToInput', () => {
  it('名前と日数を trim・変換する', () => {
    const input = itemFormToInput(
      makeState({ name: ' 血圧の薬 ', scheduleType: 'interval', intervalDaysText: ' 3 ' })
    );
    expect(input.name).toBe('血圧の薬');
    expect(input.intervalDays).toBe(3);
  });

  it('daily では intervalDays は null・weekdays は空になる', () => {
    const input = itemFormToInput(
      makeState({ intervalDaysText: '5', weekdays: [1, 2], timings: ['noon'] })
    );
    expect(input.intervalDays).toBeNull();
    expect(input.weekdays).toEqual([]);
    expect(input.timings).toEqual(['noon']);
  });

  it('weekly の曜日は昇順に並べる', () => {
    const input = itemFormToInput(makeState({ scheduleType: 'weekly', weekdays: [4, 0, 1] }));
    expect(input.weekdays).toEqual([0, 1, 4]);
  });

  it('メモは空白のみなら null になる', () => {
    expect(itemFormToInput(makeState({ memo: '  ' })).memo).toBeNull();
    expect(itemFormToInput(makeState({ memo: ' 食後 ' })).memo).toBe('食後');
  });
});

describe('toggleInArray', () => {
  it('未選択の値は追加する', () => {
    expect(toggleInArray([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it('選択済みの値は取り除く', () => {
    expect(toggleInArray([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it('元の配列は変更しない', () => {
    const arr = [1, 2];
    toggleInArray(arr, 3);
    toggleInArray(arr, 1);
    expect(arr).toEqual([1, 2]);
  });
});
