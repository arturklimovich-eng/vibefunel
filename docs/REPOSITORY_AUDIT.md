# Repository Audit (Stage 0)

Workspace: `C:\Users\ar2rk\Desktop\vibe\vibefunel`. Date: 2026-10-27.
Related: [ARCHITECTURE](./ARCHITECTURE.md) | [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md) | [SECURITY](./SECURITY.md)

## Method

- Eight git repositories were found: coolify, motion, posthog, puck, react-sdk, react-stripe-js, supabase, xyflow.
- Per repo: README, root and main `package.json`, LICENSE files, shallow `src` listing, last commit, `git status --porcelain`.
- No installs, no builds, no network calls, no writes inside the repositories. `git status --porcelain` was empty for all eight.
- Versions are the local `package.json` values. npm "latest" was not checked.
- Nothing from these repositories is copied into the product. Everything is an npm dependency or an external service.
- Evidence format: `path:line`, relative to the audited repo root.

## Summary of decisions

| Repo | Role | Decision |
|---|---|---|
| puck | Per-screen visual editor | USE (npm dep) |
| xyflow | Funnel graph canvas | USE (npm dep) |
| motion | Runtime animation | USE (npm dep) |
| react-stripe-js | Stripe client UI | USE (npm dep, Stage 4) |
| react-sdk (Solidgate) | Solidgate client UI | USE (npm dep, Stage 4, after Stripe) |
| supabase | Postgres, auth, storage, RLS | USE as service (Stage 3); reference for RLS examples |
| posthog | Analytics | USE as service via SDKs (Stage 5); reject embedding |
| coolify | Deployment PaaS | USE as infrastructure (Stage 5); reject as dependency |

## puck

- Identity: `https://github.com/puckeditor/puck.git`. Last commit 2026-10-27, "build: add changelog to the bundle".
- Role: visual page editor. One `Data` object per page; no built-in multi-page notion.
- Package: `@puckeditor/core` 0.23.0 (`packages/core/package.json:2-3`).
- License: MIT (`LICENSE:1`, `packages/core/package.json`). One LICENSE file.
- React peer: `^18.0.0 || ^19.0.0` (`packages/core/package.json:147-148`). `react-dom` is not a peer; the host app provides it. Node `>=20` (`:66-67`).
- Tests/maturity: Jest 29 + ts-jest + jsdom, `__tests__` under `components/*` and `lib/*`; CI in `.github/workflows/ci.yml:32`. 93 KB CHANGELOG, docs site in `apps/docs`. Pre-1.0.
- Pros: TypeScript types shipped, dual ESM/CJS, `Render` has an RSC entry (`bundle/rsc.tsx:1-6`), JSON data shape (`types/Data.tsx:69-75`), custom fields.
- Risks: API churn between 0.x minors; `happy-dom ^20.0.10` listed under `dependencies` (bundle size check needed); editor is client-only (needs a `"use client"` wrapper); CSS import path (`@puckeditor/core/puck.css`, `apps/docs/pages/docs/integrating-puck/styling.mdx:89-92`) to be verified in built output; hosted/pro offerings on the docs site were not checked.
- DECISION: use (npm dep). MIT, React 19 in peer range, active. Pin the exact version and hide it behind our own `ScreenEditor` component.

## xyflow

- Identity: `https://github.com/xyflow/xyflow.git`. Last commit 2026-10-26, merge of PR #6090.
- Role: node/edge graph canvas.
- Package: `@xyflow/react` 12.12.0 (`packages/react/package.json:3`); `@xyflow/system` 0.0.83 is a transitive dependency. Do not install legacy `reactflow` v11.
- License: MIT (`LICENSE:1-3`, `packages/react/package.json`).
- React peer: `react >=17`, `react-dom >=17` (`packages/react/package.json:71`). Developed on React 18 (`:97`). **React 19 is not verified in the repo.** Check: install on React 19 and run the canvas smoke test.
- Tests/maturity: no unit tests in `packages/react`; Playwright e2e in `tests/playwright`, run in CI (`.github/workflows/playwright.yml:23`). Stable v12, changesets, active.
- Pros: controlled `nodes`/`edges` with `onNodesChange`/`onEdgesChange` (`types/component-props.ts:73,86,169`), custom node/edge types (`:288`), TS types shipped.
- Risks: must import `@xyflow/react/dist/style.css` (`README.md:57`); parent needs non-zero height; no `"use client"` in library source, so wrap in a client component; `experimental_*` middleware hooks are unstable and not used.
- DECISION: use (npm dep). MIT, mature. React Flow Pro is a separate paid website product, not needed and not used.

## motion

- Identity: `https://github.com/motiondivision/motion.git`. HEAD `9ba8846`, `v14.7.1`, 2026-10-27.
- Role: runtime screen transitions.
- Package: `motion` 14.7.1 (`packages/motion/package.json:3`), import from `motion/react`. Depends on exact `framer-motion` 14.7.1. Do not mix `motion` and `framer-motion` imports.
- License: MIT in all sub-packages (`LICENSE.md`; framer-motion copyright Framer B.V. 2018). Motion+ paid features (README) are not used.
- React peer: `^18.0.0 || ^19.0.0`, optional (`packages/motion/package.json:102-112`). React 19 dev override exists in repo.
- Tests/maturity: Jest unit and SSR suites, Playwright, CircleCI. 880 changelog headings; 14.7.0 and 14.7.1 released the same day.
- Pros: `AnimatePresence` (`framer-motion/src/index.ts:5`), `useReducedMotion` (`:62`), `LazyMotion` + `m` for smaller bundles, `sideEffects: false`.
- Risks: frequent minors (pin exact version); `"use client"` is in hook files only, so Next.js App Router compatibility was not tested (plan a client boundary); bundle-size units not verified.
- DECISION: use (npm dep). MIT, React 19 explicit, mature.

## react-stripe-js

- Identity: `https://github.com/stripe/react-stripe-js.git`. HEAD `ee4edbc`, `v7.0.1`, 2026-10-26.
- Role: Stripe client UI for payment forms.
- Package: `@stripe/react-stripe-js` 7.0.1 (`package.json:2-3`), peer `@stripe/stripe-js >=10 <11`.
- License: MIT (`LICENSE:1`, `package.json:54`).
- React peer: `>=16.8.0 <20.0.0` (`package.json:139-143`); dev/tests run React 19.1.0.
- Tests/maturity: Jest 29, SSR/client test split (`src/components/EmbeddedCheckout.*.test.tsx`), CI `build.yml`. Maintained by Stripe; no external PRs (`README.md:194`).
- Pros: first-party; server creates the Checkout Session with `ui_mode: 'elements'` and returns `client_secret` (`README.md:50-71`); styling via `appearance`, no CSS.
- Risks: no `"use client"` in `src/` (wrap in a client component; untested here); `Elements` `options` immutable once set (`src/components/Elements.tsx:55-56`); some elements need Stripe beta access; re-export of `PaymentElement` from the `/checkout` subpath not confirmed (`src/checkout/index.ts:1-14`). Client is UI only; amounts come from the server.
- DECISION: use (npm dep, Stage 4). First-party, MIT, React 19 tested.

## react-sdk (Solidgate)

- Identity: `https://github.com/solidgate-tech/react-sdk.git`. Last commit `a9fd70e`, 2026-09-29, "feat(DEV-77647): add processing event". No `.github/` (no CI in clone).
- Role: React wrapper for the Solidgate client SDK (card form, wallets, alternative methods).
- Package: `@solidgate/react-sdk` 1.39.0 (`package.json:2-4`); logic lives in `@solidgate/client-sdk-loader ^1.39.0` (`:12`).
- License: Apache-2.0 (`LICENSE.md:1-8`, `package.json:5`).
- React peer: `^17.0.2 || ^18.0.0 || ^19.0.0` (`package.json:61-64`). Runtime dep `styled-components ^5.3.3`; dev types are `@types/react ^17`.
- Tests/maturity: no library tests; only CRA boilerplate `playground/src/App.test.tsx:6-7`. CHANGELOG per release (1.35 to 1.39 in about three weeks).
- Pros: official; `merchantData = { merchant, signature, paymentIntent }` (README:66-70); callbacks `onSuccess`, `onProcessing`, `onOrderStatus`, `onFail`, `onError`.
- Risks: `signature` and `paymentIntent` must be generated server-side with the merchant secret (algorithm not in repo); client callbacks are not proof of payment; **server-side confirmation (webhook signature, status API) is not documented in this repo and is unverified** (check docs.solidgate.com); uses `window` (`src/boot/index.ts:12`), so client-only loading; styled-components v5 on React 19 is untested; effectively zero wrapper tests.
- DECISION: use (npm dep, Stage 4, after Stripe). Official and Apache-2.0, but gated on a React 19 smoke test and on confirming the server verification path.

## supabase

- Identity: `https://github.com/supabase/supabase.git`. Last commit `051d5f7`, 2026-10-27, "chore(docs) - remove troubleshooting guides and rendering logic (#52339)".
- Role: Postgres, auth, storage, RLS; the repo is the platform monorepo (studio, docs), not a library.
- Packages (consumed from npm, not from this repo): `@supabase/supabase-js` 2.117.3 (`pnpm-workspace.yaml:21`), `@supabase/ssr` 0.12.7 (`:20`), `supabase` CLI `^2.114.0` (`package.json:71`).
- License: root Apache-2.0 (`LICENSE:1`, `package.json:9`); `packages/*` MIT. A marker scan found no AGPL, but this was not a per-file header audit. Self-hosted platform components live in other repos with their own licenses.
- Engines: root `node >=22.13` (`package.json:84-87`). No React peer.
- Tests/maturity: very active, many CI workflows. 47 migrations; RLS in 14 migration files. Per-package test frameworks not verified.
- Pros: SQL migrations (`supabase migration new`, `db push`), local dev via `supabase start`, anon vs `service_role` key model; useful RLS examples.
- Risks: local dev needs Docker; CLI and client move fast (pin); `supabase/config.toml` is this repo's own stack, not our template; key names to be confirmed from `supabase status`.
- DECISION: use as a service (Stage 3). Reference only for RLS examples. Do not vendor the repo.

## posthog

- Identity: `https://github.com/PostHog/posthog.git`. Last commit `dd3c7f0`, 2026-10-27, "fix(batch-exports): export decimal columns to snowflake (#124023)".
- Role: product analytics platform.
- Packages: `posthog-js` and `posthog-node` are **not published from this repo**; they are only consumed (`pnpm-lock.yaml:20813`, `:20824`: 1.438.23 and 5.57.0). Our versions come from npm; the current release was not verified.
- License: MIT outside `ee/` (`LICENSE:7`); `ee/` is the PostHog Enterprise License (`ee/LICENSE`), commercial, production use needs a subscription. No AGPL found (grep in `LICENSE` and `ee/LICENSE`). Sub-folder licenses (`rust/`, `products/desktop`, etc.) were not reviewed in depth.
- Tests/maturity: pytest, Jest; 141 CI workflow files; very active.
- Cloud hosts: US `https://us.i.posthog.com`, EU `https://eu.i.posthog.com` (`posthog/cloud_utils.py:105-107`).
- Risks: `ee/` must never be used; `posthog-js` sets cookie and localStorage, so init must be consent-gated; ad blockers (reverse proxy needs a ToS check); server events need `await client.shutdown()` in serverless. Self-hosting is unsupported for OSS deployments (`README.md:119`).
- DECISION: use as a service via SDKs (Stage 5). Reject embedding or self-hosting the repo.

## coolify

- Identity: `https://github.com/coollabsio/coolify.git`. Last commit `56d0cf0`, 2026-10-27, "fix(servers): validate new cloud servers automatically when they are running".
- Role: self-hosted PaaS (Docker, Traefik, Let's Encrypt). Not a library.
- Version: 4.5.1 stable (`versions.json`); PHP `^8.4`, Laravel `^12.70.1` (`composer.json`; `TECH_STACK.md` saying Laravel 11 is stale).
- License: Apache-2.0 (`LICENSE`, `composer.json`). No sub-folder licenses.
- Integration: build packs `nixpacks`, `static`, `dockerfile`, `dockercompose`, `railpack` (`app/Enums/BuildPackTypes.php:7-11`); `POST /api/v1/deploy` (`routes/api.php:152`); git push webhooks (`routes/webhooks.php`); Traefik `letsencrypt` resolver (`app/Models/Server.php:1030`).
- Requirements: install needs 30 GB total and 20 GB free disk (`scripts/install.sh:431-432`); Docker on every managed server; ports 80/443 and a DNS A record for TLS. Minimum RAM/CPU not found in repo (check coolify.io/docs/installation). Per-app custom domain handling was not verified line by line.
- DECISION: use as infrastructure (Stage 5 deployment target). Reject as a code dependency.

## License table

| Project | License | Usage mode | Commercial restrictions |
|---|---|---|---|
| puck (`@puckeditor/core`) | MIT | npm dependency | None found |
| xyflow (`@xyflow/react`) | MIT | npm dependency | React Flow Pro (paid) not used |
| motion (`motion`) | MIT | npm dependency | Motion+ paid features not used |
| react-stripe-js | MIT | npm dependency | None; Stripe service terms apply to payments |
| react-sdk (Solidgate) | Apache-2.0 | npm dependency | Solidgate merchant agreement applies to payments |
| supabase | Apache-2.0 (packages MIT) | External service, npm clients, CLI | No AGPL markers found; marker scan only |
| posthog | MIT outside `ee/` | External service via SDKs | `ee/` (PostHog Enterprise License) excluded; never used |
| coolify | Apache-2.0 | Infrastructure | None |

No AGPL license was found in any of the eight repositories. Transitive npm licenses are not yet audited; run a license scan of the lockfile in Stage 1 (see [SECURITY](./SECURITY.md), operational section).

## Not integrated / rejected

- Embedding or forking PostHog source; self-hosting PostHog as part of the product.
- Embedding or vendoring Supabase platform source (studio, docs, services).
- Embedding Coolify source or calling its internals; it is infrastructure only.
- One Coolify application (or Git repo, or container) per funnel. Funnels are configuration served by one shared runtime.
- Any code from PostHog `ee/`.
- `reactflow` v11 and `framer-motion` as a direct import (use `@xyflow/react` and `motion/react`).
- `@puckeditor/field-contentful`, `plugin-emotion-cache`, `plugin-heading-analyzer`, `create-puck-app`: not needed.

## Unverified items (checks to run)

| Item | Check |
|---|---|
| xyflow on React 19 | Install on React 19 in Stage 1; run canvas smoke test |
| Puck CSS import path and bundle size (`happy-dom`) | Inspect built output and bundle analysis |
| Puck, motion, Stripe inside Next.js App Router | Client-boundary smoke test in Stage 1 and 4 |
| Solidgate styled-components v5 on React 19 | Smoke test before Stage 4 Solidgate work |
| Solidgate webhook/status verification | Read docs.solidgate.com; not present in `react-sdk` |
| Stripe `PaymentElement` export from `/checkout` | Check installed package types |
| npm latest versions | `pnpm view <pkg> version` at install time |
| Transitive license scan | Run on lockfile |
