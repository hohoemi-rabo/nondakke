import { addDays, datesOfMonth, diffDays, toDateString, weekdayOf } from '@/lib/schedule/date';

describe('addDays', () => {
  it('月末を跨ぐ', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('年を跨ぐ', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('うるう年の2月末', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('負の日数で戻る', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('複数日の加算', () => {
    expect(addDays('2026-07-19', 30)).toBe('2026-08-18');
  });
});

describe('diffDays', () => {
  it('未来方向は正', () => {
    expect(diffDays('2026-07-19', '2026-07-22')).toBe(3);
  });

  it('過去方向は負', () => {
    expect(diffDays('2026-07-19', '2026-07-15')).toBe(-4);
  });

  it('年跨ぎ', () => {
    expect(diffDays('2026-12-31', '2027-01-01')).toBe(1);
  });
});

describe('weekdayOf', () => {
  it('0=日〜6=土', () => {
    expect(weekdayOf('2026-07-19')).toBe(0); // 日曜
    expect(weekdayOf('2026-07-20')).toBe(1); // 月曜
    expect(weekdayOf('2026-07-25')).toBe(6); // 土曜
  });
});

describe('datesOfMonth', () => {
  it('31日の月', () => {
    const dates = datesOfMonth('2026-07');
    expect(dates).toHaveLength(31);
    expect(dates[0]).toBe('2026-07-01');
    expect(dates[30]).toBe('2026-07-31');
  });

  it('平年の2月は28日', () => {
    expect(datesOfMonth('2026-02')).toHaveLength(28);
  });

  it('うるう年の2月は29日', () => {
    const dates = datesOfMonth('2028-02');
    expect(dates).toHaveLength(29);
    expect(dates[28]).toBe('2028-02-29');
  });
});

describe('toDateString', () => {
  it('ローカル日付をゼロ埋めで返す', () => {
    expect(toDateString(new Date(2026, 6, 5))).toBe('2026-07-05');
  });
});
