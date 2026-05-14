# Trial Focus Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** アプリをトライアル番人に特化させるため、`active` ステータス・`nextBillingDate`・`cancelNotes` を削除し、「解約ページへ」ボタンを緊急時にカードへ表示する。

**Architecture:** `Subscription` 型からフィールドを削除することで連鎖的に全画面の参照が外れる。テストのフィクスチャ修正 → 型更新 → UI更新の順で進める。`storage.ts` はジェネリックな実装のため変更不要。

**Tech Stack:** Expo SDK 54, React Native, TypeScript, AsyncStorage, expo-notifications

---

## ファイル構成

```
src/types/
  subscription.ts         # 変更: active削除, nextBillingDate/cancelNotes削除
src/components/
  SubscriptionCard.tsx    # 変更: 残り3日以内+cancelUrlあり → 解約ボタン表示
app/
  add.tsx                 # 変更: ステータストグル削除, nextBillingDate削除
  index.tsx               # 変更: trial のみ表示, actives セクション削除
  [id].tsx                # 変更: 解約済みにする→解約ページへ, cancelNotes削除
__tests__/
  storage/subscriptions.test.ts    # 変更: baseData から nextBillingDate/cancelNotes 削除
  notifications/scheduler.test.ts  # 変更: makeSub から nextBillingDate/cancelNotes 削除
```

---

## Task 1: 型更新 + テストフィクスチャ修正

**Files:**
- Modify: `src/types/subscription.ts`
- Modify: `__tests__/storage/subscriptions.test.ts`
- Modify: `__tests__/notifications/scheduler.test.ts`

- [ ] **Step 1: `src/types/subscription.ts` を更新する**

```typescript
// src/types/subscription.ts
export type SubscriptionStatus = 'trial' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  status: SubscriptionStatus;
  trialEndDate: string | null;
  cancelUrl: string | null;
  notifyDaysBefore: number;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: `__tests__/storage/subscriptions.test.ts` の `baseData` を修正する**

`baseData` から `nextBillingDate` と `cancelNotes` を削除する：

```typescript
const baseData = {
  name: 'Netflix',
  price: 1590,
  status: 'trial' as const,
  trialEndDate: '2026-05-20',
  cancelUrl: 'https://netflix.com/cancel',
  notifyDaysBefore: 1,
};
```

- [ ] **Step 3: `__tests__/notifications/scheduler.test.ts` の `makeSub` を修正する**

`makeSub` から `nextBillingDate` と `cancelNotes` を削除する：

```typescript
const makeSub = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 'test-id',
  name: 'Netflix',
  price: 1590,
  status: 'trial',
  trialEndDate: '2030-12-31',
  cancelUrl: null,
  notifyDaysBefore: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
cd ~/dev/subscription-guard && npm test
```

Expected: PASS（27テスト全通過）

- [ ] **Step 5: コミットする**

```bash
git -C ~/dev/subscription-guard add src/types/subscription.ts __tests__/storage/subscriptions.test.ts __tests__/notifications/scheduler.test.ts
git -C ~/dev/subscription-guard commit -m "refactor: remove active status, nextBillingDate, cancelNotes from type"
```

---

## Task 2: app/add.tsx 簡素化

**Files:**
- Modify: `app/add.tsx`

- [ ] **Step 1: `app/add.tsx` を以下の内容で全面置き換える**

ステータストグル・`nextBillingDate` を削除。常に `status: 'trial'` で保存。`trialEndDate` は常に表示。

```tsx
// app/add.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { addSubscription } from '../src/storage/subscriptions';
import { scheduleTrialReminder } from '../src/notifications/scheduler';
import { ServiceEntry } from '../src/data/services';
import ServiceGrid from '../src/components/ServiceGrid';
import DatePickerField from '../src/components/DatePickerField';

export default function AddScreen() {
  const router = useRouter();

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [cancelUrl, setCancelUrl] = useState('');

  const isCustomService = selectedServiceId === '__other__' || selectedServiceId === null;

  const handleServiceSelect = (service: ServiceEntry | null) => {
    if (service === null) {
      setSelectedServiceId('__other__');
      setName('');
      setPrice('');
      setCancelUrl('');
    } else {
      setSelectedServiceId(service.id);
      setName(service.name);
      setPrice(service.defaultPrice > 0 ? String(service.defaultPrice) : '');
      setCancelUrl(service.cancelUrl ?? '');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', 'サービス名を入力してください');
      return;
    }

    const sub = await addSubscription({
      name: name.trim(),
      price: price ? parseInt(price, 10) : 0,
      status: 'trial',
      trialEndDate,
      cancelUrl: cancelUrl || null,
      notifyDaysBefore: 1,
    });

    if (sub.trialEndDate) {
      await scheduleTrialReminder(sub);
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionTitle}>サービスを選ぶ</Text>
        <ServiceGrid selectedId={selectedServiceId} onSelect={handleServiceSelect} />

        <Text style={styles.label}>サービス名 *</Text>
        <TextInput
          style={[styles.input, !isCustomService && styles.inputReadonly]}
          value={name}
          onChangeText={isCustomService ? setName : undefined}
          editable={isCustomService}
          placeholder="サービス名を入力"
          placeholderTextColor="#bbb"
        />

        <Text style={styles.label}>月額（円）</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="例: 1590"
          keyboardType="number-pad"
          placeholderTextColor="#bbb"
        />

        <Text style={styles.label}>トライアル終了日</Text>
        <DatePickerField value={trialEndDate} onChange={setTrialEndDate} />

        <Text style={styles.sectionTitle}>解約情報</Text>
        <Text style={styles.label}>解約ページURL</Text>
        <TextInput
          style={styles.input}
          value={cancelUrl}
          onChangeText={setCancelUrl}
          placeholder="https://..."
          keyboardType="url"
          autoCapitalize="none"
          placeholderTextColor="#bbb"
        />

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存する</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F0' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  label: { fontSize: 14, color: '#555', marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputReadonly: {
    color: '#888',
    backgroundColor: '#F8F8F8',
  },
  saveButton: {
    backgroundColor: '#5C8A6E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 2: TypeScript チェック**

```bash
cd ~/dev/subscription-guard && npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "__tests__"
```

Expected: エラーなし

- [ ] **Step 3: 全テストを通す**

```bash
cd ~/dev/subscription-guard && npm test
```

Expected: PASS（27テスト全通過）

- [ ] **Step 4: コミットする**

```bash
git -C ~/dev/subscription-guard add app/add.tsx
git -C ~/dev/subscription-guard commit -m "feat: simplify add form to trial-only"
```

---

## Task 3: app/index.tsx 簡素化

**Files:**
- Modify: `app/index.tsx`

- [ ] **Step 1: `app/index.tsx` を以下の内容で全面置き換える**

`trial` のみ表示、`actives` セクションを削除。

```tsx
// app/index.tsx
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { loadAll } from '../src/storage/subscriptions';
import { rescheduleAll } from '../src/notifications/scheduler';
import SubscriptionCard from '../src/components/SubscriptionCard';
import type { Subscription } from '../src/types/subscription';

export default function HomeScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const router = useRouter();

  const load = useCallback(async () => {
    const all = await loadAll();
    const trials = all.filter((s) => s.status === 'trial');
    setSubscriptions(trials);
    await rescheduleAll(trials);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const renderItem = ({ item }: { item: Subscription }) => (
    <SubscriptionCard
      subscription={item}
      onPress={() => router.push(`/${item.id}`)}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>トライアル監視</Text>
          <Pressable style={styles.addButton} onPress={() => router.push('/add')}>
            <Text style={styles.addButtonText}>＋ 追加</Text>
          </Pressable>
        </View>

        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>トライアルを追加しよう</Text>
              <Text style={styles.emptyBody}>
                無料トライアルを登録すると、{'\n'}終了前日に通知します。
              </Text>
            </View>
          }
          contentContainerStyle={subscriptions.length === 0 ? styles.emptyContainer : undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F0' },
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#5C8A6E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#555', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
});
```

- [ ] **Step 2: TypeScript チェック**

```bash
cd ~/dev/subscription-guard && npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "__tests__"
```

Expected: エラーなし

- [ ] **Step 3: コミットする**

```bash
git -C ~/dev/subscription-guard add app/index.tsx
git -C ~/dev/subscription-guard commit -m "feat: home screen shows trial-only subscriptions"
```

---

## Task 4: SubscriptionCard に緊急時「解約ページへ」ボタン追加

**Files:**
- Modify: `src/components/SubscriptionCard.tsx`

- [ ] **Step 1: `src/components/SubscriptionCard.tsx` を以下の内容で全面置き換える**

残り3日以内 (`isUrgent`) かつ `cancelUrl` がある場合にのみ「解約ページへ →」ボタンを表示する。`Linking` を追加。

```tsx
// src/components/SubscriptionCard.tsx
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import type { Subscription } from '../types/subscription';
import { formatDate, isUrgent } from '../utils/dates';
import DaysLeftBadge from './DaysLeftBadge';

interface Props {
  subscription: Subscription;
  onPress: () => void;
}

export default function SubscriptionCard({ subscription, onPress }: Props) {
  const { name, price, trialEndDate, cancelUrl } = subscription;
  const urgent = isUrgent(trialEndDate);
  const showCancelButton = urgent && !!cancelUrl;

  return (
    <Pressable
      style={[styles.card, urgent && styles.urgentCard]}
      onPress={onPress}
      android_ripple={{ color: '#e0e0e0' }}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {trialEndDate && <DaysLeftBadge isoDate={trialEndDate} />}
      </View>
      {trialEndDate && (
        <Text style={styles.sub}>{formatDate(trialEndDate)}に自動課金開始</Text>
      )}
      {price > 0 && <Text style={styles.price}>¥{price.toLocaleString()}/月</Text>}
      {showCancelButton && (
        <Pressable
          style={styles.cancelButton}
          onPress={() => Linking.openURL(cancelUrl!)}
        >
          <Text style={styles.cancelButtonText}>解約ページへ →</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  urgentCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#C0392B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  sub: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginTop: 6,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#C0392B',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
```

- [ ] **Step 2: TypeScript チェック**

```bash
cd ~/dev/subscription-guard && npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "__tests__"
```

Expected: エラーなし

- [ ] **Step 3: コミットする**

```bash
git -C ~/dev/subscription-guard add src/components/SubscriptionCard.tsx
git -C ~/dev/subscription-guard commit -m "feat: show cancel button on card when trial expires within 3 days"
```

---

## Task 5: app/[id].tsx 整理

**Files:**
- Modify: `app/[id].tsx`

- [ ] **Step 1: `app/[id].tsx` を以下の内容で全面置き換える**

`cancelNotes` を削除。「解約済みにする」を「解約ページへ」（`Linking.openURL`）に変更。

```tsx
// app/[id].tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  loadAll,
  updateSubscription,
  deleteSubscription,
} from '../src/storage/subscriptions';
import {
  scheduleTrialReminder,
  cancelReminder,
} from '../src/notifications/scheduler';
import type { Subscription } from '../src/types/subscription';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [cancelUrl, setCancelUrl] = useState('');

  useEffect(() => {
    (async () => {
      const all = await loadAll();
      const found = all.find((s) => s.id === id) ?? null;
      setSub(found);
      if (found) {
        setCancelUrl(found.cancelUrl ?? '');
      }
    })();
  }, [id]);

  if (!sub) return null;

  const handleSave = async () => {
    const updated = await updateSubscription(id, {
      cancelUrl: cancelUrl || null,
    });
    if (updated.trialEndDate) {
      await scheduleTrialReminder(updated);
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('削除', `${sub.name} を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await deleteSubscription(id);
          await cancelReminder(id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.name}>{sub.name}</Text>
        {sub.price > 0 && (
          <Text style={styles.price}>¥{sub.price.toLocaleString()}/月</Text>
        )}

        <Text style={styles.sectionTitle}>解約情報</Text>

        <Text style={styles.label}>解約ページURL</Text>
        <TextInput
          style={styles.input}
          value={cancelUrl}
          onChangeText={setCancelUrl}
          placeholder="https://..."
          keyboardType="url"
          autoCapitalize="none"
          placeholderTextColor="#bbb"
        />

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存する</Text>
        </Pressable>

        {cancelUrl ? (
          <Pressable
            style={styles.openCancelButton}
            onPress={() => Linking.openURL(cancelUrl)}
          >
            <Text style={styles.openCancelButtonText}>解約ページへ →</Text>
          </Pressable>
        ) : null}

        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>削除する</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F0' },
  scroll: { padding: 16, paddingBottom: 60 },
  name: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  price: { fontSize: 16, color: '#888', marginBottom: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
  },
  label: { fontSize: 14, color: '#555', marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#5C8A6E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  openCancelButton: {
    backgroundColor: '#C0392B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  openCancelButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: { color: '#C0392B', fontSize: 15, fontWeight: '600' },
});
```

- [ ] **Step 2: TypeScript チェック**

```bash
cd ~/dev/subscription-guard && npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "__tests__"
```

Expected: エラーなし

- [ ] **Step 3: 全テストを通す**

```bash
cd ~/dev/subscription-guard && npm test
```

Expected: PASS（27テスト全通過）

- [ ] **Step 4: コミットする**

```bash
git -C ~/dev/subscription-guard add app/[id].tsx
git -C ~/dev/subscription-guard commit -m "feat: replace cancel-status button with open-cancel-url button"
```

---

## 完了チェックリスト

- [ ] `npm test` が全テスト PASS する
- [ ] `npx tsc --noEmit` で app/ と src/ にエラーがない
- [ ] 追加フォームにステータストグルが表示されない
- [ ] ホームに「通常課金」セクションが表示されない
- [ ] 残り3日以内のカードに赤い「解約ページへ →」ボタンが現れる
- [ ] 詳細画面の「解約ページへ →」でブラウザが開く
- [ ] 詳細画面に「解約手順メモ」欄がない
