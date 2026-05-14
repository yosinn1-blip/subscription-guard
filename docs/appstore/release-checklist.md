# リリースチェックリスト

## 💳 支払いが必要なもの（1件のみ）

- [ ] **Apple Developer Program 登録** — $99/年
  - https://developer.apple.com/programs/enroll/
  - 登録後、Bundle ID `com.yoshiki.subscriptionguard` を Apple Developer ポータルで作成する

---

## 🔧 コード側（設定変更）

- [ ] `app.json` の Bundle ID を確定する（例: `com.yoshiki.subscriptionguard`）
- [ ] `eas.json` の `appleId` / `ascAppId` / `appleTeamId` を埋める

---

## 📦 ビルド

```bash
# 1. Expo アカウントにログイン（無料）
eas login

# 2. EAS プロジェクトを初期化（app.json に projectId が入る）
eas init

# 3. 本番ビルド（初回は Apple の証明書を自動取得）
eas build --platform ios --profile production
```

---

## 🖼️ スクリーンショット（手動）

App Store には 6.9インチ（iPhone 17 Pro Max）の画像が必要。

```bash
# シミュレーターを起動
open -a Simulator

# アプリをシミュレーターで起動
cd /Users/yoshiki/dev/subscription-guard
npx expo start --ios
```

撮影したい画面を開いて **Device → Screenshot (⌘S)** → `~/Desktop` に保存される。

必要な画面（最低1枚、最大10枚）:
- [ ] ホーム画面（カードあり状態）
- [ ] サービス選択（Step 0）
- [ ] プラン選択（Step 1）
- [ ] トライアル終了日（Step 2）

---

## 🌐 GitHub / GitHub Pages

```bash
# GitHub にリポジトリを作成してプッシュ
gh repo create subscription-guard --private --source=. --push

# GitHub Pages を有効化（リポジトリ設定 → Pages → Source: GitHub Actions）
```

プッシュ後、自動でランディングページがデプロイされる:
- ランディング: `https://yoshiki.github.io/subscription-guard/`
- プライバシーポリシー: `https://yoshiki.github.io/subscription-guard/privacy.html`

---

## 🏪 App Store Connect

1. https://appstoreconnect.apple.com でアプリを新規作成
2. Bundle ID を選択
3. [`docs/appstore/metadata.md`](./metadata.md) の内容をコピペ
4. スクリーンショットをアップロード
5. プライバシーポリシーURL を入力（GitHub Pages の URL）
6. ビルドを選択して審査に提出

---

## 📤 EAS Submit（ビルド完了後）

```bash
eas submit --platform ios --latest
```

---

## ✅ 審査通過後

- [ ] App Store Connect でリリース日を設定 or 即時リリース
- [ ] ランディングページの「App Store でダウンロード」リンクを実際の URL に更新
