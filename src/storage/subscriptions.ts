import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import type { Subscription } from '../types/subscription';

const STORAGE_KEY = '@subscription_guard/subscriptions';

export async function loadAll(): Promise<Subscription[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAll(subs: Subscription[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
}

export async function addSubscription(
  data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Subscription> {
  const now = new Date().toISOString();
  const sub: Subscription = { ...data, id: randomUUID(), createdAt: now, updatedAt: now };
  const all = await loadAll();
  await saveAll([...all, sub]);
  return sub;
}

export async function updateSubscription(
  id: string,
  patch: Partial<Omit<Subscription, 'id' | 'createdAt'>>
): Promise<Subscription> {
  const all = await loadAll();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error(`Subscription ${id} not found`);
  const updated: Subscription = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  all[idx] = updated;
  await saveAll(all);
  return updated;
}

export async function deleteSubscription(id: string): Promise<void> {
  const all = await loadAll();
  await saveAll(all.filter((s) => s.id !== id));
}
