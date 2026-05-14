import { daysUntil, formatDate, isUrgent, addDays, addMonths } from '../../src/utils/dates';

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

describe('addDays', () => {
  it('returns ISO date 7 days from today', () => {
    const result = addDays(7);
    const expected = new Date();
    expected.setDate(expected.getDate() + 7);
    expect(result).toBe(expected.toISOString().slice(0, 10));
  });

  it('returns ISO date 0 days from today (today)', () => {
    const result = addDays(0);
    const today = new Date().toISOString().slice(0, 10);
    expect(result).toBe(today);
  });
});

describe('addMonths', () => {
  it('returns ISO date 1 month from today', () => {
    const result = addMonths(1);
    const expected = new Date();
    expected.setMonth(expected.getMonth() + 1);
    expect(result).toBe(expected.toISOString().slice(0, 10));
  });
});
