# Credits and pricing

- 1 credit = $0.01 (`CREDIT_USD` in `packages/harness/src/pricing.ts`). Credit prices are
  provider cost divided by (1 - margin), margin 70%, rounded up. Change the cost constants, not
  the credit numbers.
- Pay as you go: any number of credits from 500 to 100,000 through one $0.01 Stripe price, bought
  with `quantity = credits`. Pro: $49 a month for 5,000 credits.
- A 3D build is `RENDER_CREDITS`; the angle sheet is `SHEET_CREDITS` and counts toward the 3D
  price. Free previews are limited per day (`FREE_PREVIEWS_PER_DAY`).
- A failed job refunds its credits. Guardrail failures (bad photo, bad sheet, bad GLB) fail and
  refund.
- Stripe is live only. There is no test mode, so a test checkout is a real charge. With
  `STRIPE_SECRET_KEY` empty outside production, `/api/dev/checkout` grants credits locally.
