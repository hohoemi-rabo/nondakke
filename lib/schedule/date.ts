// YYYY-MM-DD 文字列ベースの日付ユーティリティ。
// ゼロ埋め形式なので日付の大小比較は文字列比較（< / >）で成立する。
// 演算はすべて Date.UTC 経由で行い、端末タイムゾーンによる日付ズレを防ぐ。
// ローカルタイムゾーンが関与するのは toDateString（Date → 日付文字列）だけ。

// ローカル日付の YYYY-MM-DD。「今日」の算出や createdAt(ISO) → 開始日の変換に使う
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toUtc(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(utcMs: number): string {
  const date = new Date(utcMs);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, n: number): string {
  return fromUtc(toUtc(dateStr) + n * 86400000);
}

// b - a の日数（a より b が未来なら正）
export function diffDays(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / 86400000);
}

// 0=日〜6=土
export function weekdayOf(dateStr: string): number {
  return new Date(toUtc(dateStr)).getUTCDay();
}

// 'YYYY-MM' の全日付を昇順で返す（月末・うるう年は Date.UTC の繰り上がりで処理）
export function datesOfMonth(yearMonth: string): string[] {
  const [y, m] = yearMonth.split('-').map(Number);
  const dates: string[] = [];
  for (let d = 1; ; d++) {
    const utc = Date.UTC(y, m - 1, d);
    if (new Date(utc).getUTCMonth() !== m - 1) {
      break;
    }
    dates.push(fromUtc(utc));
  }
  return dates;
}
