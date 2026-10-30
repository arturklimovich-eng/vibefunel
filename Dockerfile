# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@10.24.0

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/funnel-schema/package.json packages/funnel-schema/
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_ANALYTICS_ANSWER_IDS
RUN --mount=type=secret,id=NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,env=NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_POSTHOG_KEY,env=NEXT_PUBLIC_POSTHOG_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_POSTHOG_HOST,env=NEXT_PUBLIC_POSTHOG_HOST \
    --mount=type=secret,id=NEXT_PUBLIC_ANALYTICS_ANSWER_IDS,env=NEXT_PUBLIC_ANALYTICS_ANSWER_IDS \
    pnpm --filter @funnel/web build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    FUNNEL_STORAGE=supabase
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" || exit 1
CMD ["node", "apps/web/server.js"]
