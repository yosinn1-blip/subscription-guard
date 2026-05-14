# Add Form Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `app/add.tsx` のサブスク追加フォームを、サービスカタロググリッド＋プリセット日付ピッカーで全面リデザインする。

**Architecture:** 3つの新コンポーネント（`ServiceGrid`, `DatePickerField`, サービスデータ）を追加し、`app/add.tsx` でそれらを組み合わせる。日付計算ヘルパーは既存の `src/utils/dates.ts` に追加する。ピッカーは `@react-native-community/datetimepicker` をインラインで使用し、追加ライブラリを最小限にする。

**Tech Stack:** Expo SDK 54, React Native, TypeScript, `@react-native-community/datetimepicker`, Jest

---

## ファイル構成

```
src/data/
  services.ts              # 新規: サービスカタログデータ
src/components/
  ServiceGrid.tsx          # 新規: サービス選択グリッド
  DatePickerField.tsx      # 新規: プリセット + インラインカレンダー
src/utils/
  dates.ts                 # 変更: addDays / addMonths を追加
app/
  add.tsx                  # 変更: ServiceGrid・DatePickerField を組み込む
__tests__/
  data/services.test.ts    # 新規: カタログデータの整合性テスト
  utils/dates.test.ts      # 変更: 新しいヘルパーのテスト追加
```

---

## Task 1: 依存パッケージインストール

**Files:**
- Modify: `package.json`

- [ ] **Step 1: @react-native-community/datetimepicker をインストールする**

```bash
cd ~/dev/subscription-guard
npx expo install @react-native-community/datetimepicker
```

Expected: `package.json` の `dependencies` に `@react-native-community/datetimepicker` が追加される。

- [ ] **Step 2: インストールを確認する**

```bash
cat package.json | grep datetimepicker
```

Expected: `"@react-native-community/datetimepicker": "~8.x.x"` のような行が出る。

- [ ] **Step 3: コミットする**

```bash
git -C ~/dev/subscription-guard add package.json package-lock.json
git -C ~/dev/subscription-guard commit -m "chore: install datetimepicker"
```

---

## Task 2: サービスカタログデータ + テスト

**Files:**
- Create: `src/data/services.ts`
- Create: `__tests__/data/services.test.ts`

- [ ] **Step 1: テストディレクトリを作成してテストを書く**

```bash
mkdir -p ~/dev/subscription-guard/__tests__/data
```

```typescript
// __tests__/data/services.test.ts
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
cd ~/dev/subscription-guard && npm test -- __tests__/data/services.test.ts
```

Expected: FAIL (module not found)

- [ ] **Step 3: services.ts を実装する**

```typescript
// src/data/services.ts
export interface ServiceEntry {
  id: string;
  name: string;
  emoji: string;
  color: string;
  defaultPrice: number;
  cancelUrl: string | null;
}

export const SERVICES: ServiceEntry[] = [
  { id: 'netflix',   name: 'Netflix',         emoji: '🎬', color: '#E50914', defaultPrice: 1590, cancelUrl: 'https://www.netflix.com/cancelplan' },
  { id: 'spotify',   name: 'Spotify',         emoji: '🎵', color: '#1DB954', defaultPrice: 980,  cancelUrl: 'https://www.spotify.com/jp/account/subscription/cancel/' },
  { id: 'disney',    name: 'Disney+',         emoji: '🏰', color: '#113CCF', defaultPrice: 990,  cancelUrl: 'https://www.disneyplus.com/ja-jp/account' },
  { id: 'amazon',    name: 'Amazon Prime',    emoji: '📦', color: '#FF9900', defaultPrice: 600,  cancelUrl: 'https://www.amazon.co.jp/mc/pipelines/cancellation' },
  { id: 'youtube',   name: 'YouTube Premium', emoji: '▶️', color: '#FF0000', defaultPrice: 1280, cancelUrl: 'https://www.youtube.com/paid_memberships' },
  { id: 'apple',     name: 'Apple One',       emoji: '🍎', color: '#555555', defaultPrice: 1200, cancelUrl: null },
  { id: 'hulu',      name: 'Hulu',            emoji: '📺', color: '#3DBB3D', defaultPrice: 1026, cancelUrl: 'https://help.hulu.com' },
  { id: 'linemusic', name: 'LINE MUSIC',      emoji: '🎤', color: '#06C755', defaultPrice: 980,  cancelUrl: null },
  { id: 'dazn',      name: 'DAZN',            emoji: '⚽', color: '#000000', defaultPrice: 3700, cancelUrl: null },
];
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npm test -- __tests__/data/services.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: コミットする**

```bash
git -C ~/dev/subscription-guard add src/data/services.ts __tests__/data/services.test.ts
git -C ~/dev/subscription-guard commit -m "feat: add service catalog data"
```

---

## Task 3: 日付ヘルパー関数 + テスト

**Files:**
- Modify: `src/utils/dates.ts`
- Modify: `__tests__/utils/dates.test.ts`

- [ ] **Step 1: 失敗するテストを追加する**

`__tests__/utils/dates.test.ts` の末尾に以下を追加する：

```typescript
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
```

import 行を更新（ファイル先頭）：
```typescript
import { daysUntil, formatDate, isUrgent, addDays, addMonths } from '../../src/utils/dates';
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
cd ~/dev/subscription-guard && npm test -- __tests__/utils/dates.test.ts
```

Expected: FAIL (addDays / addMonths not exported)

- [ ] **Step 3: dates.ts に関数を追加する**

`src/utils/dates.ts` の末尾に追加：

```typescript
export function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function addMonths(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npm test -- __tests__/utils/dates.test.ts
```

Expected: PASS (11 tests)

- [ ] **Step 5: コミットする**

```bash
git -C ~/dev/subscription-guard add src/utils/dates.ts __tests__/utils/dates.test.ts
git -C ~/dev/subscription-guard commit -m "feat: add addDays and addMonths to date utils"
```

---

## Task 4: DatePickerField コンポーネント

**Files:**
- Create: `src/components/DatePickerField.tsx`

- [ ] **Step 1: DatePickerField.tsx を作成する**

```tsx
// src/components/DatePickerField.tsx
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { formatDate, addDays, addMonths } from '../utils/dates';

interface Props {
  value: string | null;
  onChange: (date: string | null) => void;
}

type PresetKey = '7' | '14' | '30' | 'custom';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: '7',      label: '1週間後' },
  { key: '14',     label: '2週間後' },
  { key: '30',     label: '1ヶ月後' },
  { key: 'custom', label: 'カスタム' },
];

function presetToDate(key: PresetKey): string {
  if (key === '7')  return addDays(7);
  if (key === '14') return addDays(14);
  if (key === '30') return addMonths(1);
  return addMonths(1); // fallback, not used for 'custom'
}

export default function DatePickerField({ value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey | null>(null);

  const handlePreset = (key: PresetKey) => {
    if (key === 'custom') {
      setActivePreset('custom');
      setShowPicker(true);
      return;
    }
    if (activePreset === key) {
      // 再タップで解除
      setActivePreset(null);
      setShowPicker(false);
      onChange(null);
      return;
    }
    setActivePreset(key);
    setShowPicker(false);
    onChange(presetToDate(key));
  };

  const handlePickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) {
      onChange(date.toISOString().slice(0, 10));
    }
  };

  return (
    <View>
      <View style={styles.row}>
        {PRESETS.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[styles.btn, activePreset === key && styles.btnActive]}
            onPress={() => handlePreset(key)}
          >
            <Text style={[styles.btnText, activePreset === key && styles.btnTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {value && activePreset !== 'custom' && (
        <Text style={styles.selected}>✓ {formatDate(value)}</Text>
      )}

      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="inline"
          minimumDate={new Date()}
          onChange={handlePickerChange}
          locale="ja-JP"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginTop: 4 },
  btn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  btnActive: { backgroundColor: '#5C8A6E', borderColor: '#5C8A6E' },
  btnText: { fontSize: 12, color: '#555', fontWeight: '500' },
  btnTextActive: { color: '#fff' },
  selected: { fontSize: 13, color: '#5C8A6E', fontWeight: '600', marginTop: 6 },
});
```

- [ ] **Step 2: TypeScript 型チェックを通す**

```bash
cd ~/dev/subscription-guard && npx tsc --noEmit 2>&1 | grep -v '__tests__'
```

Expected: No errors in `src/components/DatePickerField.tsx`

- [ ] **Step 3: コミットする**

```bash
git -C ~/dev/subscription-guard add src/components/DatePickerField.tsx
git -C ~/dev/subscription-guard commit -m "feat: add DatePickerField with presets and inline calendar"
```

---

## Task 5: ServiceGrid コンポーネント

**Files:**
- Create: `src/components/ServiceGrid.tsx`

- [ ] **Step 1: ServiceGrid.tsx を作成する**

```tsx
// src/components/ServiceGrid.tsx
import { View, Text, Pressable, FlatList, StyleSheet, Dimensions } from 'react-native';
import { SERVICES, ServiceEntry } from '../data/services';

interface Props {
  selectedId: string | null;
  onSelect: (service: ServiceEntry | null) => void;
}

const COLS = 3;
const CELL_SIZE = (Dimensions.get('window').width - 32 - 12) / COLS; // padding 16×2, gap 6×2

type GridItem = ServiceEntry | { id: '__other__' };

const GRID_DATA: GridItem[] = [...SERVICES, { id: '__other__' }];

export default function ServiceGrid({ selectedId, onSelect }: Props) {
  const renderItem = ({ item }: { item: GridItem }) => {
    if (item.id === '__other__') {
      const isActive = selectedId === '__other__';
      return (
        <Pressable
          style={[styles.cell, isActive && styles.cellActive]}
          onPress={() => onSelect(null)}
        >
          <Text style={styles.emoji}>✏️</Text>
          <Text style={styles.name}>その他</Text>
        </Pressable>
      );
    }

    const svc = item as ServiceEntry;
    const isActive = selectedId === svc.id;

    return (
      <Pressable
        style={[styles.cell, isActive && styles.cellActive]}
        onPress={() => onSelect(svc)}
      >
        <View style={[styles.iconBg, { backgroundColor: svc.color }]}>
          <Text style={styles.emoji}>{svc.emoji}</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>{svc.name}</Text>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={GRID_DATA}
      keyExtractor={(item) => item.id}
      numColumns={COLS}
      renderItem={renderItem}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  row: { gap: 6, marginBottom: 6 },
  cell: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cellActive: { borderColor: '#5C8A6E' },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emoji: { fontSize: 22 },
  name: { fontSize: 10, color: '#444', fontWeight: '500', textAlign: 'center' },
});
```

- [ ] **Step 2: TypeScript 型チェックを通す**

```bash
cd ~/dev/subscription-guard && npx tsc --noEmit 2>&1 | grep -v '__tests__'
```

Expected: No errors in `src/components/ServiceGrid.tsx`

- [ ] **Step 3: コミットする**

```bash
git -C ~/dev/subscription-guard add src/components/ServiceGrid.tsx
git -C ~/dev/subscription-guard commit -m "feat: add ServiceGrid component"
```

---

## Task 6: app/add.tsx 全面更新

**Files:**
- Modify: `app/add.tsx`

- [ ] **Step 1: app/add.tsx を以下の内容で全面置き換える**

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
import { SERVICES, ServiceEntry } from '../src/data/services';
import ServiceGrid from '../src/components/ServiceGrid';
import DatePickerField from '../src/components/DatePickerField';

type StatusOption = 'trial' | 'active';

export default function AddScreen() {
  const router = useRouter();

  // サービス選択
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // フォームフィールド
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<StatusOption>('trial');
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [cancelUrl, setCancelUrl] = useState('');

  const isCustomService = selectedServiceId === '__other__' || selectedServiceId === null;

  const handleServiceSelect = (service: ServiceEntry | null) => {
    if (service === null) {
      // 「その他」
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
      status,
      trialEndDate: status === 'trial' ? trialEndDate : null,
      nextBillingDate,
      cancelUrl: cancelUrl || null,
      cancelNotes: null,
      notifyDaysBefore: 1,
    });

    if (sub.status === 'trial' && sub.trialEndDate) {
      await scheduleTrialReminder(sub);
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* サービス選択グリッド */}
        <Text style={styles.sectionTitle}>サービスを選ぶ</Text>
        <ServiceGrid selectedId={selectedServiceId} onSelect={handleServiceSelect} />

        {/* サービス名（カタログ選択時は読み取り専用風、その他は編集可） */}
        <Text style={styles.label}>サービス名 *</Text>
        <TextInput
          style={[styles.input, !isCustomService && styles.inputReadonly]}
          value={name}
          onChangeText={isCustomService ? setName : undefined}
          editable={isCustomService}
          placeholder="サービス名を入力"
          placeholderTextColor="#bbb"
        />

        {/* 月額 */}
        <Text style={styles.label}>月額（円）</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="例: 1590"
          keyboardType="number-pad"
          placeholderTextColor="#bbb"
        />

        {/* ステータス */}
        <Text style={styles.label}>ステータス</Text>
        <View style={styles.segmentRow}>
          {(['trial', 'active'] as StatusOption[]).map((opt) => (
            <Pressable
              key={opt}
              style={[styles.segment, status === opt && styles.segmentActive]}
              onPress={() => setStatus(opt)}
            >
              <Text style={[styles.segmentText, status === opt && styles.segmentTextActive]}>
                {opt === 'trial' ? '無料トライアル' : '通常課金'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* トライアル終了日 */}
        {status === 'trial' && (
          <>
            <Text style={styles.label}>トライアル終了日</Text>
            <DatePickerField value={trialEndDate} onChange={setTrialEndDate} />
          </>
        )}

        {/* 次回請求日 */}
        <Text style={styles.label}>次回請求日</Text>
        <DatePickerField value={nextBillingDate} onChange={setNextBillingDate} />

        {/* 解約情報 */}
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
  segmentRow: { flexDirection: 'row', gap: 8 },
  segment: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  segmentActive: { backgroundColor: '#5C8A6E', borderColor: '#5C8A6E' },
  segmentText: { fontSize: 14, color: '#555', fontWeight: '500' },
  segmentTextActive: { color: '#fff' },
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

- [ ] **Step 2: TypeScript 型チェックを通す**

```bash
cd ~/dev/subscription-guard && npx tsc --noEmit 2>&1 | grep -v '__tests__'
```

Expected: No errors in `app/add.tsx`

- [ ] **Step 3: 全テストを通す**

```bash
cd ~/dev/subscription-guard && npm test
```

Expected: PASS（23テスト以上）

- [ ] **Step 4: コミットする**

```bash
git -C ~/dev/subscription-guard add app/add.tsx
git -C ~/dev/subscription-guard commit -m "feat: redesign add form with service grid and date picker"
```

---

## 完了チェックリスト

- [ ] `npm test` が全テスト PASS する
- [ ] `npx tsc --noEmit` で app/ と src/ にエラーがない
- [ ] iPhone の Expo Go で「＋ 追加」を開き、Netflix グリッドをタップすると名前・金額・解約URLが入る
- [ ] 「1ヶ月後」をタップすると「✓ 6月14日」のような表示が出る
- [ ] 「カスタム」をタップするとインラインカレンダーが表示される
- [ ] 保存後、ホームにカードが正しく表示される
