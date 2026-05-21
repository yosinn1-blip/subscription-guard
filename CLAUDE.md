# CLAUDE.md - Subscription Guard

AI エージェントへの作業指示書です。作業開始前に必ず読んでください。

## App Store 申請・リリース手順（丸投げ OK）

ユーザーは申請作業を AI に委任します。以下の手順を**すべて完了**してからリリース完了を報告すること。

### ステップ1: ビルド & 申請
```bash
cd ~/dev/subscription-guard
eas build --platform ios --profile production
eas submit --platform ios --latest
```

### ステップ2: 審査通過の確認（メールで確認）
- Gmail MCP で `from:apple subject:review` を検索
- "eligible for distribution" メールが来ていれば審査通過

### ステップ3: 配信状況の設定（★必須・よく忘れる）
審査通過だけでは App Store に並ばない。配信先の設定が別途必要。

1. App Store Connect を開く: https://appstoreconnect.apple.com/apps/6770502246/distribution/pricing
2. 「アプリの配信状況」→「配信状況の設定」をクリック
3. 「すべての国または地域」を選択 → 次へ → 確認
4. 「配信可能を処理中」と表示されれば完了（24時間以内に反映）

**⚠️ この手順を省略すると「App Storeの配信から削除されました」状態になる（2026-05-22 に実際に発生）**

### ステップ4: App Store で確認
https://apps.apple.com/app/subscription-guard/id6770502246

---

## プロジェクト情報

- App ID: 6770502246
- Bundle ID: (eas.json 参照)
- Apple Team ID: VLK9C3VMW6
- ASC Issuer ID: 8db3ef5f-3370-45e7-bb79-af7a512516e6
