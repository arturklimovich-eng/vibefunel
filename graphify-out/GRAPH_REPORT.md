# Graph Report - funnel-platform  (2026-10-30)

## Corpus Check
- 153 files · ~74,545 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 6, .css 5, .example 1)

## Summary
- 1288 nodes · 3123 edges · 67 communities (55 shown, 12 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 101 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d258a17f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- withStudio
- Web App Dependencies
- Analytics and Consent
- Root Tooling and Lint
- Checkout and Status API
- supabase-funnel-repository.ts
- File Funnel Repository
- Puck Blocks Config
- PublishedReader
- Payment Providers Registry
- Funnel Editor UI
- [id]/domains/route.ts
- Core DB Schema Migrations
- file-payment-store.ts
- Stripe Provider
- Funnel Schema and Theme
- Studio Pages
- Status log
- Supabase Funnel Repository
- webhook.ts
- actions.ts
- Payments DB Migrations
- Mock Payments
- Web TS Config
- repository.ts
- Funnel Runtime
- DomainsPanel.tsx
- status/route.ts
- Schema Migration
- Puck Screen Adapters
- Docker Compose
- Schema Package Manifest
- rate-limit.ts
- next
- Funnel Repository Interface
- PaymentsPanel.tsx
- Public Funnel Pages
- Draft Saving and Validation
- Repository Audit Doc
- maintenance.ts
- Run Storage
- Schema TS Config
- README
- templates.ts
- Security Doc
- runtime-context.tsx
- CheckoutPanel.tsx
- Data Flow Doc
- src/proxy.ts
- Architecture Doc
- resolveStorageMode
- RateLimiter
- Seed Funnel
- Deployment Doc
- registry.ts
- Root Layout
- C4 model
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- next.config.mjs

## God Nodes (most connected - your core abstractions)
1. `next` - 41 edges
2. `FileFunnelRepository` - 40 edges
3. `withStudio()` - 30 edges
4. `FunnelEditor()` - 29 edges
5. `Status log` - 29 edges
6. `SupabaseFunnelRepository` - 28 edges
7. `server-only` - 27 edges
8. `FunnelRepository` - 23 edges
9. `react` - 22 edges
10. `public.payments` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Known risks and open questions` --references--> `ScreenEditor()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/components/ScreenEditor.tsx
- `puck` --references--> `ScreenEditor()`  [INFERRED]
  docs/REPOSITORY_AUDIT.md → apps/web/src/components/ScreenEditor.tsx
- `Storage, auth and public read path (Stage 3)` --references--> `withStudio()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/server/api-helpers.ts
- `Component responsibilities` --references--> `withStudio()`  [INFERRED]
  docs/C4.md → apps/web/src/server/api-helpers.ts
- `Stage 3: Database and publishing` --references--> `SupabaseFunnelRepository`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → apps/web/src/server/supabase-funnel-repository.ts

## Import Cycles
- None detected.

## Communities (67 total, 12 thin omitted)

### Community 0 - "withStudio"
Cohesion: 0.05
Nodes (51): Context, DELETE(), dynamic, Context, dynamic, GET(), PUT(), saveSchema (+43 more)

### Community 1 - "Web App Dependencies"
Cohesion: 0.06
Nodes (45): dependencies, @funnel/schema@workspace:*, motion@14.7.1, next@16.4.3, posthog-js@1.441.2, posthog-node@5.59.0, @puckeditor/core@0.23.0, react@19.3.1 (+37 more)

### Community 2 - "Analytics and Consent"
Cohesion: 0.14
Nodes (26): isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent(), warn() (+18 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "Checkout and Status API"
Cohesion: 0.30
Nodes (13): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+5 more)

### Community 5 - "supabase-funnel-repository.ts"
Cohesion: 0.08
Nodes (31): parseDefinition(), DomainStatus, domainFileSchema, versionSummarySchema, DefinitionInvalidError, DomainCheck, DomainLimitError, ForbiddenError (+23 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.18
Nodes (5): FileFunnelRepository, isNotFound(), isRecord(), withRevision(), CustomDomain

### Community 7 - "Puck Blocks Config"
Cohesion: 0.08
Nodes (26): emailKey(), isValidEmail(), ALLOWED_COMPONENTS, ButtonBlock(), buttonProps, checkoutBlockProps, COMMON_BLOCKS, EmailInputBlock() (+18 more)

### Community 8 - "PublishedReader"
Cohesion: 0.22
Nodes (3): PublishedFunnel, PublishedReader, SupabasePublishedReader

### Community 9 - "Payment Providers Registry"
Cohesion: 0.16
Nodes (14): isMockEnabled(), MockProvider, getPaymentProvider(), SolidgateProvider, CheckoutInput, CheckoutResult, MockForbiddenError, PaymentEvent (+6 more)

### Community 10 - "Funnel Editor UI"
Cohesion: 0.13
Nodes (27): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+19 more)

### Community 11 - "[id]/domains/route.ts"
Cohesion: 0.23
Nodes (16): bodySchema, Context, dynamic, GET(), POST(), HOSTNAME_MAX_LENGTH, normalizeHostname(), domainTarget (+8 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.09
Nodes (34): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+26 more)

### Community 13 - "file-payment-store.ts"
Cohesion: 0.06
Nodes (38): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+30 more)

### Community 14 - "Stripe Provider"
Cohesion: 0.12
Nodes (13): getPlan(), PAYER_HASH_PATTERN, adjustmentMetadataSchema, metadataSchema, STRIPE_API_VERSION, StripeProvider, StripeProviderDeps, PlanPriceMismatchError (+5 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (38): AnimationSettings(), COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), ANIMATION_PRESETS, AnimationPreset (+30 more)

### Community 16 - "Studio Pages"
Cohesion: 0.21
Nodes (7): Device, PreviewPane(), FUNNELS_ROUTE, SLUG_INPUT_PATTERN, SLUG_MAX_LENGTH, SLUG_PATTERN, react

### Community 17 - "Status log"
Cohesion: 0.09
Nodes (32): Data model, Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 1: Minimal vertical slice (in progress), Stage 2: Components and logic, Stage 3: Database and publishing, Stage 6: Custom domains (+24 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.16
Nodes (7): DomainNotFoundError, DomainTakenError, FunnelNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel()

### Community 19 - "webhook.ts"
Cohesion: 0.20
Nodes (14): AnalyticsEmitter, getClient(), posthogServerAnalytics, warn(), serverAnalytics, isAdjustment(), emitAdjustment(), eventUuid() (+6 more)

### Community 20 - "actions.ts"
Cohesion: 0.18
Nodes (17): accountClientKey(), authenticate(), AuthFormState, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK (+9 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.09
Nodes (24): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+16 more)

### Community 22 - "Mock Payments"
Cohesion: 0.18
Nodes (15): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, formSchema (+7 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "repository.ts"
Cohesion: 0.19
Nodes (13): readSupabaseEnv(), requireSupabaseEnv(), StorageMode, SupabaseEnv, SESSION_COOKIE_OPTIONS, SessionResult, createSupabaseAnonClient(), createSupabaseServiceClient() (+5 more)

### Community 25 - "Funnel Runtime"
Cohesion: 0.19
Nodes (15): ConsentBanner(), contrastingForeground(), EmailBlock, emailBlocks(), foregroundForLuminance(), linearize(), loadUsableRun(), longestPathFrom() (+7 more)

### Community 26 - "DomainsPanel.tsx"
Cohesion: 0.08
Nodes (41): dynamic, NO_STORE, POST(), Summary, Context, dynamic, isDomainTaken(), POST() (+33 more)

### Community 27 - "status/route.ts"
Cohesion: 0.23
Nodes (14): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), dynamic, GET(), NO_STORE (+6 more)

### Community 28 - "Schema Migration"
Cohesion: 0.19
Nodes (12): DraftSaver, DefinitionCheck, isOlderDefinition(), parseInput(), clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition (+4 more)

### Community 29 - "Puck Screen Adapters"
Cohesion: 0.25
Nodes (14): PUCK_OVERRIDES, ScreenEditor(), ScreenEditorProps, applyOptionMode(), blockId(), fromPuckData(), OptionRef, PuckItem (+6 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "rate-limit.ts"
Cohesion: 0.18
Nodes (13): AuthKeys, register(), requireAppUrlInProduction(), Bucket, clientIpHeader(), clientKeyFromHeaders(), defaultLimiter, DIRECT_KEY (+5 more)

### Community 33 - "next"
Cohesion: 0.15
Nodes (10): dynamic, dynamic, EditFunnelPage(), dynamic, StudioPage(), DeleteFunnelButton(), NewFunnelForm(), slugify() (+2 more)

### Community 35 - "PaymentsPanel.tsx"
Cohesion: 0.20
Nodes (13): describe(), formatDate(), formatMoney(), Payment, paymentSchema, PaymentsPanel(), responseSchema, formatDate() (+5 more)

### Community 36 - "Public Funnel Pages"
Cohesion: 0.26
Nodes (12): CustomDomainFunnelPage(), dynamic, dynamic, PublishedFunnelPage(), FunnelRuntime(), ReturnParams, providerRefSchema, screenIdSchema (+4 more)

### Community 37 - "Draft Saving and Validation"
Cohesion: 0.17
Nodes (15): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+7 more)

### Community 38 - "Repository Audit Doc"
Cohesion: 0.14
Nodes (14): coolify, License table, Method, motion, Not integrated / rejected, posthog, puck, react-sdk (Solidgate) (+6 more)

### Community 39 - "maintenance.ts"
Cohesion: 0.16
Nodes (9): domainStatusSchema, resultSchema, rowSchema, SupabaseDomainMaintenance, toDomain(), DomainMaintenance, RecheckOutcome, RecheckResult (+1 more)

### Community 41 - "Run Storage"
Cohesion: 0.32
Nodes (11): adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN, runIdKey(), saveRun() (+3 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "templates.ts"
Cohesion: 0.30
Nodes (13): randomId(), newOptionId(), checkoutBlock(), createScreenContent(), heading(), nextButton(), optionList(), paragraph() (+5 more)

### Community 45 - "Security Doc"
Cohesion: 0.18
Nodes (11): ServerOnlyAnalyticsEvent, Custom domains, Operational, Privacy and analytics, Response headers, Runtime safety, Secrets policy, Security (+3 more)

### Community 46 - "runtime-context.tsx"
Cohesion: 0.26
Nodes (11): AnswerSummaryItem, defaultApi, RuntimeApi, RuntimeContext, advance(), HistoryEntry, MAX_RUN_HISTORY, RunState (+3 more)

### Community 47 - "CheckoutPanel.tsx"
Cohesion: 0.21
Nodes (12): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult, CheckoutPanel(), checkoutResponse, EmbeddedView() (+4 more)

### Community 48 - "Data Flow Doc"
Cohesion: 0.22
Nodes (9): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 4. Checkout, webhook, status, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+1 more)

### Community 49 - "src/proxy.ts"
Cohesion: 0.28
Nodes (11): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+3 more)

### Community 50 - "Architecture Doc"
Cohesion: 0.20
Nodes (10): Animation, Architecture, Deployment (Stage 5), Goals and non-goals, Known risks and open questions, Module boundaries, Repository layout, Stack (+2 more)

### Community 51 - "resolveStorageMode"
Cohesion: 0.33
Nodes (8): LoginForm(), dynamic, firstValue(), LoginPage(), dynamic, PreviewPage(), resolveStorageMode(), getStudioContext

### Community 53 - "Seed Funnel"
Cohesion: 0.22
Nodes (13): retypeEdges(), RetypeResult, Edge, isQuizType(), Screen, button(), createSeedFunnel(), heading() (+5 more)

### Community 55 - "Deployment Doc"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 56 - "registry.ts"
Cohesion: 0.17
Nodes (16): dynamic, NO_STORE, POST(), Context, dynamic, GET(), POST(), dynamic (+8 more)

### Community 60 - "C4 model"
Cohesion: 0.67
Nodes (3): C4 model, Level 1: System context, Level 2: Containers

### Community 68 - "next.config.mjs"
Cohesion: 0.33
Nodes (4): devOrigins, nextConfig, privateHeaders, securityHeaders

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `withStudio`, `Web App Dependencies`, `Checkout and Status API`, `Public Funnel Pages`, `Root Layout`, `Puck Blocks Config`, `Funnel Editor UI`, `[id]/domains/route.ts`, `Studio Pages`, `src/proxy.ts`, `resolveStorageMode`, `actions.ts`, `Mock Payments`, `registry.ts`, `repository.ts`, `DomainsPanel.tsx`, `status/route.ts`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Stage 1: Minimal vertical slice (in progress)`) actually correct?**
  _`FileFunnelRepository` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `withStudio` be split into smaller, more focused modules?**
  _Cohesion score 0.05406746031746032 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `Payment Providers Registry` to `withStudio`, `Web App Dependencies`, `rate-limit.ts`, `DomainsPanel.tsx`, `Checkout and Status API`, `supabase-funnel-repository.ts`, `maintenance.ts`, `[id]/domains/route.ts`, `file-payment-store.ts`, `Stripe Provider`, `webhook.ts`, `repository.ts`, `registry.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `withStudio()` (e.g. with `Storage, auth and public read path (Stage 3)` and `Component responsibilities`) actually correct?**
  _`withStudio()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Web App Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.057971014492753624 - nodes in this community are weakly interconnected._
- **Why does `Status log` connect `Status log` to `withStudio`, `Analytics and Consent`, `Public Funnel Pages`, `supabase-funnel-repository.ts`, `PublishedReader`, `Payment Providers Registry`, `templates.ts`, `file-payment-store.ts`, `Stripe Provider`, `CheckoutPanel.tsx`, `webhook.ts`, `actions.ts`, `RateLimiter`, `Seed Funnel`, `repository.ts`, `Puck Screen Adapters`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._