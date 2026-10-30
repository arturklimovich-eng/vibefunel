# Graph Report - funnel-platform  (2026-10-30)

## Corpus Check
- 149 files · ~72,338 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 5, .graphify-bak 1)

## Summary
- 1259 nodes · 3037 edges · 72 communities (61 shown, 11 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 100 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `25236f7c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- withStudio
- Web App Dependencies
- Analytics and Consent
- Root Tooling and Lint
- Checkout and Status API
- file-funnel-repository.ts
- File Funnel Repository
- Puck Blocks Config
- supabase-funnel-repository.ts
- Payment Providers Registry
- Funnel Editor UI
- [id]/domains/route.ts
- Core DB Schema Migrations
- file-payment-store.ts
- Stripe Provider
- Funnel Schema and Theme
- Studio Pages
- validate.ts
- Supabase Funnel Repository
- webhook.ts
- actions.ts
- Payments DB Migrations
- Mock Payments
- Web TS Config
- stripe-provider.ts
- Funnel Runtime
- domains.ts
- events.ts
- Schema Migration
- Puck Screen Adapters
- Docker Compose
- Schema Package Manifest
- verify.ts
- next
- Funnel Repository Interface
- Versions and Preview
- Public Funnel Pages
- Draft Saving and Validation
- Repository Audit Doc
- cron/domains/route.ts
- Run Storage
- Schema TS Config
- README
- parseJsonBody
- Security Doc
- runtime-context.tsx
- ThemeEditor.tsx
- Data Flow Doc
- publish/route.ts
- Architecture Doc
- DomainsPanel.tsx
- Implementation Plan Doc
- Seed Funnel
- Status log
- Deployment Doc
- repository.ts
- Root Layout
- retype-edges.ts
- C4 model
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- next.config.mjs
- draft/route.ts
- [id]/route.ts
- plans/route.ts

## God Nodes (most connected - your core abstractions)
1. `next` - 40 edges
2. `FileFunnelRepository` - 40 edges
3. `Status log` - 29 edges
4. `FunnelEditor()` - 28 edges
5. `withStudio()` - 28 edges
6. `SupabaseFunnelRepository` - 28 edges
7. `server-only` - 27 edges
8. `FunnelRepository` - 23 edges
9. `public.payments` - 22 edges
10. `react` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Storage, auth and public read path (Stage 3)` --references--> `withStudio()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/server/api-helpers.ts
- `Component responsibilities` --references--> `withStudio()`  [INFERRED]
  docs/C4.md → apps/web/src/server/api-helpers.ts
- `Stage 3: Database and publishing` --references--> `SupabaseFunnelRepository`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → apps/web/src/server/supabase-funnel-repository.ts
- `Versioning` --references--> `FunnelVersion`  [INFERRED]
  docs/ARCHITECTURE.md → packages/funnel-schema/src/schema.ts
- `Status log` --references--> `safeNext()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → apps/web/src/app/auth/actions.ts

## Import Cycles
- None detected.

## Communities (72 total, 11 thin omitted)

### Community 0 - "withStudio"
Cohesion: 0.17
Nodes (12): Context, DELETE(), dynamic, Context, dynamic, GET(), createSchema, dynamic (+4 more)

### Community 1 - "Web App Dependencies"
Cohesion: 0.06
Nodes (44): dependencies, @funnel/schema@workspace:*, motion@14.7.1, next@16.4.3, posthog-js@1.441.2, posthog-node@5.59.0, react@19.3.1, react-dom@19.3.1 (+36 more)

### Community 2 - "Analytics and Consent"
Cohesion: 0.23
Nodes (17): isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent(), warn() (+9 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "Checkout and Status API"
Cohesion: 0.19
Nodes (22): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), dynamic, GET(), NO_STORE (+14 more)

### Community 5 - "file-funnel-repository.ts"
Cohesion: 0.08
Nodes (27): DomainStatus, domainStatusSchema, isNamed(), mapRepositoryError(), resultSchema, rowSchema, SupabaseDomainMaintenance, toDomain() (+19 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.19
Nodes (4): FileFunnelRepository, CustomDomain, FunnelDraft, FunnelVersion

### Community 7 - "Puck Blocks Config"
Cohesion: 0.06
Nodes (50): emailKey(), isValidEmail(), randomId(), CheckoutPanel(), checkoutResponse, EmbeddedView(), fetchStatus(), isSafeRedirect() (+42 more)

### Community 8 - "supabase-funnel-repository.ts"
Cohesion: 0.08
Nodes (21): MAX_DOMAINS_PER_FUNNEL, ForbiddenError, PublishedFunnel, PublishedReader, parseStoredDefinition(), domainRowSchema, draftRowSchema, funnelRowSchema (+13 more)

### Community 9 - "Payment Providers Registry"
Cohesion: 0.16
Nodes (14): MockProvider, getPaymentProvider(), SolidgateProvider, CheckoutInput, CheckoutResult, MockForbiddenError, PaymentEvent, PaymentProvider (+6 more)

### Community 10 - "Funnel Editor UI"
Cohesion: 0.13
Nodes (28): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+20 more)

### Community 11 - "[id]/domains/route.ts"
Cohesion: 0.17
Nodes (21): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, Context, dynamic (+13 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.09
Nodes (34): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+26 more)

### Community 13 - "file-payment-store.ts"
Cohesion: 0.13
Nodes (15): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+7 more)

### Community 14 - "Stripe Provider"
Cohesion: 0.18
Nodes (6): getPlan(), StripeProvider, PlanPriceMismatchError, ProviderNotConfiguredError, RecurringPriceUnsupportedError, WebhookSignatureError

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.07
Nodes (29): AnimationSettings(), ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, edgeSchema, funnelSchema (+21 more)

### Community 16 - "Studio Pages"
Cohesion: 0.26
Nodes (9): dynamic, StudioPage(), DeleteFunnelButton(), NewFunnelForm(), slugify(), FUNNELS_ROUTE, SLUG_INPUT_PATTERN, SLUG_MAX_LENGTH (+1 more)

### Community 17 - "validate.ts"
Cohesion: 0.18
Nodes (14): getOptionLists(), isFallbackEdge(), isPaymentScreen(), IssueCode, IssueSeverity, OptionListInfo, OptionListScan, optionListSchema (+6 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.16
Nodes (7): DomainNotFoundError, DomainTakenError, FunnelNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel()

### Community 19 - "webhook.ts"
Cohesion: 0.16
Nodes (11): PaymentStore, isAdjustment(), WebhookEvent, emitAdjustment(), eventUuid(), isNamed(), processAdjustment(), processWebhook() (+3 more)

### Community 20 - "actions.ts"
Cohesion: 0.05
Nodes (55): accountClientKey(), authenticate(), AuthFormState, AuthKeys, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError() (+47 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.09
Nodes (24): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+16 more)

### Community 22 - "Mock Payments"
Cohesion: 0.12
Nodes (25): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, formSchema (+17 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "stripe-provider.ts"
Cohesion: 0.11
Nodes (20): PAYER_HASH_PATTERN, AdjustmentResult, RecordRejection, RecordResult, StaleDeferred, StatusDetail, StatusQuery, adjustmentMetadataSchema (+12 more)

### Community 25 - "Funnel Runtime"
Cohesion: 0.19
Nodes (16): ConsentBanner(), contrastingForeground(), EmailBlock, emailBlocks(), foregroundForLuminance(), linearize(), longestPathFrom(), parseChannel() (+8 more)

### Community 26 - "domains.ts"
Cohesion: 0.14
Nodes (17): Context, dynamic, isDomainTaken(), POST(), GET(), DomainCheckResponse, domainCheckResponseSchema, DomainInstructions (+9 more)

### Community 27 - "events.ts"
Cohesion: 0.16
Nodes (14): AnalyticsEmitter, AnalyticsEvent, AnalyticsEventName, AnalyticsProperties, AnalyticsPropertyValue, AnalyticsSource, EmitOptions, PropertyOptions (+6 more)

### Community 28 - "Schema Migration"
Cohesion: 0.23
Nodes (10): checkDefinition(), DefinitionCheck, isOlderDefinition(), parseInput(), clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition (+2 more)

### Community 29 - "Puck Screen Adapters"
Cohesion: 0.19
Nodes (16): @puckeditor/core@0.23.0, PUCK_OVERRIDES, ScreenEditor(), ScreenEditorProps, applyOptionMode(), fromPuckData(), OptionRef, PuckItem (+8 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "verify.ts"
Cohesion: 0.23
Nodes (13): RoutingStatus, checkDomainDns(), checkDomainOwnership(), checkOwnership(), checkRouting(), configuredDnsServers(), describe(), DnsCheckResult (+5 more)

### Community 33 - "next"
Cohesion: 0.19
Nodes (5): dynamic, dynamic, EditFunnelPage(), StudioHeader(), next

### Community 35 - "Versions and Preview"
Cohesion: 0.19
Nodes (8): Device, PreviewPane(), formatDate(), VersionsPanel(), VersionsResponse, versionsResponseSchema, funnelRoutes, react

### Community 36 - "Public Funnel Pages"
Cohesion: 0.20
Nodes (14): CustomDomainFunnelPage(), dynamic, dynamic, PublishedFunnelPage(), dynamic, PreviewPage(), FunnelRuntime(), parseDefinition() (+6 more)

### Community 37 - "Draft Saving and Validation"
Cohesion: 0.16
Nodes (16): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+8 more)

### Community 38 - "Repository Audit Doc"
Cohesion: 0.15
Nodes (13): coolify, License table, Method, motion, Not integrated / rejected, posthog, react-sdk (Solidgate), react-stripe-js (+5 more)

### Community 39 - "cron/domains/route.ts"
Cohesion: 0.22
Nodes (9): dynamic, NO_STORE, POST(), Summary, dynamic, NO_STORE, POST(), cronAuthorized() (+1 more)

### Community 41 - "Run Storage"
Cohesion: 0.25
Nodes (13): loadUsableRun(), MAX_RUN_HISTORY, adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN (+5 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "parseJsonBody"
Cohesion: 0.22
Nodes (10): Context, dynamic, POST(), rollbackSchema, invalid(), ParsedBody, parseJsonBody(), BodyResult (+2 more)

### Community 45 - "Security Doc"
Cohesion: 0.18
Nodes (11): ServerOnlyAnalyticsEvent, Custom domains, Operational, Privacy and analytics, Response headers, Runtime safety, Secrets policy, Security (+3 more)

### Community 46 - "runtime-context.tsx"
Cohesion: 0.29
Nodes (10): AnswerSummaryItem, defaultApi, RuntimeApi, RuntimeContext, advance(), HistoryEntry, RunState, withoutScreen() (+2 more)

### Community 47 - "ThemeEditor.tsx"
Cohesion: 0.24
Nodes (9): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE (+1 more)

### Community 48 - "Data Flow Doc"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 4. Checkout, webhook, status, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication (+2 more)

### Community 49 - "publish/route.ts"
Cohesion: 0.32
Nodes (7): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), loadPlans(), parsePlans()

### Community 50 - "Architecture Doc"
Cohesion: 0.22
Nodes (9): Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Repository layout, Stack, Storage, auth and public read path (Stage 3) (+1 more)

### Community 51 - "DomainsPanel.tsx"
Cohesion: 0.43
Nodes (7): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), readJson()

### Community 52 - "Implementation Plan Doc"
Cohesion: 0.25
Nodes (8): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 2: Components and logic, Stage 3: Database and publishing, Stage 6: Custom domains, Stage overview, Verification commands (all stages)

### Community 53 - "Seed Funnel"
Cohesion: 0.39
Nodes (8): button(), createSeedFunnel(), heading(), options(), paragraph(), puck(), PuckItem, skipButton()

### Community 54 - "Status log"
Cohesion: 0.46
Nodes (7): Status log, matches(), nextScreen(), NextScreenOptions, own(), isPaymentType(), isSkipType()

### Community 55 - "Deployment Doc"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 56 - "repository.ts"
Cohesion: 0.33
Nodes (9): dynamic, POST(), getPaymentStore(), getStripeProvider(), globalForPayments, getDataDir(), getFileRepository(), globalForRepo (+1 more)

### Community 59 - "retype-edges.ts"
Cohesion: 0.38
Nodes (6): retypeEdges(), RetypeResult, Edge, isQuizType(), Screen, isQuiz()

### Community 60 - "C4 model"
Cohesion: 0.67
Nodes (3): C4 model, Level 1: System context, Level 2: Containers

### Community 68 - "next.config.mjs"
Cohesion: 0.33
Nodes (4): devOrigins, nextConfig, privateHeaders, securityHeaders

### Community 69 - "draft/route.ts"
Cohesion: 0.33
Nodes (5): Context, dynamic, GET(), PUT(), saveSchema

### Community 70 - "[id]/route.ts"
Cohesion: 0.50
Nodes (3): Context, DELETE(), dynamic

### Community 71 - "plans/route.ts"
Cohesion: 0.67
Nodes (3): dynamic, GET(), listPublicPlans()

## Knowledge Gaps
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `withStudio`, `Web App Dependencies`, `Checkout and Status API`, `file-funnel-repository.ts`, `Puck Blocks Config`, `Funnel Editor UI`, `[id]/domains/route.ts`, `Studio Pages`, `actions.ts`, `Mock Payments`, `domains.ts`, `Public Funnel Pages`, `cron/domains/route.ts`, `parseJsonBody`, `publish/route.ts`, `repository.ts`, `Root Layout`, `draft/route.ts`, `[id]/route.ts`, `plans/route.ts`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Stage 1: Minimal vertical slice (in progress)`) actually correct?**
  _`FileFunnelRepository` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Web App Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0595959595959596 - nodes in this community are weakly interconnected._
- **Why does `Status log` connect `Status log` to `Analytics and Consent`, `Public Funnel Pages`, `Puck Blocks Config`, `supabase-funnel-repository.ts`, `Payment Providers Registry`, `retype-edges.ts`, `Stripe Provider`, `validate.ts`, `webhook.ts`, `Implementation Plan Doc`, `actions.ts`, `stripe-provider.ts`, `Funnel Runtime`, `events.ts`, `Schema Migration`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Status log` (e.g. with `safeNext()` and `FunnelRuntime()`) actually correct?**
  _`Status log` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Should `Root Tooling and Lint` be split into smaller, more focused modules?**
  _Cohesion score 0.07357357357357357 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `repository.ts` to `verify.ts`, `Web App Dependencies`, `Checkout and Status API`, `file-funnel-repository.ts`, `cron/domains/route.ts`, `supabase-funnel-repository.ts`, `Payment Providers Registry`, `[id]/domains/route.ts`, `file-payment-store.ts`, `webhook.ts`, `actions.ts`, `Mock Payments`, `stripe-provider.ts`, `domains.ts`, `events.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._