# Wizard Add Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `app/add.tsx` as a 3-step horizontal wizard with real brand logos (simple-icons) and per-service price plans.

**Architecture:** Services data gains `iconSlug` + `plans[]` replacing `emoji`/`defaultPrice`. A new `ServiceLogo` component renders SVG icons. `add.tsx` becomes a full-screen 3-step wizard using `Animated.Value` for slide transitions. `ServiceGrid` is updated to use `ServiceLogo`.

**Tech Stack:** React Native Animated API, `react-native-svg`, `simple-icons`, TypeScript, Expo SDK 54

---

## File Map

| File | Change |
|------|--------|
| `src/data/services.ts` | Remove `emoji`/`defaultPrice`, add `iconSlug`/`plans[]` |
| `__tests__/data/services.test.ts` | Update tests to match new shape |
| `src/components/ServiceLogo.tsx` | **New**: SVG brand logo via simple-icons |
| `src/components/ServiceGrid.tsx` | Replace emoji → `ServiceLogo`, `defaultPrice` → `plans[0].price` |
| `app/add.tsx` | Full rewrite: 3-step wizard with Animated slide |

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json` (via install commands)

- [ ] **Step 1: Install react-native-svg**

```bash
cd /Users/yoshiki/dev/subscription-guard
npx expo install react-native-svg
```

Expected: package.json gains `"react-native-svg": "15.x.x"` (Expo SDK 54 compatible version)

- [ ] **Step 2: Install simple-icons**

```bash
npm install simple-icons
```

Expected: package.json gains `"simple-icons": "x.x.x"`

- [ ] **Step 3: Verify install**

```bash
node -e "const si = require('simple-icons'); console.log(si.siNetflix.title)"
```

Expected output: `Netflix`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add react-native-svg and simple-icons for wizard logo support"
```

---

### Task 2: Update `src/data/services.ts` + fix tests

**Files:**
- Modify: `src/data/services.ts`
- Modify: `__tests__/data/services.test.ts`

- [ ] **Step 1: Update the test file first (TDD — write failing tests)**

Replace `__tests__/data/services.test.ts` with:

```typescript
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/yoshiki/dev/subscription-guard
npx jest __tests__/data/services.test.ts --no-coverage
```

Expected: FAIL (properties `iconSlug`, `plans` don't exist yet)

- [ ] **Step 3: Rewrite `src/data/services.ts`**

```typescript
export interface ServicePlan {
  name: string;
  price: number;
}

export interface ServiceEntry {
  id: string;
  name: string;
  color: string;
  iconSlug: string;
  plans: ServicePlan[];
  cancelUrl: string | null;
}

export const SERVICES: ServiceEntry[] = [
  {
    id: 'netflix', name: 'Netflix', color: '#E50914', iconSlug: 'netflix',
    plans: [
      { name: '広告つきスタンダード', price: 790 },
      { name: 'スタンダード',         price: 1590 },
      { name: 'プレミアム',           price: 1980 },
    ],
    cancelUrl: 'https://www.netflix.com/cancelplan',
  },
  {
    id: 'spotify', name: 'Spotify', color: '#1DB954', iconSlug: 'spotify',
    plans: [
      { name: '個人',       price: 980 },
      { name: 'Duo',        price: 1280 },
      { name: 'ファミリー', price: 1580 },
    ],
    cancelUrl: 'https://www.spotify.com/jp/account/subscription/cancel/',
  },
  {
    id: 'disney', name: 'Disney+', color: '#113CCF', iconSlug: 'disneyplus',
    plans: [{ name: '月額', price: 990 }],
    cancelUrl: 'https://www.disneyplus.com/ja-jp/account',
  },
  {
    id: 'amazon', name: 'Amazon Prime', color: '#FF9900', iconSlug: 'amazonprime',
    plans: [
      { name: '月額', price: 600 },
      { name: '年間（月換算）', price: 492 },
    ],
    cancelUrl: 'https://www.amazon.co.jp/mc/pipelines/cancellation',
  },
  {
    id: 'youtube', name: 'YouTube Premium', color: '#FF0000', iconSlug: 'youtube',
    plans: [
      { name: '個人',       price: 1280 },
      { name: 'ファミリー', price: 2280 },
    ],
    cancelUrl: 'https://www.youtube.com/paid_memberships',
  },
  {
    id: 'apple', name: 'Apple One', color: '#000000', iconSlug: 'apple',
    plans: [
      { name: '個人',       price: 1200 },
      { name: 'ファミリー', price: 1980 },
    ],
    cancelUrl: null,
  },
  {
    id: 'hulu', name: 'Hulu', color: '#3DBB3D', iconSlug: 'hulu',
    plans: [{ name: '月額', price: 1026 }],
    cancelUrl: 'https://help.hulu.com',
  },
  {
    id: 'linemusic', name: 'LINE MUSIC', color: '#06C755', iconSlug: 'line',
    plans: [
      { name: '個人',       price: 980 },
      { name: 'ファミリー', price: 1480 },
    ],
    cancelUrl: null,
  },
  {
    id: 'dazn', name: 'DAZN', color: '#000000', iconSlug: 'dazn',
    plans: [{ name: '月額', price: 3700 }],
    cancelUrl: null,
  },
];
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/data/services.test.ts --no-coverage
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/services.ts __tests__/data/services.test.ts
git commit -m "feat: update ServiceEntry to iconSlug + plans[] schema"
```

---

### Task 3: Create `src/components/ServiceLogo.tsx`

**Files:**
- Create: `src/components/ServiceLogo.tsx`

- [ ] **Step 1: Verify simple-icons naming convention**

```bash
node -e "
const si = require('simple-icons');
['netflix','spotify','disneyplus','amazonprime','youtube','apple','hulu','line','dazn'].forEach(slug => {
  const key = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
  const icon = si[key];
  console.log(slug, '->', key, '->', icon ? icon.title : 'NOT FOUND');
});
"
```

Expected: each slug resolves to a valid icon (note: some may differ — fix iconSlug values in services.ts if needed).

- [ ] **Step 2: Fix any unresolved slugs found in Step 1**

If a slug is `NOT FOUND`, find the correct key name:

```bash
node -e "
const si = require('simple-icons');
const keys = Object.keys(si).filter(k => k.startsWith('siAmazon'));
console.log(keys);
"
```

Update `src/data/services.ts` `iconSlug` values to match the correct simple-icons key (lowercase after `si` prefix, e.g. `siDisneyplus` → slug `disneyplus`, `siAmazonprime` → slug `amazonprime`).

- [ ] **Step 3: Create `src/components/ServiceLogo.tsx`**

```typescript
import { Svg, Path } from 'react-native-svg';
import * as si from 'simple-icons';

interface Props {
  iconSlug: string;
  size?: number;
  color?: string;
}

export default function ServiceLogo({ iconSlug, size = 32, color = '#fff' }: Props) {
  const key = ('si' + iconSlug.charAt(0).toUpperCase() + iconSlug.slice(1)) as keyof typeof si;
  const icon = si[key] as { path: string } | undefined;

  if (!icon) return null;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d={icon.path} />
    </Svg>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (or only pre-existing unrelated errors)

- [ ] **Step 5: Commit**

```bash
git add src/components/ServiceLogo.tsx
git commit -m "feat: add ServiceLogo component using simple-icons SVG"
```

---

### Task 4: Update `src/components/ServiceGrid.tsx`

**Files:**
- Modify: `src/components/ServiceGrid.tsx`

- [ ] **Step 1: Rewrite ServiceGrid.tsx**

Replace the entire file:

```typescript
import { View, Text, Pressable, FlatList, StyleSheet, Dimensions } from 'react-native';
import { SERVICES, ServiceEntry } from '../data/services';
import ServiceLogo from './ServiceLogo';

interface Props {
  selectedId: string | null;
  onSelect: (service: ServiceEntry | null) => void;
}

const COLS = 3;
const CELL_SIZE = (Dimensions.get('window').width - 32 - 12) / COLS;

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
          <Text style={styles.otherIcon}>✏️</Text>
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
          <ServiceLogo iconSlug={svc.iconSlug} size={28} color="#fff" />
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
  otherIcon: { fontSize: 22, marginBottom: 4 },
  name: { fontSize: 10, color: '#444', fontWeight: '500', textAlign: 'center' },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ServiceGrid.tsx
git commit -m "feat: replace emoji with ServiceLogo in ServiceGrid"
```

---

### Task 5: Rewrite `app/add.tsx` as 3-step wizard

**Files:**
- Modify: `app/add.tsx`

- [ ] **Step 1: Rewrite app/add.tsx**

Replace the entire file:

```typescript
import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { addSubscription } from '../src/storage/subscriptions';
import { scheduleTrialReminder } from '../src/notifications/scheduler';
import { ServiceEntry, ServicePlan } from '../src/data/services';
import ServiceGrid from '../src/components/ServiceGrid';
import ServiceLogo from '../src/components/ServiceLogo';
import DatePickerField from '../src/components/DatePickerField';

const { width } = Dimensions.get('window');

export default function AddScreen() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 0
  const [selectedService, setSelectedService] = useState<ServiceEntry | null>(null);
  const [isCustom, setIsCustom] = useState(false);

  // Step 1
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  // Step 2
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [cancelUrl, setCancelUrl] = useState('');

  function goNext() {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setStep((s) => (s + 1) as 0 | 1 | 2);
      slideAnim.setValue(width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }

  function goBack() {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setStep((s) => (s - 1) as 0 | 1 | 2);
      slideAnim.setValue(-width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }

  function handleServiceSelect(service: ServiceEntry | null) {
    if (service === null) {
      setIsCustom(true);
      setSelectedService(null);
      setSelectedPlan(null);
      setCancelUrl('');
    } else {
      setIsCustom(false);
      setSelectedService(service);
      setSelectedPlan(service.plans.length === 1 ? service.plans[0] : null);
      setCancelUrl(service.cancelUrl ?? '');
    }
    goNext();
  }

  function handleStep1Next() {
    if (isCustom && !customName.trim()) {
      Alert.alert('エラー', 'サービス名を入力してください');
      return;
    }
    if (!isCustom && !selectedPlan && selectedService && selectedService.plans.length > 1) {
      Alert.alert('エラー', 'プランを選択してください');
      return;
    }
    goNext();
  }

  async function handleSave() {
    const name = isCustom ? customName.trim() : (selectedService?.name ?? '');
    const price = isCustom
      ? parseInt(customPrice, 10) || 0
      : (selectedPlan?.price ?? selectedService?.plans[0]?.price ?? 0);

    const sub = await addSubscription({
      name,
      price,
      status: 'trial',
      trialEndDate,
      cancelUrl: cancelUrl || null,
      notifyDaysBefore: 1,
    });

    if (sub.trialEndDate) {
      await scheduleTrialReminder(sub);
    }

    router.back();
  }

  const stepContent = [
    // Step 0: Service selection
    <ScrollView key="step0" contentContainerStyle={styles.stepScroll}>
      <Text style={styles.stepTitle}>サービスを選ぶ</Text>
      <ServiceGrid selectedId={null} onSelect={handleServiceSelect} />
    </ScrollView>,

    // Step 1: Plan & price
    <ScrollView key="step1" contentContainerStyle={styles.stepScroll}>
      {selectedService && (
        <View style={styles.serviceHeader}>
          <View style={[styles.serviceHeaderLogo, { backgroundColor: selectedService.color }]}>
            <ServiceLogo iconSlug={selectedService.iconSlug} size={28} color="#fff" />
          </View>
          <Text style={styles.serviceHeaderName}>{selectedService.name}</Text>
        </View>
      )}
      {isCustom ? (
        <>
          <Text style={styles.label}>サービス名 *</Text>
          <TextInput
            style={styles.input}
            value={customName}
            onChangeText={setCustomName}
            placeholder="例: Netflix"
            placeholderTextColor="#bbb"
          />
          <Text style={styles.label}>月額（円）</Text>
          <TextInput
            style={styles.input}
            value={customPrice}
            onChangeText={setCustomPrice}
            placeholder="例: 1590"
            keyboardType="number-pad"
            placeholderTextColor="#bbb"
          />
        </>
      ) : selectedService && selectedService.plans.length > 1 ? (
        <>
          <Text style={styles.label}>プランを選ぶ</Text>
          {selectedService.plans.map((plan) => (
            <Pressable
              key={plan.name}
              style={[styles.planRow, selectedPlan?.name === plan.name && styles.planRowActive]}
              onPress={() => setSelectedPlan(plan)}
            >
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>¥{plan.price.toLocaleString()}/月</Text>
              {selectedPlan?.name === plan.name && <Text style={styles.planCheck}>✓</Text>}
            </Pressable>
          ))}
        </>
      ) : selectedService ? (
        <View style={styles.singlePlanBox}>
          <Text style={styles.singlePlanName}>{selectedService.plans[0].name}</Text>
          <Text style={styles.singlePlanPrice}>¥{selectedService.plans[0].price.toLocaleString()}/月</Text>
        </View>
      ) : null}
      <View style={styles.navRow}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>戻る</Text>
        </Pressable>
        <Pressable style={styles.nextButton} onPress={handleStep1Next}>
          <Text style={styles.nextButtonText}>次へ</Text>
        </Pressable>
      </View>
    </ScrollView>,

    // Step 2: Trial end date
    <ScrollView key="step2" contentContainerStyle={styles.stepScroll}>
      <Text style={styles.stepTitle}>トライアル終了日</Text>
      <DatePickerField value={trialEndDate} onChange={setTrialEndDate} />
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
      <View style={styles.navRow}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>戻る</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存する</Text>
        </Pressable>
      </View>
    </ScrollView>,
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Step indicator */}
      <View style={styles.indicator}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      {/* Animated slide container */}
      <Animated.View style={[styles.slide, { transform: [{ translateX: slideAnim }] }]}>
        {stepContent[step]}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F0' },
  indicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
  dotActive: { backgroundColor: '#5C8A6E' },
  slide: { flex: 1 },
  stepScroll: { padding: 16, paddingBottom: 40 },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  serviceHeaderLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceHeaderName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
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
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planRowActive: { borderColor: '#5C8A6E' },
  planName: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  planPrice: { fontSize: 15, color: '#555', marginRight: 8 },
  planCheck: { fontSize: 16, color: '#5C8A6E', fontWeight: '700' },
  singlePlanBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  singlePlanName: { fontSize: 15, color: '#1a1a1a' },
  singlePlanPrice: { fontSize: 15, fontWeight: '600', color: '#5C8A6E' },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  backButtonText: { color: '#555', fontSize: 16, fontWeight: '600' },
  nextButton: {
    flex: 2,
    backgroundColor: '#5C8A6E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  saveButton: {
    flex: 2,
    backgroundColor: '#5C8A6E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors

- [ ] **Step 3: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: all existing tests pass

- [ ] **Step 4: Commit**

```bash
git add app/add.tsx
git commit -m "feat: rewrite add.tsx as 3-step horizontal wizard"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Covered |
|---|---|
| 3-step wizard: Service → Plan/Price → Date | ✅ Task 5 (steps 0/1/2) |
| Animated.Value + translateX slide | ✅ `goNext` / `goBack` in Task 5 |
| Step indicator (dots) | ✅ `indicator` + `dot`/`dotActive` styles |
| `ServiceLogo` new component | ✅ Task 3 |
| `simple-icons` siXxx lookup | ✅ Task 3 Step 1 verifies slugs |
| `ServiceGrid` → ServiceLogo | ✅ Task 4 |
| `services.ts` schema: `iconSlug` + `plans[]` | ✅ Task 2 |
| Plans list with checkmark (>1 plan) | ✅ Step 1 of wizard |
| Single plan display (=1 plan) | ✅ `singlePlanBox` |
| Custom service: name + price TextInput | ✅ `isCustom` branch |
| Step 1 validation: customName required | ✅ `handleStep1Next` |
| Step 2: DatePickerField | ✅ Task 5 |
| Step 2: cancelUrl TextInput | ✅ Task 5 |
| Service tap → auto-advance to Step 1 | ✅ `handleServiceSelect` calls `goNext()` |
| 「その他」→ custom mode | ✅ `handleServiceSelect(null)` sets `isCustom=true` |
| Existing test suite updated | ✅ Task 2 |

### Type consistency check

- `ServicePlan` exported from `services.ts` and imported in `add.tsx` ✅
- `ServiceEntry.iconSlug` used consistently in `ServiceLogo` + `ServiceGrid` + `add.tsx` ✅
- `selectedPlan: ServicePlan | null` — correctly typed ✅
