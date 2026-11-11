---

version: alpha
name: easyrender.ai
description: >
Design system for easyrender.ai: photos of products turned into 3D models and AR, sold to
e-commerce and real estate teams. Two surfaces share one shadcn token layer. The product
(dashboard, auth, render pages) is a quiet zinc UI that follows the system colour scheme. The
marketing studio (landing, hub) is a dark carbon surface where the only colour is the 3D object
and the XYZ axes inside the viewports.

colors:
# ── Product surface (apps/web/app/globals.css, shadcn zinc) ─────────────────

# Defined in oklch; hex below is the nearest sRGB value, for reference only.

# Light / Dark pairs. Components use the semantic names, never the values.

background: "#FFFFFF / #09090B"
foreground: "#09090B / #FAFAFA"
card: "#FFFFFF / #18181B"
primary: "#18181B / #E4E4E7"
primary-foreground: "#FAFAFA / #18181B"
secondary: "#F4F4F5 / #27272A"
muted: "#F4F4F5 / #27272A"
muted-foreground: "#71717A / #A1A1AA"
accent: "#F4F4F5 / #27272A"
border: "#E4E4E7 / rgb(255 255 255 / 10%)"
input: "#E4E4E7 / rgb(255 255 255 / 15%)"
ring: "#A1A1AA / #71717A"
destructive: "#E7000B / #FF6467"

# ── Marketing studio (apps/web/components/studio/studio.css, scoped to .er-studio) ──

carbon: "#0A0A0B" # page canvas
graphite: "#131315" # card plane
slate: "#1C1C1F" # nested fill, popovers, hover
steel: "#26262A" # active fill
bone: "#ECEBE7" # primary text and primary action
ash: "#909095" # secondary text
smoke: "#606065" # disabled, tertiary
line: "rgb(236 235 231 / 10%)"
line-strong: "rgb(236 235 231 / 22%)"
paper: "#F3F2EE" # the one light plane (product photos, sheet backgrounds)
ink: "#0A0A0B" # text on paper
axis-x: "#F2555A" # XYZ gizmo, red
axis-y: "#8BD450" # XYZ gizmo, green
axis-z: "#4D8DFF" # XYZ gizmo, blue

# ── Mobile (apps/mobile/lib/theme.ts) ────────────────────────────────────

# Same zinc roles as the product surface, as plain hex for React Native, plus success.

success: "#16A34A / #4ADE80"

typography:
product:
fontFamily: "Geist Sans (geist/font/sans), Geist Mono for numbers and ids"
note: Tailwind scale. Body is text-sm, page titles text-2xl, nothing under text-xs.
studio-display:
fontFamily: "Mona Sans (variable, weight 200-900, width 75-125%)"
note: Headlines use the wider cuts. Fluid sizes with clamp().
studio-data:
fontFamily: "Martian Mono (variable)"
note: Sizes, counts, units, credit prices and the labels inside the viewports.

rounded:
product: "--radius 0.625rem; sm = radius - 4px, md = radius - 2px, lg = radius, xl = radius + 4px"
studio: "--radius 0.5rem"

spacing:
control-height: "32 (sm) / 36 (default) / 40 (lg)"
icon: "16px in controls, lucide-react only"
studio-gutter: "clamp(20px, 2.8vw, 40px)"
studio-nav: "3.5rem"
---

## Overview

easyrender sells a result a buyer can judge at a glance: a product photo becomes a 3D model that
spins and opens in AR. The interface stays out of the way of that result.

- The product surface is shadcn (new-york style, zinc base, `lucide` icons). It follows the
  system light or dark scheme and has no theme switcher.
- The studio surface is always dark. Chrome is graphite on carbon, type is bone, and colour comes
  only from the rendered object and the red, green and blue axes of the gizmo.
- Both surfaces read the same shadcn variables (`--background`, `--primary`, ...). The studio
  overrides them while a `.er-studio` page is mounted (`body:has(.er-studio)` in `studio.css`),
  so the shared header, footer and shadcn components follow the studio palette without a second
  component set.

Source of truth: `apps/web/app/globals.css` for the product tokens, `apps/web/components/studio/studio.css`
for the studio tokens, `apps/mobile/lib/theme.ts` for mobile. When a value changes there, change it
here in the same PR.

## Components

shadcn components in `apps/web/components/ui` are the only controls. Add new ones with the shadcn
CLI (`components.json` is configured), then edit.

- **Never raw HTML controls.** `<button>`, `<input>`, `<textarea>`, `<select>`, `<dialog>`,
  `<table>` and `<hr>` fail `bun run check:ui-guards`. The guard keeps an allowlist of the ones
  that predate it; counts only go down, never up.
- Navigation is a link, an action is a `Button`. Never nest a `Button` in a `Button`.
- Primary action is `variant="default"`. One primary action per view.
- Forms: `Label` + `Input` / `Textarea`, errors in `Alert` or under the field in
  `text-destructive`. Dialogs use `Dialog`; tabs use `Tabs`; credit and usage meters use `Progress`.
- Cards use `Card`. Do not nest a card inside a card.
- Icons are `lucide-react`, 16px in controls.
- Studio pages may use the studio classes (`.btn`, `.btn--solid`, `.btn--ghost`, `.prompt`,
  `.spec`, ...) from `studio.css`, scoped under `.er-studio`. Do not use them outside the studio.

## Colour

- Use semantic tokens (`bg-background`, `text-muted-foreground`, `border`), never a hex value or a
  Tailwind palette colour such as `bg-zinc-900`, in product components.
- Do not add `dark:` variants or Tailwind palette colours (`bg-zinc-300`) to product code. The
  tokens already switch with the scheme. `components/agent-demo.tsx` and `components/prompt-bar.tsx`
  predate this rule and should be moved onto tokens when next touched.
- Chrome is greyscale. Colour belongs to the 3D object, the axis gizmo, and `destructive` for
  errors. Do not add brand accents, glows or decorative gradients to chrome.
- Studio: pick a step by its job (carbon canvas, graphite card, slate hover, steel selected). Put
  text on `paper` only with `ink`.
- Colour modifiers use the usual `/5 /10 /20 /40 /50 /60 /70 /80 /90` stops.

## Typography

- Product: Geist Sans, Geist Mono for ids, sizes and credit counts. `text-sm` for body,
  `text-xs` is the floor. No arbitrary sizes such as `text-[11px]` in product code.
- Studio: Mona Sans for text and headlines, Martian Mono for data. Sizes are fluid (`clamp()`),
  set in `studio.css`.
- Numbers that line up (prices, credits, balances) use `tabular-nums`.

## Layout

- Product pages sit in a centred column with the dashboard nav (`dashboard-nav.tsx`) above. Do
  not choose columns from viewport breakpoints when the page column is what constrains the grid.
- Controls snap to 32 / 36 / 40px.
- Every page works at 375px wide. The mobile web and the Expo app are first-class surfaces
  because shoppers and agents capture products on a phone.
- 3D viewers (`model-viewer.tsx`) keep a fixed aspect ratio and never resize the page while a
  model loads.

## Motion

- Motion is short, 150-250ms, and only explains a state change. The studio uses
  `cubic-bezier(0.2, 0.7, 0.2, 1)`.
- Honour `prefers-reduced-motion`: the float animations in `globals.css` already do. New
  animation has to.

## States

Every view that loads data shows loading, empty, success and error. A render in progress shows
its real status from the pipeline (preview, sheet, building) and never a fake percentage. An
error says what failed and whether credits were refunded.

## Money and credits

- Credits are the only unit shown in the product. 1 credit = $0.01 (pay as you go); Pro is 5,000
  credits for $49 a month. Prices come from `@easyrender/harness` pricing, never hard-coded in a
  component.
- Show the cost on the button that spends it ("Build 3D, 64 credits") before the click.

## Internationalisation

All copy lives in `apps/web/messages/en.json` and `es.json` and is read with `next-intl`. A new
string is added to both files in the same PR. Layouts have to survive Spanish, which runs about
20% longer.

## Do's and Don'ts

- **Do** reach for an existing shadcn component first.
- **Do** verify light and dark on product pages, and the studio at 375px and desktop, whenever
  chrome changes. Say which browser checks were not run.
- **Do** keep copy in the message files.
- **Don't** add a raw HTML control, a hex colour, a palette colour or a `dark:` variant to product code.
- **Don't** add a new font, a new accent colour, or a second component library.
- **Don't** hard-code a price or a credit amount in a component.
- **Don't** show a model as done before `get_render` says so.
- **Don't** put studio classes in product pages, or shadcn overrides in `studio.css` beyond the
  variable overrides that already exist.

## UI review checkpoints

For a change to shared components, empty states or motion, check the real task in empty,
loading, success and error states, with keyboard focus, touch, narrow layouts, both colour
schemes and reduced motion. Use a Before/After table with source locations and user impact in
the PR. Browser checks that were not run are marked unverified; reading the source is not visual
approval.
