import { categoryFilterLabel } from '@/lib/category-filter';

describe('categoryFilterLabel', () => {
  it('null は「全部」、カテゴリは日本語ラベル', () => {
    expect(categoryFilterLabel(null)).toBe('全部');
    expect(categoryFilterLabel('medicine')).toBe('お薬');
    expect(categoryFilterLabel('supplement')).toBe('サプリ');
    expect(categoryFilterLabel('other')).toBe('その他');
  });
});
