# Security

Related: [REPOSITORY_AUDIT](./REPOSITORY_AUDIT.md) | [ARCHITECTURE](./ARCHITECTURE.md) | [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md)

Status: design rules. Most controls below are implemented in Stage 3 (tenancy), Stage 4 (payments) and Stage 5 (analytics, domains). In `FUNNEL_STORAGE=file` mode (dev fallback) there is no auth and the app must not be exposed to the internet. In `supabase` mode the controls in "Stage 3 implementation" below apply.

## Threat model

Assets:
- Tenant funnel definitions (drafts and published versions).
- Payment secrets and webhook secrets.
- Visitor emails and quiz answers.
- Payment records and published-version integrity.

Actors:
- Anonymous visitor.
- Authenticated tenant.
- Malicious tenant (tries to read or write another tenant's data, or inject content).
- Attacker holding the public Supabase anon key (it is public by design).
- Replay or forgery of payment webhooks.

Trust boundaries:

| Boundary | Rule |
|---|---|
| Browser | Untrusted. Never holds secrets. Never decides price or payment success |
| Next.js server | Trusted. Holds secrets; re-checks ownership; verifies webhooks |
| Supabase | Enforces RLS; `service_role` bypasses RLS and is used only from the server |
| Payment provider | Source of truth for payment only after signature or status-API verification |
| PostHog | Third party. Receives only allowlisted, non-PII properties, only after consent |

Main threats and mitigations:

| Threat | Mitigation |
|---|---|
| Tenant reads or edits another tenant's funnel | RLS on every tenant table + server ownership check |
| Anon key used directly against PostgREST | RLS denies by default; no policy grants beyond own rows |
| Forged or replayed payment webhook | Signature verification, event-id idempotency, amount/currency/product/project checks |
| Client claims payment success | Success is server-confirmed only |
| Secret leaks to the bundle | No `NEXT_PUBLIC_` secrets; build-output grep in CI |
| Malicious funnel JSON executes code | No code in JSON; declarative conditions; allowlisted presets; zod validation |
| Malicious image URL or link | https-only URLs; allowlist option; `url` button action restricted to http/https |
| Live funnel changed by draft edit | Runtime reads only immutable versions |
| Domain takeover | TXT ownership challenge per claim; verified status written only by a service-role RPC after the server resolves the record; one verified row per hostname; Host routing only for verified rows of published funnels |

## Stage 3 implementation: auth, RLS, public read

Sign-in and sign-up limits (server action `app/auth/actions.ts`, two in-memory stores of their own: request counters and failure counters, so neither can evict the other or the payment limiters; at capacity expired entries go first, then the lowest counts). Requests: 10 sign-ins and 5 sign-ups per minute per client when the client IP is known (`TRUST_PROXY_HOPS` > 0), otherwise one shared cap of 300 sign-ins and 60 sign-ups per minute for all visitors. Failures: a slot is reserved synchronously before Supabase is called and released again unless Supabase answers `invalid_credentials`, so concurrent bursts cannot exceed the caps and outages, Supabase 429s or unconfirmed emails never count; caps are 50 per hour per account and, when the client IP is known, 10 per 15 minutes per account and client. A correct password never counts. An attacker on one address cannot lock the owner out when the client IP is known; 50 failures from many addresses lock the account for up to an hour (accepted cost of the spraying guard). Non-credential errors show "temporarily unavailable" instead of "invalid password". The proxy must overwrite `CLIENT_IP_HEADER` and `X-Forwarded-For` rather than pass client copies through. Supabase Auth also rate-limits by the caller's IP, which is the platform server for every sign-in; check the hosted project's auth rate limits before launch.

Auth flow: email and password through Supabase Auth with cookie sessions (`@supabase/ssr`). The request proxy (`src/proxy.ts`) validates the session with `auth.getUser()` (verified against the auth server, not just the cookie) for `/studio/**`, `/preview/**` and `/api/funnels/**`: pages redirect to `/login`, API routes return 401. Pages and handlers check again via `getStudioContext()`. The `next` redirect parameter is accepted only if it starts with a single `/`. Local config has email confirmation disabled for development; hosted projects should enable it.

RLS summary (migration `20261027120000_init.sql`; RLS enabled on all four tables; `is_project_member` and `is_project_owner` are stable security-definer functions with `search_path = ''`, executable by `authenticated` only):

| Table | select | insert | update | delete |
|---|---|---|---|---|
| projects | member | none (created by the signup trigger) | owner | owner |
| project_members | member | owner | owner | owner |
| funnels | member | member (a trigger forces status draft, null published pointer, revision 1) | member | owner only (cascades to all versions) |
| funnel_versions | member (via funnel) | none (RPC only) | none (policy absent, trigger raises) | none (policy absent, trigger raises; cascade from funnel delete allowed) |

Publish and rollback are RPC-only: `publish_funnel(funnel_id, expected_revision)` and `rollback_funnel(funnel_id, version_id)` are security definer with `search_path = ''`, check `is_project_member` on the funnel's project explicitly, lock the funnel row, and are executable by `authenticated` only. They raise with SQLSTATE codes the repository maps (`40001` revision conflict, `P0002` funnel not found or not a member, `22023` invalid definition, `23503` version not of this funnel); `42501` comes from the `funnels_guard` trigger on direct writes, and the app treats forbidden as not found. The last-owner trigger on `project_members` locks the project row first, so two concurrent demotions cannot both pass the check. Rollback first parses the target definition with the current schema and refuses with 409 when it cannot be read. A trigger on `project_members` rejects deleting or demoting the last owner of a project (cascades from deleting the project or user are allowed). `get_published_funnel` joins the version to its own funnel.

Delete: only project owners can delete a funnel; deleting cascades to every version, including the live one. Known limitation: a deleted funnel's slug becomes free immediately and another tenant could claim it (future work: soft delete or slug reservation).

Production storage rule (fail closed): when `NODE_ENV=production`, only `FUNNEL_STORAGE=supabase` is accepted (with both `SUPABASE_URL` and `SUPABASE_ANON_KEY`); unset or `file` throws (`instrumentation.ts` checks at server start and the check also runs per request) instead of silently using file storage. The `file` backend is development only: no auth and non-atomic writes beyond a single-process lock.

Auth messages: sign-in and sign-up return generic messages and never echo the Supabase error (it is logged server-side). The `next` redirect is resolved against the request origin and must be same-origin, start with a single `/`, and contain no control characters or backslashes.

Draft writes are RPC-only: `save_draft(funnel_id, expected_revision, definition, schema_version)` is security definer, checks membership, the revision (SQLSTATE `40001`) and a minimal structural check (object with `screens` and `edges` arrays, string `startScreenId`, integer `schemaVersion` equal to the argument; `22023` otherwise), then bumps `draft_revision`. `publish_funnel` repeats the structural check on the draft before inserting a version. The `funnels_guard_write` trigger rejects any direct UPDATE that changes anything other than `name` and `updated_at` (SQLSTATE `42501`) unless the transaction-local setting `app.rpc` is `on`; the three RPCs set it with `set_config('app.rpc', 'on', true)` as their first statement. PostgREST clients cannot set arbitrary settings, so members cannot bypass the guard. All three RPCs return `P0002` for both a missing funnel and a funnel the caller is not a member of, so ids cannot be probed through them.

`project_members` keys (`user_id`, `project_id`) cannot be updated; only `role` can change, and the last-owner trigger guards role changes and deletes. Cascades from deleting a project or a user (`auth.users`) bypass the last-owner guard by design; deleting the only owner's user therefore leaves an orphan project, a known limitation. TRUNCATE, REFERENCES and TRIGGER are revoked on all public tables from `anon` and `authenticated`. Existing users without a membership get a default project through an idempotent backfill statement at the end of the init migration.

Known limitations: a 409 `slug_taken` on create reveals that a slug exists (slug enumeration); deleting a funnel frees its slug immediately; orphan projects after user deletion; funnel delete returns 403 for editors (they can already see the funnel).

Other database controls: `slug` unique with a CHECK on `^[a-z0-9-]{3,60}$`; `funnels.published_version_id` must reference a version of the same funnel (FK plus trigger); the funnels guard trigger also runs on INSERT.

What the anon key can reach: `EXECUTE` on `get_published_funnel(slug)` only. All privileges on the tables are revoked from `anon`, and the helper, publish and payment functions are not executable by `anon`. The function returns `funnel_id`, `project_id`, `version` and `definition` of the published version of a published funnel and nothing else (no draft, no user data); the project uuid is an identifier, not a credential, and every access check is enforced by RLS or the server. Published definitions are public by design.

Service role: `SUPABASE_SERVICE_ROLE_KEY` is read only by `lib/supabase/service.ts`, which the payment store uses for `record_payment_event`, the funnel-to-project lookup on the webhook paths (Stripe webhook and, in development, the mock webhook) and, since the status read is bound to a cookie checked by the app, a direct `select status, reason` on `payments` for the status endpoint (service role bypasses RLS; anon cannot read payment status at all). The endpoint exposes only `pending`, `succeeded`, `failed` or `needs_review` (a paid session the webhook rejected for an amount, currency, plan, project or funnel mismatch); the reason never leaves the server. It throws a typed error when the key is missing and the routes answer 503. Server-only code (`import 'server-only'`) is the only place any Supabase client is created for requests; the client bundle contains no secret.

Verified locally on 2026-10-27 against `supabase start` (see the status log in IMPLEMENTATION_PLAN): user B sees 0 rows of A's funnels and versions, cannot update, delete or insert into A's project, cannot publish A's funnel; stale revisions return 409; the trigger blocks UPDATE and DELETE on versions; anon is denied on the tables and on the publish and membership functions.

## Secrets policy

- Secrets live only in server environment variables (Coolify env, local `.env.local` that is gitignored).
- No secret in `NEXT_PUBLIC_*`, in source, in `.env.example` values, in funnel JSON, or in logs.
- `.env.example` lists names with empty or placeholder values.
- Per-tenant provider credentials are out of scope until encryption and key management are designed; only server-environment configuration is supported.

| Variable | Secret | May live in | Notes |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Yes | Server env only | Test key (`sk_test_`) in all non-production |
| `STRIPE_WEBHOOK_SECRET` | Yes | Server env only | Used by the webhook route only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No (public) | Public | Inlined into the client bundle; must belong to the same Stripe account as the session |
| `PAYMENT_PLANS_JSON` | No (not secret, but server only) | Server env only | Plan catalogue (amount, currency, provider ids); the client never receives provider ids |
| `PAYMENT_PROVIDER`, `APP_URL`, `TRUST_PROXY_HOPS` | No | Server env only | Provider choice; public origin for return URLs (required in production); trusted proxy hops for rate limiting |
| `RUN_TOKEN_SECRET` | Yes | Server env only | HMAC key (16+ chars) binding a payment run to the browser; without it every provider is `not_configured` |
| `SOLIDGATE_MERCHANT_ID` | Treat as private | Server env only | Sent to the client only inside generated `merchantData` |
| `SOLIDGATE_SECRET` | Yes | Server env only | Signs `signature` and `paymentIntent` on the server |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server env only | Bypasses RLS; used only by the payment webhook paths via `lib/supabase/service.ts`; never in client code |
| `SUPABASE_URL` | No | Server env | Read on the server only; `NEXT_PUBLIC_SUPABASE_URL` accepted as a compiled-in fallback |
| `SUPABASE_ANON_KEY` | No (public) | Server env | Safe only because RLS is enforced; `NEXT_PUBLIC_SUPABASE_ANON_KEY` accepted as a compiled-in fallback |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | No (public) | Public, compiled in at build | Project key and ingestion host for browser capture; empty key disables analytics |
| `POSTHOG_KEY`, `POSTHOG_HOST` | No (project key) | Server env | Used by `posthog-node` for webhook-driven events; fall back to the public values |
| `NEXT_PUBLIC_ANALYTICS_ANSWER_IDS` | No | Public, compiled in at build | `true` adds option ids to `answer_selected` |
| `PAYMENTS_MOCK` | No | Server env, non-production only | See payment rules |

Supabase key names: the local CLI (2.122) prints both legacy `ANON_KEY` / `SERVICE_ROLE_KEY` and `PUBLISHABLE_KEY` / `SECRET_KEY`; the app uses `SUPABASE_ANON_KEY` with the anon (or publishable) key. Confirm against `pnpm supabase:status -o env`.

## Payment rules

Implemented in Stage 4 phase A (checked offline against the file store; the SQL objects and the live Stripe flow are not verified yet, see the status log in IMPLEMENTATION_PLAN):

1. Success is determined only by the server: a Stripe webhook whose signature verifies (`stripe.webhooks.constructEvent` on the raw body with `STRIPE_WEBHOOK_SECRET`; a missing or wrong signature returns 400 and stores nothing). Redirect URLs, query parameters, Embedded Checkout callbacks and browser state are never trusted: the runtime sets `payments[screenId] = 'succeeded'` only after `GET /api/payments/status` returns `succeeded`. Persisted run state in sessionStorage excludes payment state and emails.
2. Handled events: `checkout.session.completed` (succeeded only if `payment_status` is `paid`, otherwise pending), `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired` (pending to failed, reason `expired`). Other event types and sessions without our metadata are acknowledged and ignored. For handled events the server re-checks the funnel (`funnel_missing`), that it belongs to the metadata project (`project_mismatch`), the plan (`plan_mismatch`), `amount_total` (`amount_mismatch`) and `currency` (`currency_mismatch`) against the server catalogue. Any mismatch persists the payment as `failed` with that reason (funnel_id null when the funnel is missing), logs one line `PAYMENT_NEEDS_ATTENTION provider_ref=... reason=...` (a paid-but-rejected session needs a manual look in Stripe) and emits `payment_failed` through the server emitter; the webhook still answers 200. Refunds and disputes: `charge.refunded` (cumulative `amount_refunded`) and `charge.dispute.created` / `charge.dispute.closed` (dispute status; the charge is fetched for its metadata) are matched to the payment by the Stripe PaymentIntent stored on it (`provider_payment_id`, any status, so refunds of payments flagged `needs_review` are recorded too), falling back to run, screen and payer hash for succeeded rows without a PaymentIntent id; charges without our metadata fall back to the Checkout Session's metadata. They are recorded by the service-role RPC `record_payment_adjustment` (migrations `20261030160000` to `20261030210000`): refunds keep the maximum amount, dispute statuses only move forward in Stripe event time, duplicates are ignored by event id, charges that are not from a funnel are ignored with a log line, and an event for a payment that is not recorded yet is stored in `payment_orphans` with its full content and answered 200 (`deferred`); `record_payment_event` applies waiting adjustments in event-time order as soon as the matching payment is written, so delivery order never matters and no retries or timers are involved. Both RPCs take a transaction-level advisory lock on provider and run id first (migration `20261030220000`), so a payment and its refund written at the same moment cannot miss each other (checked with 40 concurrent pairs: all applied). Deferred rows that never find a payment (for example a checkout rejected for an invalid project id) stay in `payment_orphans` for an operator to inspect. A refund or dispute does not revoke access already granted; that is a product decision.
3. Idempotency and state machine: `payment_events(provider, event_id)` has a primary key; `record_payment_event` inserts the event id and upserts the payment in one transaction and returns false for a replay. A payment moves only pending to succeeded or pending to failed; terminal states never change (a retry is a new session with a new provider reference). File mode keeps the same semantics in `.data/payments.json` under an in-process lock. Processing errors return 500 so the provider retries; handled events return 200.
4. Prices and plans come from `PAYMENT_PLANS_JSON` (zod-validated). The checkout route accepts only `{ slug, screenId, runId, planKey }`, resolves the PUBLISHED funnel by slug, requires the screen to be checkout or upsell and to contain a Checkout block bound to that plan key, and builds the Stripe session from the catalogue. Publishing a funnel is refused with 400 `unknown_plan` when the catalogue is configured and a Checkout block names a key outside it. Plans are one-time payments only (`mode: 'payment'`); a recurring Stripe price is rejected with 502 `recurring_price_unsupported`.
5. No PAN or CVV is ever handled or stored; the card form is Stripe Embedded Checkout (Stripe-hosted iframe). The browser holds only the public publishable key. Sessions expire after 31 minutes (`expires_at`).
6. Sandbox/test mode only. No real payments.
7. If provider env vars are missing (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RUN_TOKEN_SECRET`), the plan catalogue is invalid or `PAYMENT_PROVIDER` has an unknown value, checkout answers 503 `{ status: 'not_configured' }` and the screen shows "Payments not configured". The Stripe webhook route answers 503 when `PAYMENT_PROVIDER` is not `stripe`. No fake success.
8. Mock provider: active only when `PAYMENTS_MOCK=true` and `NODE_ENV !== 'production'`. The `MockProvider` constructor throws otherwise and the `/api/payments/mock/*` routes return 404; the mock page and the runtime are visibly labelled. Mock events go through the same record path and the same checkout route (so the same run cookie).
9. The common `PaymentProvider` interface covers the shared minimum (`createCheckout`, `verifyWebhook`; `verifyWebhook` returns null for verified but irrelevant events). When a plan names a `stripePriceId`, `createCheckout` retrieves the Price first and refuses to create a session unless it is active, one-time and matches the catalogue amount and currency (`plan_price_mismatch`, `recurring_price_unsupported`).
10. Service role usage is limited to the payment paths listed above; everything else uses the anon client or the user client.
11. Payer binding and status: every checkout generates a random 128-bit nonce and stores it in an httpOnly, SameSite=Lax cookie (Secure in production, path `/api/payments`) `fp_run_<runId>` (up to 8 nonces joined with a dot). Besides funnel, screen, run, plan, project and the analytics consent flag, the provider session (and its PaymentIntent) carries `payer` = HMAC-SHA256(`RUN_TOKEN_SECRET`, `runId:screenId:nonce`) in its metadata, and the webhook stores it as `payments.payer_hash` (migration `20261030140000_payment_payer.sql`). `GET /api/payments/status` derives the payer hashes from the cookie and only sees payments whose `payer_hash` matches; without a matching nonce it answers `pending`. A return URL (`?run=&screen=&session_id=`) shared with or stolen by another person therefore unlocks nothing: a new checkout for that run would get a new nonce that matches no existing payment, and checkout refuses to start a session at all (409 `payment_exists`, no cookie) while the run and screen already have a succeeded or pending payment. Public statuses: `pending` (no payment for this payer yet), `processing` (a pending payment exists, for example a delayed payment method; the client shows a waiting state and never opens a second checkout), `succeeded`, `failed`, `needs_review`. With `ref` the lookup is limited to that provider reference. Post-payment content gating in the client is UX only: the payment record is the only authority for whether a payment succeeded, and anything that must stay private after payment has to be checked against it on the server.
12. Rate limiting is in memory and per instance (not shared between instances or restarts, so it is abuse reduction rather than a security boundary). Forwarding headers are trusted only when `TRUST_PROXY_HOPS` is a positive integer. Then `CLIENT_IP_HEADER` (for example `cf-connecting-ip` behind Cloudflare), when set and present, names the client; otherwise `X-Forwarded-For` is read and the entry `TRUST_PROXY_HOPS` positions from the right is used, or the leftmost entry when the chain is shorter (a proxy that rewrites the header leaves fewer entries, all added by trusted proxies). `TRUST_PROXY_HOPS` must equal the number of proxies that append to the header; a higher value lets clients choose their own key. With `TRUST_PROXY_HOPS=0` every client shares one `direct` bucket (checkout 60 per minute, status 600 per minute). With trusted hops the per-client limits are checkout 10 and status 120 per minute. Checkout also has 5 per minute per (slug, runId). The store is capped at 5000 keys with oldest-first eviction.
13. `get_published_funnel(slug)` returns the project id of a published funnel to anon (used by the checkout route to bind the session to a project). Accepted: a project uuid is an identifier, not a credential, and every access check is enforced by RLS or the server. A webhook whose metadata carries a non-uuid project id is answered 200 with `rejected: invalid_project_id`, logged as `PAYMENT_NEEDS_ATTENTION` and not stored.

Database (migration `20261027140000_payments.sql`): `payments` carries `project_id uuid not null`, a nullable `funnel_id` (`on delete set null`, so deleting a funnel keeps payment records) and a `reason`; RLS has a SELECT policy for project members on `project_id` and no INSERT, UPDATE or DELETE policies; `payment_events` has RLS and no policies; all privileges are revoked from `anon` and `authenticated` except SELECT on `payments` for `authenticated`. `record_payment_event` and `get_payment_status` are executable by `service_role` only.

Stripe notes:
- SDK `stripe` 23.0.1 with API version pinned in code to `2026-09-30.endive`. The server creates a Checkout Session with `mode: 'payment'`, `ui_mode: 'embedded_page'` (this SDK's name for embedded checkout; the older value `embedded` is not in its types) and metadata `{ funnelId, screenId, runId, planKey, projectId }`, and returns only `client_secret`. The line item is the catalogue `stripePriceId` or inline `price_data` from the catalogue; with a Price id the webhook still compares Stripe's `amount_total` to the catalogue amount.
- Not verified: the live Stripe flow (real session creation, `stripe listen`, 3-D Secure, async payment methods) was not run in phase A.

Solidgate notes:
- Not implemented: `SolidgateProvider` reports `not_configured` and throws `unsupported` on every operation. The local `react-sdk` clone documents only the client component (`merchantData = { merchant, signature, paymentIntent }`) and no signature algorithm, webhook format, webhook signature or status API. Open questions are listed in IMPLEMENTATION_PLAN. Client callbacks (`onSuccess`, `onProcessing`, `onOrderStatus`) are not proof of payment.
- Not verified: styled-components v5 with React 19; client-only loading under Next.js.

## Tenant isolation

- RLS enabled on every table holding tenant data (projects, funnels, versions, domains, integrations, events, payment records). Default deny.
- `domains`: members of the project can select, insert and delete; there is no update grant for `authenticated`, so the only way to change `status` is `record_domain_check` (service role) after a server-side DNS lookup. The trigger pins `status = 'pending'` and generates the token on insert and refuses changes to hostname, funnel, project or token. The anon role has no access to the table; public resolution goes through `get_published_funnel_by_host` / `is_host_servable`, which return only verified rows of published funnels.
- Custom-host requests: the `Host` header is normalised and only used to look up a verified row; it never reaches a redirect or a rewrite unless it passed the hostname rules, and the rewrite target is the validated hostname. Studio, login and the funnel API are unreachable on custom hosts (404). `/api/domains/serve-check` is public and rate limited, answers only 200/404 and reveals nothing beyond "this hostname is served".
- Policies are covered by automated tests with at least two users (A cannot read, insert, update or delete B's rows).
- `service_role` is used only in server code on the payment webhook paths (`lib/supabase/service.ts`). It is never imported in client bundles.
- Server code re-checks that the object belongs to the caller's project before acting, independent of RLS.
- Published versions are readable by the runtime only through a server path that resolves slug to `publishedVersionId`; drafts are never served on public routes.

Policy sketch (illustrative; to be written and tested in Stage 3):

```sql
alter table funnels enable row level security;

create policy funnels_select_own on funnels
  for select to authenticated
  using (exists (
    select 1 from projects p
    where p.id = funnels.project_id and p.owner_id = auth.uid()
  ));

create policy funnels_modify_own on funnels
  for all to authenticated
  using (exists (
    select 1 from projects p
    where p.id = funnels.project_id and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from projects p
    where p.id = funnels.project_id and p.owner_id = auth.uid()
  ));
-- funnel_versions: select/insert only, no update or delete policy (immutability).
```

## Runtime safety

- Funnel JSON contains data only. No strings are executed, no `eval`, no `new Function`, no dynamic import from JSON.
- Branching uses the closed Condition union (`always`, `answer_equals`, `answer_includes`, `default`); see [ARCHITECTURE](./ARCHITECTURE.md).
- Animation presets are an allowlist (`none`, `fade`, `slide_up`, `slide_left`); `durationMs` is range-checked.
- zod validation at save, at publish, and again before render in the runtime. Invalid versions show an error state instead of rendering.
- Image URLs: https only, with an optional host allowlist; Supabase storage URLs are the preferred source.
- Button `url` actions: http/https only; no `javascript:` or `data:` URLs.
- Puck `content` is validated loosely, so rendering goes through our own component config only; unknown component types are rejected or skipped, not rendered raw. Rich text, if enabled, must be sanitized (to be verified when `richtext` is used).

## Privacy and analytics

Implemented in Stage 5 (`apps/web/src/lib/analytics`, `apps/web/src/server/analytics`):

- `posthog-js` is initialised only after the visitor clicks "Accept" on the consent banner shown on `/f/<slug>` and the run id is known; it runs with `persistence: 'memory'` and `bootstrap.distinctID = runId`, so PostHog writes no cookie and no localStorage entry even after consent (the decision itself is stored in `localStorage` under `funnel-analytics-consent`). "Decline" keeps the SDK off for that browser. Events raised before the SDK starts are buffered in memory (100 at most) and sent on start or dropped on decline or init failure.
- The SDK runs with autocapture, pageviews, session recording, surveys, heatmaps, dead clicks, exception capture, feature flags, external script loading and IP capture disabled, `person_profiles: 'never'` and `respect_dnt: true`. Only the typed events below are sent.
- The studio and the draft preview never send analytics; the hook is enabled only for the public runtime.
- Emails are never sent. `answer_selected` carries the screen id and the number of selected options; option ids are added only when the deployment sets `NEXT_PUBLIC_ANALYTICS_ANSWER_IDS=true`. Every event carries `project_id`, `funnel_id`, `funnel_version`, `run_id` (the per-browser run id, also used as the server-side distinct id), `source` and, where relevant, `screen_id`, `screen_type`, `plan_key`, `payment_id` (provider reference), `amount`, `currency`, `reason`.
- One owner per event. The browser sends the funnel steps (`funnel_view`, `screen_view`, `answer_selected`, `step_completed`, `paywall_view`, `checkout_started`, `funnel_completed`). The server sends payment outcomes only (`payment_succeeded`, `payment_failed`, `payment_refunded`, `payment_disputed`; both are `ServerOnlyAnalyticsEvent`, so the browser emitter cannot express them), from `recordVerifiedEvent` after a verified, non-duplicate webhook. Expired sessions (abandoned checkouts) emit nothing.
- Consent reaches the server through the checkout request (`analyticsConsent`, true only when the visitor accepted) and the provider metadata (`analytics: '1' | '0'`); the webhook emits payment events only when it is `'1'`. Server events use the run id as distinct id, the same id the browser bootstraps with, so browser and server events join into one PostHog funnel.
- Server events carry a deterministic UUID derived from provider, provider reference and event name, so a retried or duplicated delivery is deduplicated by PostHog as well as by the payment store.
- Host choice: `NEXT_PUBLIC_POSTHOG_HOST` / `POSTHOG_HOST` per deployment (`https://eu.i.posthog.com` for EU residency, `https://us.i.posthog.com` by default).
- Analytics failure never breaks the funnel: `init` and `capture` are wrapped and log a warning; request errors go to `on_request_error` (browser) and the `error` listener (server). The server client sends each event immediately (`flushAt: 1`, 5 s timeout, 2 retries), so no shutdown hook is needed; a PostHog outage costs a logged warning per event. A webhook never fails because of analytics.
- Proxying PostHog through our domain is not configured.
- PostHog `ee/` code is never used.

## Custom domains

Implemented in Stage 6 (see "Tenant isolation" above and [ARCHITECTURE](./ARCHITECTURE.md#custom-domains-stage-6)):
- Ownership: TXT challenge `_funnel-verify.<host>` = `funnel-verify=<token>`, token generated by the database on insert, resolved server-side. Transport errors (timeouts, SERVFAIL) keep the stored status instead of un-verifying a live domain.
- Duplicate claims: one verified row per hostname (partial unique index). When a new owner proves ownership while an old verified claim exists, the old claim's TXT record is re-checked and released only if it no longer matches; otherwise the new claim stays pending.
- Routing: unknown or unverified hosts get 404; studio, login and the funnel API never answer on custom hosts; the rewrite target is the normalised hostname only.
- TLS: issued by the proxy. `/api/domains/serve-check` is the issuance gate: 200 only for verified hostnames of published funnels; public, rate limited per client and per hostname. `CUSTOM_DOMAIN_ASK_SECRET` (query `secret`) lets the proxy's own asks bypass the per-client limit so a flood of random server names cannot block legitimate issuance.
- Re-verification: `POST /api/cron/domains` (bearer `CRON_SECRET`, compared through SHA-256 digests with `timingSafeEqual`; 503 while unset or shorter than 16 characters) re-checks verified domains older than 24 hours and revokes a domain after two consecutive definitive negative answers, so a tenant who deletes the TXT record or loses the domain stops being served within about two days. Writes go through service-role RPCs (`claim_domain_rechecks`, `record_domain_recheck`, migration `20261030150000_domain_recheck.sql`) that only touch rows the job owns: a domain the owner set to pending by hand, or one released to another funnel, is never re-verified by the job.
- Not implemented: wildcard certificates.

## Response headers

Set in `next.config.mjs` for every path: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. The studio, login, preview and API paths add `X-Frame-Options: DENY`; API responses carry `default-src 'none'; frame-ancestors 'none'`. Production builds add `Strict-Transport-Security: max-age=31536000` (no `includeSubDomains`, because tenant hostnames share it).

Pages get a per-request nonce CSP from `src/proxy.ts` (`src/server/csp.ts`): `script-src 'self' 'nonce-…' 'strict-dynamic'` (plus `'unsafe-eval'` in development only), so Stripe.js and PostHog load only because our nonce-bearing scripts insert them; `connect-src` allows `*.stripe.com`, `*.posthog.com` and the configured PostHog host; `frame-src 'self' https://*.stripe.com`; `img-src`/`media-src` allow `https:` for authored funnel media; `style-src 'self' 'unsafe-inline'` (React and Puck set inline styles), plus `https://rsms.me` on studio pages for the Puck UI font; `object-src 'none'; base-uri 'self'; form-action 'self'`; `frame-ancestors 'self'` on public funnels and `'none'` on studio, login and preview. The root layout awaits `connection()`, so every page renders per request and receives the nonce. zod runs with `jitless` so its eval probe does not trip the policy. Public funnels cannot be embedded in other sites' iframes; allowing that is a product decision.

## Operational

- Dependencies pinned by `pnpm-lock.yaml`; pre-1.0 and fast-moving packages (`@puckeditor/core`, `motion`, `@solidgate/react-sdk`, Supabase clients) pinned to exact versions.
- Run `pnpm audit` and a license scan on the lockfile at least before each release and monthly; review upgrades individually.
- Docker image runs as a non-root user, with a minimal base image and no secrets baked in at build time.
- Coolify itself needs hardening of its host (SSH keys, firewall, only 80/443 public); its own install requires 30 GB disk (`coolify` `scripts/install.sh:431-432`).
- Logs must not include secrets, card data, emails or quiz answers.
- Stage 1 `.data/` JSON storage is for development only.
