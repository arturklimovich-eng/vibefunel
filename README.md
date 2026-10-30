# Funnel Platform

pnpm workspace: `packages/funnel-schema` (zod schemas, validation, routing) and `apps/web` (Next.js studio, preview and public runtime).

## Quick start (file storage, no auth)

```
pnpm install
pnpm dev
```

Open http://localhost:3000/studio. Without Supabase variables the app uses `FUNNEL_STORAGE=file`: JSON under `.data/` (gitignored), no login. This mode is for development only.

## Local development with Supabase

Requires Docker.

```
pnpm install
pnpm supabase:start
pnpm supabase:status -o env
```

`supabase:start` starts the local stack and applies `supabase/migrations`. Copy `API_URL` and `ANON_KEY` from the status output into `apps/web/.env.local` (gitignored):

```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<ANON_KEY>
FUNNEL_STORAGE=supabase
```

Then `pnpm dev`, open http://localhost:3000/login, create an account (email confirmation is disabled locally; mail sent by Supabase lands in http://127.0.0.1:54324) and use the studio. The first account gets a default project automatically.

- `pnpm supabase:stop` stops the stack
- `pnpm supabase:reset` drops the local database and re-applies the migrations
- Studio for the local database: http://127.0.0.1:54323

## Hosted Supabase

1. Create a project at supabase.com; in Project Settings > API copy the URL and the anon (public) key.
2. Link and push the schema: `pnpm exec supabase login`, `pnpm exec supabase link --project-ref <ref>`, `pnpm exec supabase db push`.
3. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `FUNNEL_STORAGE=supabase` in the server environment (they are read on the server only, so they can change without a rebuild). In Authentication settings enable email confirmation and set the site URL and redirect URLs.
4. `SUPABASE_SERVICE_ROLE_KEY` is used only by the payment webhook and payment-status paths (`record_payment_event`, `get_payment_status`, funnel-to-project lookup). Set it in the server environment if you accept payments; never expose it to the browser.

See `.env.example` for all variables.

## Payments (Stripe test mode)

1. Create a Stripe account, stay in test mode, and copy the test secret key (`sk_test_...`) and publishable key (`pk_test_...`) from the dashboard (Developers > API keys). Both must belong to the same account.
2. Put these in `apps/web/.env.local` (never commit):

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RUN_TOKEN_SECRET=<random string, 16+ characters>
APP_URL=http://localhost:3000
PAYMENT_PLANS_JSON={"starter_onetime":{"title":"Starter (one-time)","amount":1900,"currency":"usd"}}
```

3. Forward webhooks to the local server and copy the signing secret it prints into `STRIPE_WEBHOOK_SECRET` (restart `pnpm dev` after changing env):

```
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

4. In supabase mode also set `SUPABASE_SERVICE_ROLE_KEY` (from `pnpm supabase:status -o env`); the webhook uses it to record payments. File mode stores payments in `.data/payments.json`.
5. In the studio, a checkout or upsell screen gets a Checkout block with a plan selector (plans come from `PAYMENT_PLANS_JSON`). Publish, open `/f/<slug>`, reach the checkout screen and pay with the test card `4242 4242 4242 4242` (any future expiry and CVC). The runtime moves on only after the verified webhook has been recorded.

Payments are one-time only (no subscriptions). `RUN_TOKEN_SECRET` is required for any provider to be ready; `APP_URL` is required in production; set `TRUST_PROXY_HOPS` only when behind that many trusted reverse proxies. Publishing fails with 400 `unknown_plan` when a Checkout block names a plan that is not in the catalogue.

Plan amounts and currencies are decided by the server catalogue; the browser sends only a plan key. Without the Stripe variables the checkout screen shows "Payments not configured". Solidgate is not implemented (see docs/IMPLEMENTATION_PLAN.md).

### Mock mode (development only)

Set `PAYMENTS_MOCK=true` (and keep `PAYMENT_PLANS_JSON`) to use a simulated provider: the checkout redirects to `/api/payments/mock/confirm`, a clearly labelled page with "Simulate successful payment" and "Simulate failure". The buttons post to a mock webhook that goes through the same record path (store, idempotency) as Stripe events. The mock is ignored when `NODE_ENV=production`.

## Analytics (PostHog)

Set `NEXT_PUBLIC_POSTHOG_KEY` (project API key) and optionally `NEXT_PUBLIC_POSTHOG_HOST` (`https://us.i.posthog.com` by default, `https://eu.i.posthog.com` for EU residency). Without the key there is no banner, no SDK and no network traffic.

- Browser events fire only on the public runtime (`/f/<slug>`), never in the studio or the draft preview, and only after the visitor accepts the consent banner. The decision is stored in `localStorage`; "Decline" keeps the SDK off. Events raised before the decision are buffered and sent on "Accept" or dropped on "Decline".
- Events: `funnel_view`, `screen_view`, `answer_selected`, `step_completed`, `paywall_view`, `checkout_started`, `payment_failed`, `funnel_completed` from the browser; `payment_succeeded` and `payment_failed` from the server after a verified webhook. Every event carries `project_id`, `funnel_id`, `funnel_version`, `run_id`, `screen_id` where relevant and `source` (`browser` or `server`).
- Emails are never sent. `answer_selected` sends the number of selected options; set `NEXT_PUBLIC_ANALYTICS_ANSWER_IDS=true` to send the option ids as well.
- Server-side capture uses `POSTHOG_KEY` / `POSTHOG_HOST` and falls back to the public values. Capture errors are logged as warnings and never fail a webhook.

## Docker

```
docker build -t funnel-platform-web .        # builds inside the image; NEXT_PUBLIC_* values are build args, see docs/DEPLOYMENT.md
docker compose --env-file .env.docker up --build -d
```

`pnpm build` on the host also produces `apps/web/.next/standalone` (run it with `node apps/web/.next/standalone/apps/web/server.js` after copying `.next/static`), but the Docker build does not use the host output.

The image runs `node apps/web/server.js` as a non-root user on port 3000 with `FUNNEL_STORAGE=supabase` and exposes `GET /api/health`. The Coolify runbook is in `docs/DEPLOYMENT.md`.

## Routes

- `/api/health` liveness check (public)
- `/login` email and password sign-in and sign-up (Supabase mode)
- `/studio` funnel list, new funnel, delete
- `/studio/funnels/[id]` canvas, screen editor, versions
- `/preview/[id]` renders the saved draft (members only in Supabase mode)
- `/f/[slug]` renders the published version only (public)
- `/` on a verified custom domain renders that funnel's published version (internal route `/d/[host]`); all other paths are 404 on custom hosts except `/api/payments/*` and `/api/health`
- `GET /api/funnels/[id]/domains`, `POST` (add), `DELETE /api/funnels/[id]/domains/[domainId]`, `POST .../verify` (studio only); `GET /api/domains/serve-check?domain=<host>` (public, for the proxy's on-demand TLS)
- `POST /api/payments/checkout`, `GET /api/payments/status`, `POST /api/payments/stripe/webhook` (public, not behind the auth proxy); `GET /api/payments/plans` (studio only); `/api/payments/mock/*` (development only)

## Custom domains

Attach a hostname to a funnel in the studio (Custom domains panel), create the TXT record shown there and a CNAME to `CUSTOM_DOMAIN_TARGET` (defaults to the `APP_URL` host), then run the check. TLS for tenant hostnames is issued by the reverse proxy; the runbook is in `docs/DEPLOYMENT.md`.

Local testing: Next.js blocks dev assets for unknown origins, so start the dev server with `DEV_ALLOWED_ORIGINS=quiz.example.test` (comma-separated hostnames) and map the hostname to 127.0.0.1 in your hosts file or with Chromium's `--host-resolver-rules`. `CUSTOM_DOMAIN_DNS_SERVERS=127.0.0.1:15353` points verification at a local DNS server that serves the TXT and CNAME records.

## Checks

```
pnpm lint
pnpm typecheck
pnpm build
```

See `docs/` for architecture, security and the implementation plan. The C4 breakdown is in `docs/C4.md` and the data flow in `docs/DATA_FLOW.md`.
