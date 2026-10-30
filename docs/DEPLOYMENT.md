# Deployment

Related: [ARCHITECTURE](./ARCHITECTURE.md) | [SECURITY](./SECURITY.md) | [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md)

The platform ships as one Docker image (`Dockerfile` at the repository root) that runs the Next.js standalone server as a non-root user on port 3000. Funnels are data in Supabase; publishing a funnel never creates a container, a Git repository or a Coolify resource.

## What the image needs

| Variable | When | Notes |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Build | Compiled into the browser bundle; only if payments are enabled |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Build | Compiled in; empty key disables analytics and the consent banner |
| `NEXT_PUBLIC_ANALYTICS_ANSWER_IDS` | Build | `true` sends option ids with `answer_selected`; default `false` |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Run | Read on the server only; the anon key is public by design and RLS protects the data |
| `FUNNEL_STORAGE` | Run | Must be `supabase` in production (the image sets it) |
| `APP_URL` | Run | Public origin, for example `https://funnels.example.com`; required, the server refuses to start without it |
| `RUN_TOKEN_SECRET` | Run | Random string, 16+ characters |
| `SUPABASE_SERVICE_ROLE_KEY` | Run | Webhook and payment-status paths only |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Run | Only if payments are enabled |
| `PAYMENT_PLANS_JSON` | Run | Plan catalogue |
| `TRUST_PROXY_HOPS` | Run | Number of proxies that append to `X-Forwarded-For`: `1` behind Coolify's proxy alone, `2` with Cloudflare (proxied DNS) in front of it. Never higher than the real count |
| `CLIENT_IP_HEADER` | Run | Optional header set by the outermost proxy with the client IP, read only when `TRUST_PROXY_HOPS` > 0. Behind Cloudflare use `cf-connecting-ip`; recommended, because Coolify's Traefik or Caddy rewrite an untrusted `X-Forwarded-For` unless their trusted-proxy ranges include Cloudflare |
| `POSTHOG_KEY`, `POSTHOG_HOST` | Run | Server-side capture; fall back to the public values |
| `PLATFORM_HOSTS` | Run | Optional comma-separated extra hostnames of the platform itself (for example `www.` or the Coolify-generated URL). Without it every hostname other than the `APP_URL` host is treated as a tenant domain and answers 404 for the studio |
| `CUSTOM_DOMAIN_TARGET`, `CUSTOM_DOMAIN_TARGET_IP` | Run | CNAME target (defaults to the `APP_URL` host) and server IP shown to tenants for custom domains |
| `CUSTOM_DOMAIN_DNS_SERVERS` | Run | Optional resolver override (`ip[:port],...`) for domain verification; leave empty to use the system resolver |
| `CUSTOM_DOMAIN_ASK_SECRET` | Run | Optional secret the proxy appends to the serve-check URL (`?secret=...`) so its asks bypass the per-client rate limit |

`NEXT_PUBLIC_*` values are compiled into the JavaScript bundle by `next build` (server and browser), so they must be present when the image is built and their runtime values are ignored. Changing them later requires a rebuild, not a restart. Every other variable is read at start-up, which is why the Supabase settings are `SUPABASE_URL` / `SUPABASE_ANON_KEY` and not `NEXT_PUBLIC_*`: nothing in the browser talks to Supabase, and one image can serve any Supabase project.

The image never contains `.env*` files (see `.dockerignore`). Secrets reach the container only through the environment Coolify or Compose injects.

## Local image

```
cp .env.example .env.docker
# edit .env.docker: FUNNEL_STORAGE=supabase, Supabase URL and keys, APP_URL=http://localhost:3000, RUN_TOKEN_SECRET
docker compose --env-file .env.docker up --build -d
curl http://localhost:3000/api/health
```

`--env-file` feeds the `NEXT_PUBLIC_*` build arguments; `env_file: .env.docker` in `docker-compose.yml` feeds the runtime. A container that points at the local Supabase stack must use `http://host.docker.internal:54321` as `SUPABASE_URL` because `127.0.0.1` inside the container is the container itself.

## Coolify

Prerequisites: a Coolify instance (v4) with a server that can build images, a hosted Supabase project with the migrations applied (`pnpm exec supabase db push`, see README), a DNS A record for the platform domain pointing at the Coolify server, and (optional) Stripe and PostHog projects.

1. Projects > New > Add resource > Public or private Git repository. Point it at this repository and the branch to deploy.
2. Build pack: **Dockerfile**. Base directory `/`, Dockerfile location `/Dockerfile`. Ports exposed: `3000`.
3. Domain: `https://<your-domain>`. Coolify's Traefik issues the Let's Encrypt certificate once the A record resolves; ports 80 and 443 must be open on the server.
4. Environment variables: add every runtime variable from the table above. For each `NEXT_PUBLIC_*` variable set **Build time** to yes so Coolify passes it to `docker build` (as a BuildKit secret on recent Docker versions or as a build argument otherwise; the Dockerfile accepts both). Set `APP_URL` to the same `https://<your-domain>` and `TRUST_PROXY_HOPS=1`.
5. Health check: path `/api/health`, port `3000`. The Dockerfile also declares a `HEALTHCHECK` on that path.
6. Deploy. Watch the build log for `Compiled successfully` and the standalone copy; the container is healthy when `/api/health` returns `{"status":"ok"}`.
7. Supabase Authentication > URL configuration: set the site URL to `https://<your-domain>` and add `https://<your-domain>/login` to the redirect URLs, then enable email confirmation.
8. Stripe Developers > Webhooks: add `https://<your-domain>/api/payments/stripe/webhook` with the `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired` events; put the signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy.

Post-deploy checks:

- `GET /api/health` returns 200.
- `/login` renders, sign-up sends the confirmation email, `/studio` lists the default project.
- Publish a funnel and open `/f/<slug>` from a phone; the consent banner appears only when `NEXT_PUBLIC_POSTHOG_KEY` is set.
- With Stripe configured, a test payment with card `4242 4242 4242 4242` advances past the checkout screen only after the webhook is recorded (check the Stripe webhook delivery log for 200).

Updates: push to the deployed branch (or trigger Deploy in Coolify). Coolify builds a new image and swaps containers. Rollback: Deployments > pick an earlier successful deployment > Redeploy. Funnel versions are independent of platform deployments; rolling the platform back never changes which funnel version is live.

Scaling note: the payment rate limiter is in-process. Running more than one container splits the buckets per instance; put a shared limiter in front (Traefik middleware) before scaling out.

## Custom domains for funnels

A tenant attaches a hostname to a funnel in the studio (Custom domains panel on the funnel page), creates two DNS records and runs the check:

1. Ownership: a TXT record at `_funnel-verify.<hostname>` with the value `funnel-verify=<token>` shown in the panel. The server resolves it with `node:dns` (or the servers in `CUSTOM_DOMAIN_DNS_SERVERS`); only a matching TXT record marks the domain verified. The status is written through the service role (`record_domain_check`); authenticated users can insert and delete domain rows but never update them.
2. Routing: a CNAME from `<hostname>` to `CUSTOM_DOMAIN_TARGET` (default: the `APP_URL` host), or an A record to `CUSTOM_DOMAIN_TARGET_IP` for apex domains. The check reports this separately; it does not block verification.

Once the domain is verified and the funnel is published, a request whose `Host` is that hostname is served the live version at `/` (an internal rewrite to `/d/<host>`). Every other path on a custom host returns 404, except `/api/payments/*` (checkout, status polling, Stripe return) and `/api/health`; studio, login and the funnel API exist only on the platform domain. Stripe return URLs point back to the custom host when checkout started there. Limits: 5 hostnames per funnel; a hostname is verified for one funnel at a time (claims by other funnels stay pending until the verified one is removed). A domain stays verified until it is removed; there is no periodic re-check.

`GET /api/domains/serve-check?domain=<host>` answers 200 for verified hostnames of published funnels (and for the platform host) and 404 otherwise. It is public, rate limited, and is the gate for certificate issuance below.

### TLS: Caddy with on-demand certificates (recommended)

Coolify's Traefik proxy issues certificates only for hostnames listed on the application, and every change to that list recreates the container, so it does not fit tenant domains. Use Caddy's on-demand TLS instead:

1. Coolify > Servers > your server > Proxy: switch the proxy type to **Caddy** (Coolify runs `lucaslorentz/caddy-docker-proxy`; its base Caddyfile imports `/dynamic/*.caddy`). Redeploy the platform application so it receives Caddy labels for the platform domain.
2. Proxy > Dynamic configurations > Add a file named `00-funnel-domains.caddy` (it must sort before the other files because the global options block has to come first):

```
{
	on_demand_tls {
		ask https://<your-domain>/api/domains/serve-check?secret=<CUSTOM_DOMAIN_ASK_SECRET>
	}
}

https:// {
	tls {
		on_demand
	}
	reverse_proxy <app-container>:3000
}

http:// {
	redir https://{host}{uri} permanent
}
```

`<app-container>` is the platform application's container name on the Coolify Docker network (shown on the resource page). Caddy adds `domain=<host>` to the query of the `ask` URL and issues a certificate only when the answer is 200. The `ask` URL may also point straight at the container (`http://<app-container>:3000/api/domains/serve-check`): the endpoint answers on any host. The `secret` parameter is optional but recommended; without it the asks share the public per-client rate limit (300 per minute per IP) and a flood of random server names could block issuance for real visitors.
3. Turn off Coolify's own catch-all (Proxy settings > "Redirect to" disabled, or `PATCH /api/v1/servers/{uuid}/proxy` with `redirect_enabled=false`); its `:80, :443` block would otherwise compete with the `https://` site.
4. Set `CUSTOM_DOMAIN_TARGET` to the platform hostname (tenants CNAME to it), optionally `CUSTOM_DOMAIN_TARGET_IP` to the server's public IP for apex domains, keep `TRUST_PROXY_HOPS=1`, and make sure ports 80 and 443 are open.
5. Test: add a hostname in the studio, create the DNS records, run the check, then open `https://<hostname>`. Caddy asks `/api/domains/serve-check`, gets 200, obtains the certificate from Let's Encrypt on the first request (a few seconds) and proxies to the app. Removing the domain in the studio makes serve-check answer 404, so no further certificates are issued and the app returns 404 for that host.

Dynamic configuration files are managed in the Coolify UI only (no API). Rate limits on Let's Encrypt still apply; Caddy caches issued certificates and renews them itself.

### Alternative: Coolify API per domain

For a handful of tenant domains without touching the proxy: `PATCH /api/v1/applications/{uuid}` with `domains` set to the full comma-separated list of URLs (platform domain plus tenant domains) and `instant_deploy=true`. Coolify regenerates the proxy labels and recreates the container (brief downtime), and Let's Encrypt issues one certificate per listed host. Limits: the field is capped at 2048 characters (roughly 50 to 70 hostnames), wildcards are rejected, and every change recreates the container. The platform does not call this API; an operator or a script does, after the domain is verified in the studio.

Not implemented: automatic re-verification, wildcard or DNS-01 certificates, and any proxy automation inside the platform.
