# 追加フォーム ウィザード化 設計書

## 目的

`app/add.tsx` を SubsBox ライクな3ステップ横スライド形式に刷新する。正規ブランドロゴ（`simple-icons`）・複数プラン対応・ウィザードナビゲーションの3点が主な変更。

## スコープ

- **対象：** `app/add.tsx`・`src/data/services.ts`・新規コンポーネント2ファイル
- **対象外：** ホーム画面・詳細画面・通知ロジック

## ウィザードフロー

```
Step 0: サービスを選ぶ  →  Step 1: プランと金額  →  Step 2: トライアル終了日
```

- 各ステップはフル画面表示
- 「次へ」で右から新ステップがスライドイン（`Animated.Value` + `translateX`）
- 「戻る」で左にスライドアウト
- 上部にステップインジケーター（●●○ など）

## ファイル構成

```
src/data/
  services.ts              # 変更: emoji/defaultPrice を削除、iconSlug + plans[] を追加
src/components/
  ServiceLogo.tsx          # 新規: simple-icons SVG ロゴ表示
  ServiceGrid.tsx          # 変更: emoji → ServiceLogo に置き換え
app/
  add.tsx                  # 変更: 3ステップウィザードに全面更新
```

## データモデル変更

### `src/data/services.ts`

```typescript
export interface ServicePlan {
  name: string;
  price: number;
}

export interface ServiceEntry {
  id: string;
  name: string;
  color: string;           // ブランドカラー（hex）
  iconSlug: string;        // simple-icons のスラッグ（例: 'netflix'）
  plans: ServicePlan[];    // 1件以上（単一プランなら要素1つの配列）
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

## 新規コンポーネント

### `src/components/ServiceLogo.tsx`

`simple-icons` からSVGパスを取得し `react-native-svg` で描画する。

```typescript
interface Props {
  iconSlug: string;  // 'netflix', 'spotify' など
  size?: number;     // デフォルト 32
  color?: string;    // デフォルト '#fff'
}
```

- `simple-icons` の名前規則: `si` + PascalCase（例: `siNetflix`, `siDisneyplus`）
- `Svg` + `Path` コンポーネントで描画
- スラッグが見つからない場合は何も描画しない（フォールバックなし）

## 変更ファイル

### `src/components/ServiceGrid.tsx`

既存コンポーネントの emoji 表示部分を `ServiceLogo` に置き換える。

- `svc.emoji` → `<ServiceLogo iconSlug={svc.iconSlug} size={28} />`
- `svc.defaultPrice` の参照を削除（`plans[0].price` で代替）
- 「その他」セルは引き続き ✏️ テキストを維持

### `app/add.tsx`

**状態:**
```typescript
const [step, setStep] = useState<0 | 1 | 2>(0);
const slideAnim = useRef(new Animated.Value(0)).current;

// Step 0 の選択状態
const [selectedService, setSelectedService] = useState<ServiceEntry | null>(null);
const [isCustom, setIsCustom] = useState(false);

// Step 1 の入力状態
const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
const [customName, setCustomName] = useState('');
const [customPrice, setCustomPrice] = useState('');

// Step 2 の入力状態
const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
const [cancelUrl, setCancelUrl] = useState('');
```

**ナビゲーション:**
```typescript
function goNext() {
  Animated.timing(slideAnim, {
    toValue: -width,
    duration: 250,
    useNativeDriver: true,
  }).start(() => {
    setStep((s) => (s + 1) as 0 | 1 | 2);
    slideAnim.setValue(width);
    Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
  });
}
```

**Step 0: サービス選択**
- `ServiceGrid`（既存）を流用。`ServiceEntry | null` を受け取る。
- ロゴ表示は `ServiceLogo` コンポーネントを使用
- サービス選択 or 「その他」タップで自動的に Step 1 へ

**Step 1: プランと金額**
- 上部に選択サービスのロゴ + 名前
- `plans.length > 1` のとき: プラン一覧をリスト表示（タップで選択、チェックマーク付き）
- `plans.length === 1` のとき: プラン名と金額をそのまま表示（選択不要）
- `isCustom` のとき: サービス名 TextInput + 月額 TextInput
- 「次へ」で Step 2 へ

**Step 2: トライアル終了日**
- 既存の `DatePickerField` を使用
- 解約ページURL の TextInput
- 「保存する」ボタンで `addSubscription` → `scheduleTrialReminder` → `router.back()`

**バリデーション:**
- Step 1 → Step 2: `isCustom` の場合は `customName.trim()` が必須
- Step 2 → 保存: バリデーションなし（終了日は任意）

## 追加ライブラリ

```bash
npx expo install react-native-svg
npm install simple-icons
```

`simple-icons` は純粋なJSパッケージなので Expo Go 対応済み。`react-native-svg` も Expo SDK 54 に含まれている（インストール済みの可能性あり）。

## 成功基準

- Netflix をタップするとロゴが表示され Step 1 にスライド遷移する
- Step 1 でプランを選ぶと金額が反映される
- Step 2 で「1ヶ月後」をタップし「保存する」でホームにカードが追加される
- 「その他」でサービス名と金額を手動入力して保存できる
- 「戻る」で前ステップに戻れる
