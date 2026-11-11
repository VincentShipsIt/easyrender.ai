# Analytics and attribution

First-touch attribution is independent of browser analytics consent. `Render` is the existing
preview AND model table; its ID serves as both `preview_id` and `model_id`. `Render` and `User`
receive ten nullable text columns, including an ISO UTC `first_seen_at`. No existing columns,
constraints or indexes change. `prisma db push` does not require `DB_ACCEPT_DATA_LOSS`.

The browser holds only normalized campaign/referrer values in module memory. Internal navigation
preserves them; reloads, new tabs and non-OAuth full navigations reset them. Neither attribution
nor PostHog uses cookies, localStorage or sessionStorage. A preview stores the supplied first
touch; signup copies the earliest owned anonymous preview or uses the form's memory snapshot.
An atomic all-columns-null predicate prevents overwriting an initialized user's first touch.
`first_seen_at` is server receipt time, not a client-controlled timestamp.

Google OAuth uses Better Auth 1.7's `addOAuthServerContext` / `getOAuthState` and database-backed
state. Only normalized data enters its existing `Verification` record, which expires and is
consumed on callback. Its existing signed CSRF cookie carries the opaque state nonce, not UTMs.
No attribution cookie is introduced. Anonymous preview ownership uses the existing ownership
cookie to authorize the handoff; the cookie does not contain attribution or identify analytics
visitors. The mock OAuth integration verifies the actual state, signed ID token and callback.

## Configuration

Set these in Vercel and rebuild; public variables are embedded at build time:

| Variable                        | Value source                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_POSTHOG_KEY`       | PostHog **EU** project settings → project API key (public write-only key, not a personal API key) |
| `NEXT_PUBLIC_POSTHOG_HOST`      | Default `https://eu.i.posthog.com`                                                                |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 property → Data streams → Web → Measurement ID (`G-…`)                                        |
| `POSTHOG_HOST`                  | Optional server-only override for a local capture recorder; leave unset in Vercel                 |
| `ANALYTICS_LOCAL_TEST`          | `1` only for a local `next start`; never set in Vercel                                            |

Missing keys disable the associated vendor, its requests and its reason to show a banner.
Sentry remains configured independently and unchanged.

In PostHog enable **cookieless mode** and **discard IP addresses** in project settings; set the
billing limit to zero if that is the intended account policy. In GA4 choose data retention,
disable Google signals and advertising personalization, and disable enhanced-measurement
history/pageview automation (the app sends sanitized SPA pageviews itself). Do not add Ads tags.
No accounts, remote environments or account settings are changed by this implementation.

The editable policy is `packages/core/src/attribution.ts`: browser PostHog and GA4 start as
`consent` in strict regions and `allow_unless_optout` elsewhere. GPC blocks both in either
region. Server attribution/events are always enabled when configured; pixels are off.
Unknown tools default to consent/off. Change the GA4 policy on its own row.

The privacy endpoint is dynamic, `Cache-Control: private, no-store`, and never varies the HTML
by analytics region. Missing/unreliable country codes are strict. Failure or a two-second
timeout loads no optional vendor, including for a previously accepting visitor.

Only preview or local/test environments honor `?__geo=DE`, `x-test-country: US`, and
`?__privacy_fail=1`. An explicit local flag enables these on a production-mode local server only
when it is not running on Vercel. `VERCEL_ENV=production` overrides every test flag. The browser
forwards test country headers for signup/uploads; the server ignores them in production.
Whether Vercel overwrites a client-supplied **real** `x-vercel-ip-country` header has not been
verified against Vercel. The app follows the documented platform-header contract.

## Events and payment truth

Core transitions emit `preview_start`, `preview_ready` / `preview_failed`, `render_start`,
`render_ready` / `render_failed`, `signup`, and `purchase`. Conditional database transitions
allow only one terminal winner under polling/webhook races. The closed failure code is
`generation_failed`; error messages, photos and prompts never enter analytics properties.
A disabled free-sheet pipeline (`SHEET_ENABLED=false`) has no angle-sheet start/finish events
until an explicit paid sheet generation starts. It still stores attribution on the draft row.

PostHog delivery is best effort, scheduled with Next `after()`. The server SDK loads only when
configured. Requests have a 1.5-second timeout and a 2-second shutdown deadline, with no retry
inside a user request. Attribution remains authoritative if analytics fails; there is no durable
analytics outbox. No delivery guarantee or live weekly reconciliation is implied by local tests.

Events have deterministic UUIDs per event and entity, and allowlisted common/properties only.
Server identifiers are the internal user ID or `pv_<preview-id>`; signup aliases the preview.
Geography on completion/payment events uses the stored creation context, not the webhook
provider's IP/location. No IP address is sent. PostHog browser `before_send` removes non-UTM
query parameters, fragments, page titles and click IDs; its public SDK project token is retained
because ingestion requires it. Browser imports happen after paint, outside the critical path.

A purchase is emitted only on a confirmed signed Stripe webhook, after granting credits and
claiming the pending→paid transition. Replays do not emit another event. Subscription invoices
are also recorded as purchases. Both synchronous and asynchronous checkout success are handled.
There is no refund webhook in this repository, so `purchase_refunded` is not invented.

GA mirrors `sign_up`, `preview_ready`, `render_ready`, `begin_checkout`, and confirmed `purchase`.
The return endpoint scopes purchases to the session owner; a `status=success` query alone cannot
produce a conversion. Subscription returns resolve their Stripe invoice read-only, then require
a paid database record. The browser deduplicates purchase transaction IDs within the page session.
GA receives no application user ID. Existing pricing/accounting is USD; the export and browser
return values use that currency. Multi-currency accounting would require storing currency on
Purchase before enabling multi-currency prices.

## Export (read only)

With an explicitly selected database URL in the environment:

```sh
bun packages/db/scripts/export-attribution.ts /absolute/output/directory team-user-id-1,team-user-id-2
```

The optional third argument marks team IDs as `is_test`; there is no email-based heuristic.
The script runs a repeatable-read, read-only transaction and writes `previews.csv`, `users.csv`,
`purchases.csv`, `renders.csv` with the exact §8 headers. It selects no email, name, photo, auth
credential or IP hash. Pending previews and payments are excluded. A ready preview that later
has a failed model remains a ready preview in the export. Model spends come from the ledger.
There is no refund handler today, so current completed purchases have `refunded=false`.
No export was run against a remote database during implementation.

## Local proof and failure reproduction

Use a throwaway local Postgres with the schema pushed. Never use a Vercel preview database:
previews share production storage and skip schema synchronization.

```sh
bun install --frozen-lockfile
# Set DATABASE_URL and TEST_DATABASE_URL to your local scratch database only.
bun run db:generate
bun run --cwd packages/db db:push
bun run --cwd packages/core test
bun run --cwd apps/web test
```

The core `analytics.integration.test.ts` uses real Postgres and actual core functions. Provider
and storage adapters are mocked. The case named **forced preview and model provider failures**
sets `provider.hasFailure=true`: upload/start fails without spending anything at Replicate.
The test verifies one failure per stage and the model credit refund. This is the supported
local failure mechanism; there is no public paid-provider failure switch. Signed webhook tests
use synthetic Stripe credentials and make no Stripe API calls. Live Stripe here is live-only;
never use a live checkout as a supposedly free test.

For browser proof, fetch the public gtag script once to `/tmp/er-analytics-gtag.js`:

```sh
curl -fsSL 'https://www.googletagmanager.com/gtag/js?id=G-TEST000000' -o /tmp/er-analytics-gtag.js
node apps/web/e2e/mock-server.mjs
```

Build/start on port 3100 with the local DB, an explicitly local test auth secret,
`BETTER_AUTH_URL=http://localhost:3100`, `APP_URL=http://localhost:3100`,
`NEXT_PUBLIC_POSTHOG_KEY=phc_localtest`, `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST000000`,
`POSTHOG_HOST=http://127.0.0.1:3901`, `ANALYTICS_LOCAL_TEST=1`. Then:

```sh
cd apps/web
node node_modules/@playwright/test/cli.js test --config e2e/playwright.config.ts analytics.spec.ts
```

Playwright intercepts **all** vendor requests. The npm PostHog bundle and fetched real gtag run;
only their config/collection endpoints are fulfilled locally. Automation detection is suppressed
only in the test browser, not in production SDK settings. Evidence defaults to the external
`analytics-evidence` directory; set `EVIDENCE_DIR` for the scripts where supported.
Vitest's include list excludes Playwright, and database tests skip without `TEST_DATABASE_URL`.
Turbo's default test environment does not forward the scratch URL: run the per-package commands
above to exercise integration suites, in addition to `bun run test` for the normal CI gate.

Repeat a **separate build** with all three public analytics variables unset, start it, then run:

```sh
ANALYTICS_UNSET=1 node node_modules/@playwright/test/cli.js test --config e2e/playwright.config.ts unset.spec.ts
```

`e2e/performance.mjs` records five fresh-context samples: LCP and sum of long-task time above
50 ms over five seconds (a Playwright blocking-time approximation, not a Lighthouse audit).
Set `PERF_URL` and `PERF_LABEL`; use the same host, viewport and intercepted vendor fixtures.

## Existing cookies and legal gaps

`apps/web/proxy.ts` writes `er_anon` on first visit (HttpOnly, SameSite=Lax, Secure on HTTPS,
one year). `lib/actor.ts` reads it into the actor. Core render access and daily allowance checks
use `anonId`; the signup handoff uses that ownership proof. Without it an anonymous visitor
cannot reliably access or claim an earlier preview, and an anonymous request without another
actor identifier can fail the allowance check. It is never an analytics distinct ID.

This change **does not change that cookie's timing, lifetime or behavior**. Therefore the spec's
no-cookie-before-preview conditions V-09/V-31 are not claimed as passing. Existing language
preference and authentication storage also remain unchanged. `/cookies` is available in all six
locales and linked from every footer, the banner and auth forms. `/privacy` and `/terms` are not
published in this checkout. No legal entity, tax ID, address or privacy policy has been invented;
Jorge's approved legal text and the `er_anon` decision remain separate work.
