import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadAll,
  addSubscription,
  updateSubscription,
  deleteSubscription,
} from '../../src/storage/subscriptions';

jest.mock('expo-crypto', () => ({
  randomUUID: () => `test-uuid-${Math.random().toString(36).slice(2)}`,
}));

const baseData = {
  name: 'Netflix',
  price: 1590,
  status: 'trial' as const,
  trialEndDate: '2026-05-20',
  nextBillingDate: '2026-05-20',
  cancelUrl: 'https://netflix.com/cancel',
  cancelNotes: null,
  notifyDaysBefore: 1,
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('loadAll', () => {
  it('returns empty array when nothing stored', async () => {
    const result = await loadAll();
    expect(result).toEqual([]);
  });
});

describe('addSubscription', () => {
  it('adds a subscription and returns it with id', async () => {
    const sub = await addSubscription(baseData);
    expect(sub.id).toBeTruthy();
    expect(sub.name).toBe('Netflix');
    expect(sub.createdAt).toBeTruthy();
  });

  it('persists added subscription', async () => {
    await addSubscription(baseData);
    const all = await loadAll();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Netflix');
  });

  it('can add multiple subscriptions', async () => {
    await addSubscription(baseData);
    await addSubscription({ ...baseData, name: 'Spotify', price: 980 });
    const all = await loadAll();
    expect(all).toHaveLength(2);
  });
});

describe('updateSubscription', () => {
  it('updates specified fields', async () => {
    const sub = await addSubscription(baseData);
    const updated = await updateSubscription(sub.id, { name: 'Netflix Premium' });
    expect(updated.name).toBe('Netflix Premium');
    expect(updated.price).toBe(1590); // unchanged
  });

  it('throws when id not found', async () => {
    await expect(updateSubscription('nonexistent', { name: 'X' })).rejects.toThrow();
  });
});

describe('deleteSubscription', () => {
  it('removes subscription by id', async () => {
    const sub = await addSubscription(baseData);
    await deleteSubscription(sub.id);
    const all = await loadAll();
    expect(all).toHaveLength(0);
  });
});
