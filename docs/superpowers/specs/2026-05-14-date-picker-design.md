# 日付入力改善（DatePickerField）設計書

## 目的

`app/add.tsx` の日付テキスト入力（YYYY-MM-DD 手打ち）を、プリセットボタン＋ネイティブピッカーに置き換えて、トライアル終了日の入力を1タップで完結させる。

## スコープ

- **対象：** `app/add.tsx` の「トライアル終了日」と「次回請求日」
- **対象外：** `app/[id].tsx`（編集画面）は今回スコープ外

## 新コンポーネント

### `src/components/DatePickerField.tsx`

**Props:**
```typescript
interface Props {
  value: string | null;           // ISO date "YYYY-MM-DD" or null
  onChange: (date: string | null) => void;
  placeholder?: string;
}
```

**UI構成:**

```
[ 1週間後 ] [ 2週間後 ] [ 1ヶ月後 ] [ その他 ]

選択済み: ✓ 5月15日（グリーン表示）
未選択:   （なし）
```

- プリセットボタン4つを横並び（`flexDirection: 'row'`）
- タップで即日付確定、再タップで解除（null に戻る）
- 「その他」タップ → `@react-native-community/datetimepicker` の iOS ネイティブホイールピッカーをモーダルで表示
- 選択済み日付は `formatDate()` で「5月15日」形式に表示

**プリセット計算:**
```
1週間後  = today + 7日
2週間後  = today + 14日
1ヶ月後  = today + 1ヶ月（Date の setMonth を使用）
```

## 変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/components/DatePickerField.tsx` | 新規作成 |
| `app/add.tsx` | trialEndDate / nextBillingDate の TextInput を DatePickerField に置き換え |

## 追加ライブラリ

```bash
npx expo install @react-native-community/datetimepicker
```

Expo Go 対応済み（ネイティブビルド不要）。

## データ形式

コンポーネント内部では `Date` オブジェクトを使い、親への通知と保存は既存通り ISO 文字列 `"YYYY-MM-DD"` で行う。既存の storage・notification ロジックは変更なし。

## 成功基準

- 「1ヶ月後」をタップして「保存する」を押すと、正しい日付でサブスクが登録される
- 「その他」から任意の日付を選択できる
- 未選択の状態に戻せる（プリセットを再タップ）
