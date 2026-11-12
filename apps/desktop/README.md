# easyrender desktop

An Electron shell around the signed-in web app. There is no second UI: the window loads the hosted
app (`https://easyrender.ai/dashboard` by default), so the dashboard, library, connectors and
credits ship once, in `apps/web`, and the design system (`DESIGN.md`) applies unchanged. The shell
adds the native parts: its own window and menu, one running instance, an `easyrender://` link
handler, and an offline screen that retries by itself.

It lives outside the root Bun workspace, like `apps/mobile`, with its own `bun.lock`. Electron
downloads a ~100 MB binary when it installs, and Vercel installs the root workspace on every build.

## Why Electron, not Tauri

- The app is WebGL: `<model-viewer>` and three.js render the GLB, plus AR/Quick Look assets.
  Electron ships one Chromium, so the viewer behaves the same on macOS, Windows and Linux. Tauri
  uses the system webview (WKWebView, WebView2, WebKitGTK), which differs per OS in WebGL and
  video decoding, and we would be debugging three engines.
- Everything is TypeScript on Bun. Tauri needs a Rust toolchain in CI and for contributors.
- Genfeed (`genfeedai/genfeed.ai`, `apps/desktop`) already ships Electron with the same release
  path (electron-builder, notarised macOS build), so there is a worked example to follow.
- The cost is size (~100 MB installed). That is acceptable for a creative tool people install once.

Revisit if the desktop app ever needs a heavy native core. It does not today: rendering runs on
Replicate and the shell only shows it.

## Run it

```bash
cd apps/desktop
bun install
bun run dev        # builds, then opens the window on http://localhost:3000/dashboard
bun run start      # builds, then opens the window on production
```

Start `bun run dev` at the repo root first when you use the local URL. `EASYRENDER_DESKTOP_APP_URL`
overrides the URL (https, or http on localhost only), for example a Vercel preview.

```bash
bun run typecheck
bun run test
bun run pack       # unsigned, unpacked app in release/ to check the packaging config
bun run dist       # installers for the current OS: dmg+zip, nsis, AppImage
```

## What it does

- Security: `contextIsolation`, `sandbox`, no Node in the page. The app origin stays in the window.
  Every other https link (Stripe Checkout, docs, Google) opens in the system browser; file,
  javascript and plain-http URLs are dropped (`src/shared/app-url.ts`).
- `easyrender://open/<path>` opens `/dashboard`, `/library`, `/connectors`, `/credits`, `/account`
  or `/r/<id>` in the running window.
- The page sees `window.easyrenderDesktop` (`{ isDesktop, platform }`) so the web app can adapt, for
  example to leave room for window controls.
- Menu: Go (Cmd/Ctrl+1 to 4), Open in browser, standard edit, view and window items.

## Not done yet

- **Signed, auto-updating releases.** `dist` builds unsigned installers. Shipping needs an Apple
  Developer ID certificate and notarisation key, a Windows signing certificate, a release workflow
  and an update feed (`electron-updater`). See the follow-up issue.
- **Google sign-in.** Google blocks OAuth in embedded browsers, so "Continue with Google" opens in
  the system browser and the desktop session stays signed out. Email sign-in works in the window.
  The fix is a one-time code handed back through `easyrender://`. See the follow-up issue.
- **Window chrome.** The window uses the native title bar. A hidden title bar with the app rail
  under the traffic lights waits for the app shell in `apps/web` and `window.easyrenderDesktop`.
