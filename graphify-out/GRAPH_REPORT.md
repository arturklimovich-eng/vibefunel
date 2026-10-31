# Graph Report - funnel-platform  (2026-10-31)

## Corpus Check
- 165 files · ~84,671 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 1418 nodes · 3487 edges · 81 communities (67 shown, 14 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 268 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6c31768a`
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
- Status log
- Payment Providers Registry
- Funnel Editor UI
- file-payment-store.ts
- Core DB Schema Migrations
- supabase-payment-store.ts
- Stripe Provider
- Funnel Schema and Theme
- index.ts
- validate.ts
- Supabase Funnel Repository
- webhook.ts
- actions.ts
- Payments DB Migrations
- mock/webhook/route.ts
- Web TS Config
- resolveStorageMode
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
- login/page.tsx
- RateLimiter
- Seed Funnel
- FilePaymentStore
- Deployment Doc
- registry.ts
- Root Layout
- Steps
- store.ts
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- docs.ts
- ThemeEditor.tsx
- Implementation Plan
- PaymentStore
- Steps
- Feature map
- Custom domains
- Analytics and consent
- Public runtime
- Checkout
- Auth and access
- health/route.ts

## God Nodes (most connected - your core abstractions)
1. `next` - 43 edges
2. `FileFunnelRepository` - 41 edges
3. `withStudio()` - 32 edges
4. `FunnelEditor()` - 30 edges
5. `SupabaseFunnelRepository` - 29 edges
6. `Status log` - 29 edges
7. `server-only` - 28 edges
8. `react` - 23 edges
9. `FunnelRepository` - 23 edges
10. `FunnelDefinition` - 22 edges

## Surprising Connections (you probably didn't know these)
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `puck` --references--> `ScreenEditor()`  [INFERRED]
  docs/REPOSITORY_AUDIT.md → apps/web/src/components/ScreenEditor.tsx
- `Step: Autosave draft` --references--> `useDraftSaver()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/lib/use-draft-saver.ts
- `Storage, auth and public read path (Stage 3)` --references--> `withStudio()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/server/api-helpers.ts
- `Component responsibilities` --references--> `withStudio()`  [INFERRED]
  docs/C4.md → apps/web/src/server/api-helpers.ts

## Import Cycles
- None detected.

## Communities (81 total, 14 thin omitted)

### Community 0 - "withStudio"
Cohesion: 0.06
Nodes (41): Context, DELETE(), dynamic, Context, dynamic, GET(), PUT(), saveSchema (+33 more)

### Community 1 - "Web App Dependencies"
Cohesion: 0.05
Nodes (49): dependencies, @funnel/schema@workspace:*, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2, posthog-node@5.59.0 (+41 more)

### Community 2 - "Analytics and Consent"
Cohesion: 0.08
Nodes (40): ConsentBanner(), isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent() (+32 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "Checkout and Status API"
Cohesion: 0.22
Nodes (20): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+12 more)

### Community 5 - "supabase-funnel-repository.ts"
Cohesion: 0.07
Nodes (33): DomainStatus, domainFileSchema, isNotFound(), versionSummarySchema, DefinitionInvalidError, DomainCheck, DomainLimitError, ForbiddenError (+25 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.18
Nodes (3): FileFunnelRepository, isRecord(), withRevision()

### Community 7 - "Puck Blocks Config"
Cohesion: 0.09
Nodes (24): emailKey(), isValidEmail(), ALLOWED_COMPONENTS, ButtonBlock(), buttonProps, checkoutBlockProps, COMMON_BLOCKS, EmailInputBlock() (+16 more)

### Community 8 - "Status log"
Cohesion: 0.23
Nodes (14): retypeEdges(), RetypeResult, Step: Screen routing, Status log, matches(), nextScreen(), NextScreenOptions, own() (+6 more)

### Community 9 - "Payment Providers Registry"
Cohesion: 0.16
Nodes (16): isMockEnabled(), MockProvider, getPaymentProvider(), SolidgateProvider, CheckoutInput, CheckoutResult, MockForbiddenError, PaymentEvent (+8 more)

### Community 10 - "Funnel Editor UI"
Cohesion: 0.14
Nodes (26): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+18 more)

### Community 11 - "file-payment-store.ts"
Cohesion: 0.16
Nodes (14): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), fileSchema, findAdjustmentTarget(), isNotFound() (+6 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.09
Nodes (34): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+26 more)

### Community 13 - "supabase-payment-store.ts"
Cohesion: 0.14
Nodes (12): AdjustmentResult, RecordResult, accessRowSchema, funnelPaymentRowSchema, projectRowSchema, rowRevocation(), statusRowSchema, statusSchema (+4 more)

### Community 14 - "Stripe Provider"
Cohesion: 0.13
Nodes (11): PAYER_HASH_PATTERN, adjustmentMetadataSchema, metadataSchema, STRIPE_API_VERSION, StripeProvider, StripeProviderDeps, PlanPriceMismatchError, ProviderNotConfiguredError (+3 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.07
Nodes (30): AnimationSettings(), ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, edgeSchema, funnelSchema (+22 more)

### Community 16 - "index.ts"
Cohesion: 0.39
Nodes (6): NewFunnelForm(), slugify(), FUNNELS_ROUTE, SLUG_INPUT_PATTERN, SLUG_MAX_LENGTH, SLUG_PATTERN

### Community 17 - "validate.ts"
Cohesion: 0.17
Nodes (15): getOptionLists(), isFallbackEdge(), isPaymentScreen(), isQuiz(), IssueCode, IssueSeverity, OptionListInfo, OptionListScan (+7 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.14
Nodes (11): CustomDomain, DomainNotFoundError, DomainTakenError, FunnelDraft, FunnelNotFoundError, RevisionConflictError, VersionSummary, fail() (+3 more)

### Community 19 - "webhook.ts"
Cohesion: 0.22
Nodes (13): isAdjustment(), PaymentAdjustment, emitAdjustment(), eventUuid(), isNamed(), processAdjustment(), processWebhook(), recordVerifiedEvent() (+5 more)

### Community 20 - "actions.ts"
Cohesion: 0.20
Nodes (18): accountClientKey(), authenticate(), credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK, releaseSignInFailure() (+10 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.09
Nodes (24): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+16 more)

### Community 22 - "mock/webhook/route.ts"
Cohesion: 0.12
Nodes (25): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, formSchema (+17 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "resolveStorageMode"
Cohesion: 0.36
Nodes (7): readSupabaseEnv(), requireSupabaseEnv(), resolveStorageMode(), SupabaseEnv, SESSION_COOKIE_OPTIONS, SessionResult, @supabase/ssr

### Community 25 - "Funnel Runtime"
Cohesion: 0.15
Nodes (21): dynamic, PreviewPage(), contrastingForeground(), EmailBlock, emailBlocks(), foregroundForLuminance(), FunnelRuntime(), linearize() (+13 more)

### Community 26 - "DomainsPanel.tsx"
Cohesion: 0.06
Nodes (64): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), Context, dynamic, isDomainTaken() (+56 more)

### Community 27 - "status/route.ts"
Cohesion: 0.21
Nodes (14): dynamic, GET(), NO_STORE, querySchema, checkRateLimit(), clientKey(), ipLimit(), toPublicPaymentStatus() (+6 more)

### Community 28 - "Schema Migration"
Cohesion: 0.21
Nodes (11): checkDefinition(), DefinitionCheck, isOlderDefinition(), parseInput(), Step: Validate definition, clampScreenAnimation(), isRecord(), MIGRATIONS (+3 more)

### Community 29 - "Puck Screen Adapters"
Cohesion: 0.24
Nodes (13): PUCK_OVERRIDES, ScreenEditor(), ScreenEditorProps, applyOptionMode(), fromPuckData(), OptionRef, PuckItem, configForScreenType() (+5 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "rate-limit.ts"
Cohesion: 0.23
Nodes (10): AuthKeys, register(), requireAppUrlInProduction(), Bucket, clientIpHeader(), clientKeyFromHeaders(), defaultLimiter, DIRECT_KEY (+2 more)

### Community 33 - "next"
Cohesion: 0.14
Nodes (15): DocsIndexPage(), dynamic, DocPage(), dynamic, dynamic, EditFunnelPage(), dynamic, StudioPage() (+7 more)

### Community 34 - "Funnel Repository Interface"
Cohesion: 0.12
Nodes (5): StorageMode, FunnelRepository, StudioContext, Funnel, FunnelVersion

### Community 35 - "PaymentsPanel.tsx"
Cohesion: 0.12
Nodes (18): react@19.3.1, describe(), formatDate(), formatMoney(), Payment, paymentSchema, PaymentsPanel(), responseSchema (+10 more)

### Community 36 - "Public Funnel Pages"
Cohesion: 0.22
Nodes (11): dynamic, PublishedFunnelPage(), ACCESS_SUSPENDING_DISPUTES, providerRefSchema, PublicPaymentStatus, REVIEW_REASONS, runIdSchema, screenIdSchema (+3 more)

### Community 37 - "Draft Saving and Validation"
Cohesion: 0.15
Nodes (17): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+9 more)

### Community 38 - "Repository Audit Doc"
Cohesion: 0.14
Nodes (14): coolify, License table, Method, motion, Not integrated / rejected, posthog, puck, react-sdk (Solidgate) (+6 more)

### Community 39 - "maintenance.ts"
Cohesion: 0.13
Nodes (12): domainStatusSchema, createSupabaseServiceClient(), MissingServiceKeyError, resultSchema, rowSchema, SupabaseDomainMaintenance, toDomain(), DomainMaintenance (+4 more)

### Community 41 - "Run Storage"
Cohesion: 0.24
Nodes (16): loadUsableRun(), randomId(), adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN (+8 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "templates.ts"
Cohesion: 0.41
Nodes (11): checkoutBlock(), createScreenContent(), heading(), nextButton(), optionList(), paragraph(), priceCard(), PuckItem (+3 more)

### Community 45 - "Security Doc"
Cohesion: 0.22
Nodes (9): Custom domains, Operational, Response headers, Runtime safety, Secrets policy, Security, Stage 3 implementation: auth, RLS, public read, Tenant isolation (+1 more)

### Community 46 - "runtime-context.tsx"
Cohesion: 0.22
Nodes (13): AnswerSummaryItem, defaultApi, RuntimeApi, RuntimeContext, advance(), HistoryEntry, MAX_RUN_HISTORY, retreat() (+5 more)

### Community 47 - "CheckoutPanel.tsx"
Cohesion: 0.21
Nodes (12): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult, CheckoutPanel(), checkoutResponse, EmbeddedView() (+4 more)

### Community 48 - "Data Flow Doc"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 4. Checkout, webhook, status, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication (+2 more)

### Community 49 - "src/proxy.ts"
Cohesion: 0.23
Nodes (17): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+9 more)

### Community 50 - "Architecture Doc"
Cohesion: 0.22
Nodes (9): Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Repository layout, Stack, Storage, auth and public read path (Stage 3) (+1 more)

### Community 51 - "login/page.tsx"
Cohesion: 0.36
Nodes (6): AuthFormState, initialState, LoginForm(), dynamic, firstValue(), LoginPage()

### Community 52 - "RateLimiter"
Cohesion: 0.21
Nodes (7): RateLimiter, C4 model, Component responsibilities, Import-graph edges (value imports, grouped), Level 1: System context, Level 2: Containers, Level 3: Components of the web app

### Community 53 - "Seed Funnel"
Cohesion: 0.39
Nodes (8): button(), createSeedFunnel(), heading(), options(), paragraph(), puck(), PuckItem, skipButton()

### Community 55 - "Deployment Doc"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 56 - "registry.ts"
Cohesion: 0.13
Nodes (23): dynamic, NO_STORE, POST(), Summary, dynamic, NO_STORE, POST(), Context (+15 more)

### Community 59 - "Steps"
Cohesion: 0.15
Nodes (13): Flow, Refunds and disputes, Related, Step: Apply adjustment, Step: Apply deferred, Step: Daily report, Step: Defer adjustment, Step: Match payment (+5 more)

### Community 60 - "store.ts"
Cohesion: 0.32
Nodes (9): FunnelPayment, RecordRejection, StaleDeferred, StatusDetail, StatusQuery, PaymentReason, PaymentRevocation, PaymentStatus (+1 more)

### Community 68 - "docs.ts"
Cohesion: 0.12
Nodes (10): devOrigins, nextConfig, privateHeaders, securityHeaders, DocEntry, DocGroup, listFeatures(), readOptional() (+2 more)

### Community 69 - "ThemeEditor.tsx"
Cohesion: 0.24
Nodes (9): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE (+1 more)

### Community 71 - "Implementation Plan"
Cohesion: 0.25
Nodes (8): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 2: Components and logic, Stage 3: Database and publishing, Stage 6: Custom domains, Stage overview, Verification commands (all stages)

### Community 73 - "Steps"
Cohesion: 0.29
Nodes (7): Flow, Related, Step: Autosave draft, Step: Rollback, Steps, Studio authoring, What it does

### Community 74 - "Feature map"
Cohesion: 0.40
Nodes (5): Background jobs, Feature map, How a funnel lives, Keeping these pages current, Map

### Community 75 - "Custom domains"
Cohesion: 0.40
Nodes (5): Custom domains, Domain status, Flow, Related, What it does

### Community 76 - "Analytics and consent"
Cohesion: 0.40
Nodes (5): Analytics and consent, Flow, Related, What is and is not sent, What it does

### Community 77 - "Public runtime"
Cohesion: 0.50
Nodes (4): Flow, Public runtime, Related, What it does

### Community 78 - "Checkout"
Cohesion: 0.50
Nodes (4): Checkout, Flow, Related, What it does

### Community 79 - "Auth and access"
Cohesion: 0.50
Nodes (4): Auth and access, Flow, Related, What it does

## Knowledge Gaps
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `withStudio`, `Web App Dependencies`, `Checkout and Status API`, `supabase-funnel-repository.ts`, `Puck Blocks Config`, `Funnel Editor UI`, `index.ts`, `actions.ts`, `mock/webhook/route.ts`, `resolveStorageMode`, `Funnel Runtime`, `DomainsPanel.tsx`, `status/route.ts`, `Public Funnel Pages`, `src/proxy.ts`, `login/page.tsx`, `registry.ts`, `Root Layout`, `health/route.ts`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `withStudio` be split into smaller, more focused modules?**
  _Cohesion score 0.0611764705882353 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `registry.ts` to `rate-limit.ts`, `Web App Dependencies`, `Analytics and Consent`, `docs.ts`, `supabase-funnel-repository.ts`, `Checkout and Status API`, `maintenance.ts`, `Payment Providers Registry`, `file-payment-store.ts`, `supabase-payment-store.ts`, `Stripe Provider`, `webhook.ts`, `mock/webhook/route.ts`, `resolveStorageMode`, `DomainsPanel.tsx`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `withStudio()` (e.g. with `Storage, auth and public read path (Stage 3)` and `Component responsibilities`) actually correct?**
  _`withStudio()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `Web App Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.054693877551020405 - nodes in this community are weakly interconnected._
- **Why does `Status log` connect `Status log` to `Analytics and Consent`, `supabase-funnel-repository.ts`, `Implementation Plan`, `maintenance.ts`, `Run Storage`, `Payment Providers Registry`, `PaymentStore`, `Schema Migration`, `Stripe Provider`, `CheckoutPanel.tsx`, `validate.ts`, `webhook.ts`, `actions.ts`, `RateLimiter`, `Funnel Runtime`, `store.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._