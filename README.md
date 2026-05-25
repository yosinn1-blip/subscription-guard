# Subscription Guard

Public repository for a subscription-tracking app prototype built with Expo/React Native.

## What is here

- Expo app source under `app/` and supporting project files
- App Store / release notes under `docs/appstore/`
- Local tests and utility scripts

## Development

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Start the Expo app:

```bash
npm run start
```

## Secrets and local files

Do not commit local credentials or build artifacts. In particular, keep these local-only:

- `.env` / `.env.*`
- `credentials.json`
- Apple signing files such as `*.p12`, `*.key`, `*.mobileprovision`, and `*.pem`
- generated native folders and Expo build output
