import { daysUntil, formatDate, isUrgent } from '../../src/utils/dates';

describe('daysUntil', () => {
  it('today returns 0', () => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    expect(daysUntil(iso)).toBe(0);
  });

  it('tomorrow returns 1', () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const iso = d.toISOString().slice(0, 10);
    expect(daysUntil(iso)).toBe(1);
  });

  it('yesterday returns -1', () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const iso = d.toISOString().slice(0, 10);
    expect(daysUntil(iso)).toBe(-1);
  });
});

describe('formatDate', () => {
  it('formats 2026-05-15 as 5月15日', () => {
    expect(formatDate('2026-05-15')).toBe('5月15日');
  });

  it('formats 2026-01-01 as 1月1日', () => {
    expect(formatDate('2026-01-01')).toBe('1月1日');
  });
});

describe('isUrgent', () => {
  it('null date is not urgent', () => {
    expect(isUrgent(null)).toBe(false);
  });

  it('date within 3 days is urgent', () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    expect(isUrgent(d.toISOString().slice(0, 10))).toBe(true);
  });

  it('date 4 days away is not urgent', () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    expect(isUrgent(d.toISOString().slice(0, 10))).toBe(false);
  });

  it('past date is not urgent', () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    expect(isUrgent(d.toISOString().slice(0, 10))).toBe(false);
  });
});
