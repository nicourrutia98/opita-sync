# Frontend Baseline

This frontend is the first shared `Expo` implementation of the Opita Sync orchestrator workspace.

## Scope

- Expo shared app for `web`, `ios`, and `android`
- chat-first workspace shell
- governed `status_query` flow
- governed `request_create` flow with confirmation
- tool registry admin surfaces
- confirmation and execution audit surfaces
- user and tenant UI settings

## Setup

1. Install dependencies:

```powershell
npm install
```

2. Point the app to the backend:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL = "http://localhost:3000/api"
```

3. Start the app:

```powershell
npm run web
```

## Verification

Typecheck:

```powershell
npm run typecheck
```

Export web bundle:

```powershell
npx expo export --platform web
```

## Notes

- auth bootstrap currently expects a valid Firebase ID token or a backend test token
- the thread is the primary information surface; admin and settings surfaces stay secondary
- visual baseline follows the accepted `Flow Grid v3` direction with restrained teal accents
