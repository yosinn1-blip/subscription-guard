import { SERVICES, ServiceEntry, ServicePlan } from '../../src/data/services';

describe('SERVICES catalog', () => {
  it('has at least 9 entries', () => {
    expect(SERVICES.length).toBeGreaterThanOrEqual(9);
  });

  it('every entry has required string fields', () => {
    SERVICES.forEach((s: ServiceEntry) => {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.iconSlug).toBeTruthy();
      expect(s.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('every entry has at least one plan with positive price', () => {
    SERVICES.forEach((s: ServiceEntry) => {
      expect(s.plans.length).toBeGreaterThanOrEqual(1);
      s.plans.forEach((p: ServicePlan) => {
        expect(p.name).toBeTruthy();
        expect(p.price).toBeGreaterThan(0);
      });
    });
  });

  it('all ids are unique', () => {
    const ids = SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
