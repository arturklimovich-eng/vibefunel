# Architecture

Related: [REPOSITORY_AUDIT](./REPOSITORY_AUDIT.md) | [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md) | [SECURITY](./SECURITY.md)

## Goals and non-goals

Goals:
- Visual builder for quiz / web-to-app / sales funnels: graph canvas of screens, per-screen visual editing, conditional transitions.
- Mobile-first runtime that serves one immutable published version per funnel.
- Draft, preview, publish, rollback.
- Server-side payments (Stripe, then Solidgate), typed analytics events, deployment of the platform itself on Coolify.
- Modular: each concern behind an interface so storage, payment provider and analytics can change independently.

Non-goals:
- Not a clone of FunnelFox or any other product.
- No arbitrary user JavaScript, no expression language in funnel JSON.
- No container, Git repo or Coolify app per funnel; funnels are data served by one runtime.
- Custom domains serve only verified hostnames of published funnels (see below); TLS is the proxy's job.
- No embedding of PostHog, Supabase or Coolify source.

## Stack

| Choice | Justification (audit) |
|---|---|
| TypeScript strict | All chosen libraries ship types (puck, xyflow, motion, stripe) |
| React 19 | Within peer ranges of puck, motion, react-stripe-js, Solidgate; xyflow (`>=17`) untested on 19 |
| Next.js, App Router | One app hosts editor, runtime and API route handlers; Puck `Render` has an RSC entry; all editors need `"use client"` wrappers |
| pnpm workspaces | pnpm 10.24.0 present on the build machine; no yarn |
| No Turborepo/Nx | CLAUDE.md asks for minimal structure; one app plus one package does not need a task orchestrator |
| zod | Validation at save, publish and render; shared types |
| vitest | Unit tests for schema, evaluator, repository |

Single app for the MVP (`apps/web`). Extraction points are planned but not created until a second consumer exists: `funnel-renderer`, `funnel-components`, `payment-providers`, `analytics`. Only `packages/funnel-schema` exists in Stage 1.

## Repository layout

```
funnel-platform/
  apps/web/                 Next.js app: /studio, /f/[slug], /preview/[funnelId], /api
  packages/funnel-schema/   zod schemas, types, validateFunnel, migrate, nextScreen
  supabase/                 config.toml and migrations (tables, RLS, functions)
  docs/                     this documentation
  .data/                    dev-only JSON storage (gitignored)
  pnpm-workspace.yaml
```

## Module boundaries

| Module | Responsibility | Depends on |
|---|---|---|
| Studio editor | `/studio/**`. `@xyflow/react` canvas for the graph; Puck editor (behind our `ScreenEditor`) for one screen | funnel-schema, route handlers |
| funnel-schema | zod schemas and types; `validateFunnel()`; `migrate(json)` by `schemaVersion`; `nextScreen(definition, currentScreenId, answers)` | zod only |
| FunnelRepository | Server-only studio storage interface: `listFunnels`, `getFunnel`, `getDraft`, `saveDraft(id, definition, expectedRevision)`, `publish(id, expectedRevision)`, `rollback`, `listVersions`, `createFunnel`, `deleteFunnel`. `PublishedReader.getPublishedBySlug` is the separate public read path. `FileFunnelRepository` (dev fallback, `.data/`) implements both; `SupabaseFunnelRepository` (request-scoped user client) and `SupabasePublishedReader` (anon client, RPC) are the Supabase side | funnel-schema |
| Runtime | `/f/[slug]` renders a published version; `/preview/[funnelId]` renders the draft (studio only). Client state `{ currentScreenId, answers }`; Puck `Render` per screen; `motion` transitions | funnel-schema, repository (server) |
| Payments | Server `PaymentProvider` interface; `StripeProvider` first, `SolidgateProvider` second; webhooks in `/api` | server env secrets |
| Analytics | Typed event union; PostHog SDKs (`posthog-js` browser, `posthog-node` server) | consent state |
| Deployment | Docker image deployed by Coolify (Dockerfile build pack) | none at runtime |

The UI never touches storage directly; it calls route handlers, which call the repository. This keeps the Stage 1 to Stage 3 swap to Supabase invisible to the UI.

## Data model

```ts
Funnel {
  id; projectId; slug;
  status: 'draft' | 'published';
  draftVersionId; publishedVersionId;
  draftRevision: number;   // optimistic concurrency counter, starts at 1
}

FunnelVersion {            // immutable once created
  id; funnelId; version: number; schemaVersion: number; createdAt;
  definition: FunnelDefinition;
}

FunnelDefinition {
  schemaVersion; startScreenId;
  screens: Screen[]; edges: Edge[];
  theme; allowCycles?: boolean;
}

Screen {
  id;
  type: 'welcome' | 'quiz_single' | 'quiz_multi' | 'content' | 'email_capture'
      | 'paywall' | 'checkout' | 'upsell' | 'success';
  title;
  content: PuckData;       // stored as-is
  animation: { preset: 'none' | 'fade' | 'slide_up' | 'slide_left'; durationMs?: number };
  position: { x: number; y: number };   // canvas only
}

Edge { id; sourceScreenId; targetScreenId; condition: Condition }

Condition =
  | { kind: 'always' }
  | { kind: 'answer_equals';   screenId; optionId }
  | { kind: 'answer_includes'; screenId; optionId }
  | { kind: 'default' }
  | { kind: 'payment_succeeded'; screenId }
```

Evaluation: for the current screen, take the first matching outgoing edge in order. `default` is the fallback. `payment_succeeded` matches only when the runtime payment state for that screen is `succeeded`, which is set only from a server-confirmed status; checkout and upsell screens may leave only through `payment_succeeded` edges (purchase) or at most one `default` edge (explicit decline, reachable only by a Button with action `skip`; the plain next action never takes it); `always` and `answer_*` edges there are `payment_bypass` errors. At evaluation time `nextScreen` ignores every non-`payment_succeeded` edge on checkout and upsell (even in a legacy or published definition) and checks `payments[sourceScreenId]`; `condition.screenId` must equal the source (`condition_screen_mismatch`).

Button action `skip` means "take the first `default` edge only" (`fallbackOnly`). It is allowed only on paywall, checkout and upsell screens (validation error `skip_not_allowed` elsewhere, warning `skip_without_default` when no `default` edge exists) and on any other screen the runtime treats it exactly like `next`. A `default` edge from checkout/upsell to a success screen raises the warning `decline_to_success`. No match is a dead end; validation reports dead ends, unreachable screens and cycles as warnings at save time and rejects them at publish time. A checkout or upsell screen without a `payment_succeeded` edge is a dead end for a paying visitor and is reported the same way.

Why no expressions: the Condition is a closed tagged union of five kinds, each compared against stored answers or payment status by id. There is no parser, no `eval`, no string interpreted as code, so a funnel JSON from a malicious tenant cannot execute anything. Adding a kind requires a schema change, a migration and a code change.

Puck content: our own component config (Heading, Paragraph, Image, Button with action `next` | `url`, OptionList with option ids and single/multi mode). Puck `Data` is validated loosely (zod passthrough on `content`, strict on our fields).

Graph validation (`validateFunnel`): start screen exists; edge targets exist; unreachable screens; dead ends; cycles flagged unless `allowCycles: true`. Validation runs at save and again at publish.

## Data flow

(a) Edit to runtime

```mermaid
flowchart LR
  A[Studio: edit graph / Puck] --> B[POST draft route handler]
  B --> C[zod + validateFunnel]
  C -->|errors| A
  C -->|ok| D[repository.saveDraft]
  D --> E[Publish request]
  E --> F[re-validate]
  F --> G[repository.publish: create immutable FunnelVersion, move publishedVersionId]
  G --> H[/f/slug: getPublishedBySlug, zod validate, render]
  D --> I[/preview/funnelId: render draft]
```

(b) Payment (Stage 4, phase A implemented; live Stripe flow not yet verified)

```mermaid
sequenceDiagram
  participant C as Browser (runtime)
  participant S as Next.js server
  participant P as Stripe
  participant D as PaymentStore
  C->>S: GET /api/payments/status (runId, screenId)
  S-->>C: pending (nothing recorded yet)
  C->>S: POST /api/payments/checkout { slug, screenId, runId, planKey }
  S->>S: published funnel by slug, screen is checkout/upsell and bound to planKey, plan from PAYMENT_PLANS_JSON
  S->>P: create Checkout Session (embedded_page, metadata, return_url)
  P-->>S: client_secret
  S-->>C: { mode: embedded, clientSecret }
  C->>P: pay in Embedded Checkout (Stripe iframe)
  P->>S: POST /api/payments/stripe/webhook (raw body, signature)
  S->>S: constructEvent; amount, currency, plan, funnel-in-project checks
  S->>D: record_payment_event (event id unique, upsert payment)
  P-->>C: redirect to /f/slug?run=...&screen=...
  C->>C: restore run state from sessionStorage
  loop every 2 s, max 60 s
    C->>S: GET /api/payments/status
  end
  S-->>C: succeeded
  C->>C: payments[screen] = succeeded, follow payment_succeeded edge
```

Server layer (`apps/web/src/server/payments`): `PaymentProvider` (`types.ts`), `plans.ts` (catalogue), `StripeProvider`, `MockProvider` (dev only), `SolidgateProvider` (stub), `registry.ts` (provider by `PAYMENT_PROVIDER`, mock when `PAYMENTS_MOCK=true` outside production), `PaymentStore` with `FilePaymentStore` (`.data/payments.json`) and `SupabasePaymentStore` (RPC `record_payment_event` and a direct `status, reason` read, both through a memoised service client; the status endpoint maps a paid-but-rejected row to the public `needs_review` state), `webhook.ts` (verify, record, server-side `payment_succeeded` / `payment_failed` through the PostHog server emitter), `rate-limit.ts`. Client: the Puck `CheckoutBlock` renders `CheckoutPanel`, which checks status first (so a paid run is never charged twice), creates the session, renders `EmbeddedCheckoutProvider` and `EmbeddedCheckout`, and polls after the return redirect. The runtime keeps a per-funnel `runId` in sessionStorage and persists `currentScreenId`, answers and history per funnel and run; emails and payment state are never persisted, and payment state is re-derived from the server on return.

One-time payments only: plans are single charges (`mode: 'payment'`); subscriptions and recurring prices are out of scope and rejected. Status reads are bound to the browser that started checkout by an httpOnly run cookie (HMAC over run id and screen id) and, after the return redirect, to the provider session id (`session_id`); the status endpoint reads through the service-role client behind that check. Payments move only pending to succeeded or pending to failed.

Client callbacks and redirect URLs are never proof of payment.

## Versioning

- Each funnel has one mutable draft and zero or more immutable `FunnelVersion` rows with increasing `version`.
- Publish validates, copies the draft definition into a new version and sets `publishedVersionId`. Draft edits never touch a published version.
- Rollback switches `publishedVersionId` to a previous version; no data is copied or deleted.
- `schemaVersion` is stored on the version and in the definition. `migrate(json)` upgrades old JSON step by step to the current schema before validation and rendering. Stored versions are not rewritten; migration happens on read.
- Stage 1: file copy of the draft to an immutable version, if cheap; otherwise publish is Stage 3 (see [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md)).

## Custom domains (Stage 6)

Data: `domains` rows (`id`, `project_id`, `funnel_id`, `hostname`, `status` pending or verified, `verification_token`, `verified_at`, `last_checked_at`, `last_error`). File mode stores them under `.data/domains/`. Hostnames are normalised once (`lib/hostname.ts`: lowercase, punycode through the URL parser, label rules, no IPs, no `localhost`, max 253 characters) and the same function runs in the studio form, the API and the middleware. At most 5 per funnel, unique per funnel, and only one verified row per hostname across the platform (partial unique index); other claims stay pending.

Verification (`server/domains/verify.ts`): the TXT record `_funnel-verify.<host>` must contain `funnel-verify=<token>`, resolved with `node:dns` (`CUSTOM_DOMAIN_DNS_SERVERS` overrides the resolver). Routing (CNAME to `CUSTOM_DOMAIN_TARGET` or A to `CUSTOM_DOMAIN_TARGET_IP`) is checked and reported but does not gate verification. In Supabase mode the result is written by `record_domain_check`, a service-role-only RPC; authenticated users can insert and delete rows but have no update grant, so a client cannot mark its own domain verified.

Resolution (`proxy.ts`): the `Host` header (port stripped) is compared with the platform host (`APP_URL`, `localhost`). On a custom host `/` is rewritten to `/d/<host>`, whose page resolves the hostname to the published version through `get_published_funnel_by_host` (verified row joined with a published funnel) and renders the same `FunnelRuntime` as `/f/[slug]`; `/api/payments/*` and `/api/health` pass through; everything else is 404. `/d/*` is 404 on the platform host. Checkout started on a custom host gets a return URL on that host (`server/public-origin.ts`), only when the host is a verified domain of that funnel.

TLS is issued by the proxy, not the app: `GET /api/domains/serve-check?domain=<host>` is the gate Caddy's on-demand TLS asks before requesting a certificate (see [DEPLOYMENT](./DEPLOYMENT.md#custom-domains-for-funnels)). Not implemented: periodic re-verification, wildcard certificates, proxy automation.

## Animation

- Presets (closed set): `none`, `fade`, `slide_up`, `slide_left`; optional `durationMs` validated against a range.
- Implemented with `motion/react` and `AnimatePresence`. Preset name maps to a fixed variants table in our code; JSON never carries motion objects.
- `useReducedMotion` (or `MotionConfig reducedMotion`) downgrades every preset to `none` or an opacity-only change.

## Storage, auth and public read path (Stage 3)

Backend selection: `FUNNEL_STORAGE=file|supabase`. When unset it is `supabase` if `SUPABASE_URL` and `SUPABASE_ANON_KEY` are both set, otherwise `file`; `supabase` with missing variables fails loudly. The variables are read on the server only (the browser never talks to Supabase), so they are plain runtime variables; the `NEXT_PUBLIC_` spellings are accepted as fallbacks but are compiled into the build. The studio header shows the active storage. In `file` mode there is no auth and no gating (dev only).

Tables (see `supabase/migrations/20261027120000_init.sql`): `projects`, `project_members(role owner|editor)`, `funnels(slug unique, draft_definition jsonb, draft_schema_version, draft_revision, published_version_id)`, `funnel_versions(funnel_id, version, definition; unique(funnel_id, version))`. A trigger on `auth.users` insert creates a default project and an owner membership (`handle_new_user`, security definer), so no server-side bootstrap is needed.

Auth: `@supabase/ssr` cookie sessions. `src/proxy.ts` (Next 16 request proxy) refreshes the session and, for `/studio/**`, `/preview/**` and `/api/funnels/**`, redirects to `/login?next=...` or returns 401 JSON for API paths. Pages and route handlers re-check through `getStudioContext()` (the proxy is not the only gate). `/login` uses server actions for email/password sign-in, sign-up and sign-out. Email confirmation is off in the local `config.toml`; enable it for hosted projects.

Request path: route handler -> `withStudio` -> `SupabaseFunnelRepository(userClient, userId)`. The client carries the user's JWT, so RLS applies. Every method also filters by the user's project memberships explicitly (defence in depth) and a missing or foreign id looks like "not found".

Concurrency: `saveDraft` calls the `save_draft(funnel_id, definition, expected_revision)` RPC (security definer, membership check, structural check, `where draft_revision = $expected`) which increments the revision; a stale revision raises `40001` and the API answers 409 `revision_conflict` with `currentRevision`. The studio sends the revision it last saw, pauses autosave while a publish is in flight, retries a publish once when the conflict turns out to be its own just-saved revision, otherwise stops autosaving and offers "Reload latest". `publish` reads the draft once, answers 409 before any plan-catalogue check, validates the draft in TypeScript at the expected revision, then calls `publish_funnel(funnel_id, expected_revision)`, a security-definer plpgsql function that locks the funnel row (`for update`), re-checks the revision, computes the next version number and inserts the immutable version while moving `published_version_id`. Concurrent publishes therefore get distinct, consecutive numbers. Rollback sets `published_version_id` to an existing version of the same funnel (a trigger rejects pointers to another funnel's version).

Public read path: `/f/[slug]` calls the `get_published_funnel(slug)` RPC with a cookie-less anon client. The function is security definer and returns only `funnel_id`, `project_id`, `version` and `definition` of the published version; the anon role has no table privileges. The definition is migrated and zod-validated before rendering. The service-role key is used only by the payment paths (`lib/supabase/service.ts`), never by the studio or the public read path. Session cookies are issued `httpOnly`, `SameSite=Lax` and `Secure` in production.

Immutability: `funnel_versions` has no update or delete policy and a trigger that raises on UPDATE and on direct DELETE. The cascade that removes versions when a funnel is deleted is allowed (the trigger permits nested trigger depth for DELETE).

## Analytics (Stage 5)

Typed events live in `apps/web/src/lib/analytics/events.ts`: a closed union (`funnel_view`, `screen_view`, `answer_selected`, `step_completed`, `paywall_view`, `checkout_started`, `payment_succeeded`, `payment_failed`, `funnel_completed`) plus an `AnalyticsScope` (`projectId`, `funnelId`, `funnelVersion`, `runId`). `toProperties` is the single allowlist that turns scope and event into PostHog properties; nothing else is sent. Each event has one owner: the browser sends the funnel steps, the server sends `payment_succeeded` and `payment_failed` (typed as server-only), so nothing is counted twice.

Browser side (`lib/analytics/browser.ts`, `use-funnel-analytics.ts`, `components/ConsentBanner.tsx`): `FunnelRuntime` builds the scope from the published funnel (`/f/[slug]` passes `projectId` and `version`) and enables the hook only when a slug is present, so the studio and `/preview` send nothing. The hook reads the stored consent; `unknown` shows the banner and buffers events, `denied` drops, and `granted` starts `posthog-js` as soon as the run id is known (memory persistence, `bootstrap.distinctID = runId`) and flushes the buffer. An init failure switches the hook to dropping. `track` has a stable identity so effects that depend on it do not re-fire when consent changes. `CheckoutPanel` reaches `track` through the runtime context for `checkout_started` and passes `analyticsConsent()` with the checkout request.

Server side (`server/analytics/posthog.ts`): a lazily created `posthog-node` client (`flushAt: 1`, short timeout, warnings on error) behind the same `AnalyticsEmitter` interface; `recordVerifiedEvent` in the webhook path emits `payment_succeeded` / `payment_failed` (not for expired sessions) for non-duplicate events whose provider metadata says the visitor consented, with the run id as distinct id, a deterministic event UUID and `$process_person_profile: false`.

An empty `NEXT_PUBLIC_POSTHOG_KEY` disables everything (no banner, no SDK init); an unreachable PostHog host only produces warnings.

## Deployment (Stage 5)

`next.config.mjs` sets `output: 'standalone'` with `outputFileTracingRoot` at the workspace root, so `next build` emits `apps/web/.next/standalone/apps/web/server.js` with a pruned `node_modules`. The root `Dockerfile` is a three-stage build (pnpm install with the lockfile, `next build`, non-root runner on `node:22-alpine`) and declares a `HEALTHCHECK` on `GET /api/health`. `NEXT_PUBLIC_*` values are build arguments (also accepted as BuildKit secrets, which is how Coolify passes build-time variables); everything else is runtime environment. `docker-compose.yml` builds and runs the same image locally. The Coolify runbook, the variable table and the post-deploy checks are in [DEPLOYMENT](./DEPLOYMENT.md).

## Known risks and open questions

| Item | Status | Check |
|---|---|---|
| Puck is 0.23.0 (pre-1.0) | API may break between minors | Pin exact version; isolate behind `ScreenEditor`; review changelog on upgrade |
| xyflow on React 19 | Not tested in its repo (React 18) | Stage 1 install and canvas smoke test |
| Puck CSS import and `happy-dom` in dependencies | Unverified | Inspect build output and bundle size |
| Puck, motion, Stripe in App Router | Client boundaries needed; untested | Stage 1 and 4 build checks |
| Solidgate SDK and styled-components v5 on React 19 | Untested | Smoke test before Stage 4 Solidgate work |
| Solidgate server-side verification | Not in `react-sdk` | Read docs.solidgate.com before claiming support |
| Supabase licensing | Marker scan only | Re-check if self-hosting |
| Dependency versions | Local values, npm latest not checked | `pnpm view` at install |
| Captured emails stay in the browser | `email_capture` validates and keeps the address in run state only; nothing sends it to a server, and it is dropped from the persisted run and lost across a payment redirect | Next stage: decide a storage and consent policy, then add a server endpoint and persist per run |
