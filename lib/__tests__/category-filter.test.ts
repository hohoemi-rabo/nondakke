import {
  categoryFilterLabel,
  cycleCategoryFilter,
  type CategoryFilter,
} from '@/lib/category-filter';

describe('cycleCategoryFilter', () => {
  it('順方向に一周する', () => {
    let filter: CategoryFilter = null;
    const seen: CategoryFilter[] = [];
    for (let i = 0; i < 4; i++) {
      filter = cycleCategoryFilter(filter, 1);
      seen.push(filter);
    }
    expect(seen).toEqual(['medicine', 'supplement', 'other', null]);
  });

  it('逆方向に一周する', () => {
    let filter: CategoryFilter = null;
    const seen: CategoryFilter[] = [];
    for (let i = 0; i < 4; i++) {
      filter = cycleCategoryFilter(filter, -1);
      seen.push(filter);
    }
    expect(seen).toEqual(['other', 'supplement', 'medicine', null]);
  });
});

describe('categoryFilterLabel', () => {
  it('null は「全部」、カテゴリは日本語ラベル', () => {
    expect(categoryFilterLabel(null)).toBe('全部');
    expect(categoryFilterLabel('medicine')).toBe('お薬');
    expect(categoryFilterLabel('supplement')).toBe('サプリ');
    expect(categoryFilterLabel('other')).toBe('その他');
  });
});
