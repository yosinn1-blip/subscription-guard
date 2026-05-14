import { SERVICES, ServiceEntry } from '../../src/data/services';

describe('SERVICES catalog', () => {
  it('has at least 9 entries', () => {
    expect(SERVICES.length).toBeGreaterThanOrEqual(9);
  });

  it('every entry has required string fields', () => {
    SERVICES.forEach((s: ServiceEntry) => {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.emoji).toBeTruthy();
      expect(s.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('every entry has non-negative price', () => {
    SERVICES.forEach((s: ServiceEntry) => {
      expect(s.defaultPrice).toBeGreaterThanOrEqual(0);
    });
  });

  it('all ids are unique', () => {
    const ids = SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
