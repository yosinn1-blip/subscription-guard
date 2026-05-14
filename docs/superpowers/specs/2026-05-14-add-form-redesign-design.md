# 追加フォーム リデザイン 設計書

## 目的

`app/add.tsx` のサブスク追加フォームを全面リデザインする。競合アプリ（Bobby、Subtrack、Payday）の調査から、サービスカタログによる選択UI・プリセット付き日付ピッカーの2点が最大の改善ポイントと判明した。

## スコープ

- **対象：** `app/add.tsx` と新規コンポーネント3ファイル
- **対象外：** `app/[id].tsx`（編集画面）・ホーム画面・通知ロジック

## 画面構成（単一画面・スクロール）

```
┌─────────────────────────────┐
│ サービスを選ぶ               │
│ [🎬 Netflix] [🎵 Spotify] ...│  ← ServiceGrid
│ [📦 Amazon]  [その他→]       │
│─────────────────────────────│
│ サービス名 *                 │
│ [Netflix            ]        │  ← 選択で自動入力、その他で手入力
│─────────────────────────────│
│ 月額（円）                   │
│ [1,590              ]        │  ← カタログ選択時はプリセット値
│─────────────────────────────│
│ ステータス                   │
│ [無料トライアル] [通常課金]  │
│─────────────────────────────│
│ トライアル終了日（trial時のみ）│
│ [1週間後][2週間後][1ヶ月後][カスタム] │  ← DatePickerField
│ ✓ 5月15日                   │
│─────────────────────────────│
│ 次回請求日                   │
│ [1週間後][2週間後][1ヶ月後][カスタム] │
│─────────────────────────────│
│ 解約ページURL                │
│ [https://...        ]        │
│─────────────────────────────│
│      [ 保存する ]            │
└─────────────────────────────┘
```

## 新規ファイル

### `src/data/services.ts`

サービスカタログデータ。拡張可能な配列として定義する。

```typescript
export interface ServiceEntry {
  id: string;
  name: string;
  emoji: string;
  color: string;       // 背景色（hex）
  defaultPrice: number; // 0 = 不明
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
  { id: 'dazn',      name: 'DAZN',            emoji: '⚽', color: '#F8FF00', defaultPrice: 3700, cancelUrl: null },
];
```

### `src/components/ServiceGrid.tsx`

**Props:**
```typescript
interface Props {
  selectedId: string | null;
  onSelect: (service: ServiceEntry | null) => void; // null = 「その他」
}
```

**UI:**
- `SERVICES` を3列グリッドで表示（`FlatList` の `numColumns={3}`）
- 末尾に「その他」セルを追加
- 選択中のセルはボーダーハイライト（`#5C8A6E`、2px）
- 各セル：絵文字（24px）＋ サービス名（11px）を色付き背景の角丸カード上に表示
- 「その他」選択時は `onSelect(null)` を呼ぶ

### `src/components/DatePickerField.tsx`

**Props:**
```typescript
interface Props {
  value: string | null;          // ISO date "YYYY-MM-DD" or null
  onChange: (date: string | null) => void;
  minDate?: Date;                // デフォルト: 今日
}
```

**UI:**
- プリセットボタン4つ横並び：「1週間後」「2週間後」「1ヶ月後」「カスタム」
- 選択済みの場合、ボタン下に「✓ 5月15日」を緑色で表示
- 選択中のプリセットボタンは緑ハイライト（`#5C8A6E`）
- 「カスタム」タップ → `DateTimePickerModal`（`react-native-modal-datetime-picker` を使用）を表示
- 選択済みプリセットを再タップ → null（未選択）に戻す

**日付計算:**
```typescript
function addDays(n: number): string   // 今日 + n日 → "YYYY-MM-DD"
function addMonths(n: number): string // 今日 + nヶ月 → "YYYY-MM-DD"
```

## 変更ファイル

### `app/add.tsx`

- `ServiceGrid` を追加してサービス選択を先頭に配置
- サービス選択時：`name`・`price`・`cancelUrl` を自動セット
- 「その他」選択時：`name` を手動入力（`TextInput` を表示）
- トライアル終了日・次回請求日の `TextInput` を `DatePickerField` に置き換え
- `isValidDate` バリデーションを削除（DatePickerField が文字列を返すため不要）
- 日付が `DatePickerField` から来る場合は常に `YYYY-MM-DD` 形式で確定している

## 追加ライブラリ

```bash
npx expo install react-native-modal-datetime-picker @react-native-community/datetimepicker
```

Expo Go 対応済み（ネイティブビルド不要）。

## 成功基準

- グリッドから Netflix を選ぶと名前・金額・解約URLが自動入力される
- 「1ヶ月後」をタップすると日付が確定し「✓ 6月14日」と表示される
- 「カスタム」からカレンダーで任意の日付を選べる
- 「その他」を選ぶとサービス名の手入力フィールドが表示される
- 保存後、ホームのカードに正しい情報が表示される
