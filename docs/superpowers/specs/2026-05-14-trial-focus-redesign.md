# トライアル特化リデザイン 設計書

## 目的

アプリをサブスク管理ツールではなく「無料トライアル番人」に特化させる。不要な機能を削除し、登録→通知→解約の3ステップを最短で完結させる。

## スコープ

- **対象：** `src/types/subscription.ts`・`app/add.tsx`・`app/index.tsx`・`app/[id].tsx`・`src/components/SubscriptionCard.tsx`
- **対象外：** 通知ロジック・ストレージロジック（型変更に伴う最小限の修正のみ）

## データモデル変更

### `src/types/subscription.ts`

```typescript
// 変更前
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled';

// 変更後
export type SubscriptionStatus = 'trial' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  status: SubscriptionStatus;
  trialEndDate: string | null;
  // nextBillingDate: 削除
  cancelUrl: string | null;
  // cancelNotes: 削除
  notifyDaysBefore: number;
  createdAt: string;
  updatedAt: string;
}
```

既存のストレージデータとの後方互換：`loadAll` で読み込んだデータに `nextBillingDate`・`cancelNotes` が残っていても無視される（TypeScript 型で参照しないため）。`status === 'active'` のデータはホーム画面のフィルタで `cancelled` 扱いにする（`status !== 'trial'` で非表示）。

## 画面変更

### 追加フォーム（`app/add.tsx`）

- ステータストグル（無料トライアル／通常課金）を削除
- 次回請求日（`nextBillingDate`）の入力欄を削除
- 保存時は常に `status: 'trial'` で登録
- トライアル終了日の `DatePickerField` は常に表示（`status === 'trial'` 条件分岐を削除）

### ホーム画面（`app/index.tsx`）

- 「通常課金」セクションを削除（`actives` の分離表示をなくす）
- `loadAll` で `status === 'trial'` のみ表示（`cancelled` と旧 `active` は非表示）

### サブスクカード（`src/components/SubscriptionCard.tsx`）

- 残り**3日以内**かつ `cancelUrl` がある場合、カード下部に「解約ページへ →」ボタンを表示
- ボタンタップで `Linking.openURL(cancelUrl)` を呼ぶ
- `cancelUrl` がない、または残り4日以上の場合はボタン非表示

### 詳細画面（`app/[id].tsx`）

- 「解約済みにする」ボタンを削除
- 「解約ページへ」ボタン（グリーン、メイン）を追加：`cancelUrl` がある場合のみ表示、`Linking.openURL` で開く
- 「解約手順メモ」欄（`cancelNotes`）を削除
- 「削除する」ボタンはリスト削除として残す
- 解約URLの編集 `TextInput` は残す（URLを後から入力できる）

## 成功基準

- 追加フォームでステータス選択なしに保存できる
- ホームに「通常課金」セクションが表示されない
- 残り3日以内のカードに「解約ページへ →」ボタンが現れる
- 詳細画面の「解約ページへ」ボタンでブラウザが開く
- 全テストがパスする
