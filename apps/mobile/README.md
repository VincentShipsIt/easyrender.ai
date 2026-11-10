# easyrender mobile

Expo (React Native) app for easyrender. Photograph a product, get the free preview, build the 3D model, rotate it in the app and open it in AR. It talks to the same API, accounts and credits as the web app; it adds no backend of its own.

| Tab / screen | What it does | API |
| --- | --- | --- |
| Sign in / sign up | Email and password (Better Auth). The session cookie is kept in the device keychain. | `POST /api/auth/sign-in/email`, `/sign-up/email`, `GET /api/auth/get-session` |
| Library | Your catalog and credit balance, polled while anything is building. | `GET /api/renders` |
| Capture | Camera or photo library, downscaled to under 4 MB, uploaded for the free preview. | `POST /api/renders` |
| Product | Free preview, build 3D (80 credits), angle sheet (50, counts toward the 3D price), 3D viewer, AR, share, public toggle. | `GET /api/renders/:id`, `/render`, `/sheet`, `/model`, `/preview`, `PATCH /api/renders/:id` |
| Account | Credits, link out to buy more, sign out. | |

The 3D viewer is Google's `<model-viewer>` (same version as the web app) in a WebView. The app downloads the GLB with the session cookie and hands it to the viewer, so private models are never exposed by URL. AR opens Android Scene Viewer or the web page on iOS, and needs a public link, so the app asks before making a model public.

## Run it

This app is deliberately **not** a Bun workspace of the monorepo: React Native needs exactly one copy of `react` and `react-native`, and the web app pins a different React patch. It has its own lockfile.

```sh
cd apps/mobile
bun install
cp .env.example .env     # optional: EXPO_PUBLIC_API_URL, defaults to https://easyrender.ai
bunx expo start          # scan the QR code with Expo Go, or press a / i for an emulator
bun run typecheck
```

For local API development set `EXPO_PUBLIC_API_URL` to your machine's LAN address (for example `http://192.168.1.20:3000`).

## Build and ship

`eas.json` has `development`, `preview` and `production` profiles.

```sh
bunx eas-cli login
bunx eas-cli build --platform all --profile preview        # internal test builds
bunx eas-cli build --platform all --profile production
bunx eas-cli submit --platform all
```

Needs: an Expo account (`eas init` links the project), an Apple Developer account (bundle id `ai.easyrender.app`) and a Google Play Console account (package `ai.easyrender.app`).

## Known limits

- Buying credits opens the website. Apple and Google require their own billing for digital goods bought inside an app, so check the store policies before shipping paid credits in the app.
- iOS AR goes through the web page in Safari (Quick Look); Android uses Scene Viewer directly.
- The shared types in `lib/api.ts` mirror `RenderView` from `@easyrender/core` by hand.
