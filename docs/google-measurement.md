# Google measurement: delivery and release checks

The Google tag is the only browser loader. GA4 receives explicit, normalized campaign fields
while URL queries/fragments stay redacted. Advertising consent stays denied. Allowed GA4
sessions retain only normalized first-touch fields in `er_campaign` session storage for up
to 30 minutes; rejection clears it. This does not persist Google click IDs or enable ads
personalization. Real Google Ads click attribution still requires a separate live check.

## What is a conversion?

- `sign_up`: a short-lived, owner-scoped receipt written by the real account-creation hook.
  `/api/analytics/signup` consumes it atomically after analytics is allowed. A login or an
  OAuth query parameter is not a signup. Receipts expire after 24 hours. Claim-before-send
  prefers missing an interrupted delivery over inventing or repeating a registration.
- `preview_ready` / `render_ready`: browser observations of a transition, not an initial
  snapshot of an existing result. These remain secondary diagnostics: browser observation
  can miss background completion and cannot provide globally exactly-once lifecycle counts.
  PostHog server transitions and the database remain authoritative for product usage.
- `begin_checkout`: amount, currency and assigned pricing variant from the server-selected
  checkout, not a USD price guessed by the component. The core URL-only API is preserved.
- `purchase`: an owner-scoped paid Purchase. Browser fallback uses `transaction_id` and the
  stored charged amount/currency. It never treats a success query parameter as payment proof.

## Optional server purchase delivery

All of the following are required in the Vercel **production** environment:

| Variable                    | Value / purpose                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `GA_MEASUREMENT_ID`         | Same G-… ID as the website stream; easyrender uses G-H54Y1NW81X.                   |
| `GA_MEASUREMENT_API_SECRET` | Measurement Protocol secret created for that exact web stream. Server only.        |
| `CRON_SECRET`               | A random secret used by Vercel to authorize scheduled retry requests. Server only. |

Deploy after configuring variables. With no Measurement Protocol secret or outside Vercel
production, server delivery is disabled and browser fallback continues. Do not set
`VERCEL_ENV=production` locally against real destinations.

The browser asks gtag for `client_id` and `session_id` only while GA4 is allowed. A bounded
one-second timeout cannot indefinitely hold up checkout. The checkout route independently
checks regional consent/GPC and the measurement-ID match before storing `GoogleCheckout`.
No Google measurement identifiers are added to Stripe metadata. Context is eligible for a
payment within 72 hours of checkout creation. Automatic subscription renewals are not
assigned the initial checkout's advertising session.

Signed Stripe webhooks connect paid purchases to that context and upsert one
`GooglePurchaseDelivery` per purchase. Both invoice-before-checkout and checkout-before-
invoice ordering converge on the same record. Replay repairs a missed enqueue; credit grants
retain their existing idempotency keys. The two new tables are additive; deployment performs
the normal Prisma sync, never a laptop production schema push.

Delivery runs after the webhook and in `/api/cron/analytics`. Each batch claims at most ten
rows with a one-minute lease, uses a five-second network timeout, and records attempts and
next retry. The bundled cron runs daily at 04:00 UTC, compatible with the daily scheduling
limit; on a plan supporting higher frequency it can be changed after checking limits and
volume. Transport failures keep the row pending. Events older than 72 hours are marked
expired. Successful HTTP transport is **not** proof of valid GA4 ingestion or Ads attribution.
Use GA4's validation endpoint/DebugView and reporting to verify the payload before release.

The return-page fallback suppresses purchases managed by the outbox. Any uncertain transport
retry uses the same `transaction_id`; a backend delivery claim also prevents concurrent
workers from sending the same row normally. This is at-least-once delivery, not a claim of
perfect end-to-end exactly-once processing.

Reject/GPC requests revocation of pending checkout contexts for the current signed-in user.
This cannot undo events already sent. A logged-out browser cannot revoke contexts belonging
to a previous authenticated account through that endpoint; production QA must include the
normal signed-in withdrawal flow. No event is sent for checkouts without eligible consent
and browser identifiers. Do not compare covered GA purchases with all Stripe orders without
accounting for these exclusions.

## Operational release gate

1. Set the three server variables and deploy. Keep campaigns paused.
2. Validate a consented payload against the **matching** GA4 stream without counting a fake
   purchase. A real charge needs separate authorization; local tests use signed mock webhooks.
3. Exercise signup versus existing login, reject/GPC, private URL parameters, stale renders,
   USD/EUR checkout, delayed webhook, duplicate webhook, both subscription webhook orders,
   and a transport failure/retry. Check that local/preview cannot send server events.
4. Verify the imported GA4 purchase action in Google Ads. Only one purchase action should be
   primary; the original unused manual website action should be secondary.
5. Verify a real, authorized purchase end to end and an eligible advertising interaction
   separately. No pageview or synthetic zero-value purchase substitutes for this check.
6. Monitor pending deliveries, `lastError`, attempts and expired/revoked rows. Product analytics
   still needs durable PostHog delivery and immutable render timestamps; this purchase outbox
   does not silently claim to solve those separate tasks.

The PostHog policy is unchanged: cookieless browser analytics and operational server events
remain active independently of GA4 consent. All six locale descriptions explain this.
