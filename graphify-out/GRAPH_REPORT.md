# Graph Report - funnel-platform  (2026-10-31)

## Corpus Check
- 179 files · ~89,153 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 1499 nodes · 3728 edges · 79 communities (68 shown, 11 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 296 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ca153ec6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- api-helpers.ts
- Web App Dependencies
- Analytics and Consent
- Root Tooling and Lint
- Checkout and Status API
- supabase-funnel-repository.ts
- File Funnel Repository
- Puck Blocks Config
- leads/registry.ts
- Payment Providers Registry
- Funnel Editor UI
- file-payment-store.ts
- Core DB Schema Migrations
- actions.ts
- Stripe Provider
- Funnel Schema and Theme
- index.ts
- validate.ts
- Supabase Funnel Repository
- webhook.ts
- email.ts
- Payments DB Migrations
- mock/webhook/route.ts
- Web TS Config
- repository.ts
- RuntimeInner
- ref_zod
- api/leads/route.ts
- migrate
- Puck Screen Adapters
- Docker Compose
- Schema Package Manifest
- getPublishedReader
- next
- Funnel Repository Interface
- funnelRoutes
- status/route.ts
- Draft Saving and Validation
- Repository Audit Doc
- file-funnel-repository.ts
- Run Storage
- Schema TS Config
- README
- templates.ts
- Implementation Plan
- FunnelRuntime.tsx
- CheckoutPanel.tsx
- Data Flow Doc
- src/proxy.ts
- Architecture
- getPaymentStore
- [id]/leads/route.ts
- Seed Funnel
- Status log
- Deployment Doc
- draft/route.ts
- Docs Index
- Root Layout
- Steps
- store.ts
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- docs.ts
- ThemeEditor.tsx
- health/route.ts
- withStudio
- Feature map
- Custom domains
- Analytics and consent
- Checkout
- leads.ts
- Lead capture

## God Nodes (most connected - your core abstractions)
1. `next` - 46 edges
2. `FileFunnelRepository` - 41 edges
3. `withStudio()` - 36 edges
4. `server-only` - 32 edges
5. `FunnelEditor()` - 31 edges
6. `SupabaseFunnelRepository` - 29 edges
7. `Status log` - 29 edges
8. `react` - 24 edges
9. `getPublishedReader()` - 24 edges
10. `FunnelRepository` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Stage 5: Analytics and publishing operations` --references--> `ConsentBanner()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → apps/web/src/components/ConsentBanner.tsx
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Storage, auth and public read path (Stage 3)` --references--> `withStudio()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/server/api-helpers.ts
- `Component responsibilities` --references--> `withStudio()`  [INFERRED]
  docs/C4.md → apps/web/src/server/api-helpers.ts
- `Step: Match payment` --references--> `FilePaymentStore`  [INFERRED]
  docs/features/40-refunds-disputes.md → apps/web/src/server/payments/file-payment-store.ts

## Import Cycles
- None detected.

## Communities (79 total, 11 thin omitted)

### Community 0 - "api-helpers.ts"
Cohesion: 0.14
Nodes (11): Context, DELETE(), dynamic, Context, DELETE(), dynamic, Context, dynamic (+3 more)

### Community 1 - "Web App Dependencies"
Cohesion: 0.05
Nodes (49): dependencies, @funnel/schema@workspace:*, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2, posthog-node@5.59.0 (+41 more)

### Community 2 - "Analytics and Consent"
Cohesion: 0.08
Nodes (44): ConsentBanner(), isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent() (+36 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "Checkout and Status API"
Cohesion: 0.29
Nodes (15): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), getPaymentProvider(), cookieNonces(), mergeRunCookie() (+7 more)

### Community 5 - "supabase-funnel-repository.ts"
Cohesion: 0.09
Nodes (17): DefinitionInvalidError, ForbiddenError, PublishedFunnel, PublishedReader, parseStoredDefinition(), domainRowSchema, draftRowSchema, funnelRowSchema (+9 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.18
Nodes (6): FileFunnelRepository, isRecord(), withRevision(), CustomDomain, FunnelDraft, FunnelVersion

### Community 7 - "Puck Blocks Config"
Cohesion: 0.09
Nodes (21): ALLOWED_COMPONENTS, ButtonBlock(), buttonProps, checkoutBlockProps, COMMON_BLOCKS, headingProps, ImageBlock(), imageProps (+13 more)

### Community 8 - "leads/registry.ts"
Cohesion: 0.11
Nodes (15): createSupabaseServiceClient(), MissingServiceKeyError, toDomain(), FileLeadStore, fileSchema, isNotFound(), LeadFile, recordSchema (+7 more)

### Community 9 - "Payment Providers Registry"
Cohesion: 0.14
Nodes (16): MockProvider, globalForPayments, SolidgateProvider, StripeProvider, CheckoutInput, CheckoutResult, MockForbiddenError, PaymentEvent (+8 more)

### Community 10 - "Funnel Editor UI"
Cohesion: 0.13
Nodes (27): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+19 more)

### Community 11 - "file-payment-store.ts"
Cohesion: 0.14
Nodes (16): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+8 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.08
Nodes (39): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+31 more)

### Community 13 - "actions.ts"
Cohesion: 0.16
Nodes (17): accountClientKey(), authenticate(), AuthFormState, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK (+9 more)

### Community 14 - "Stripe Provider"
Cohesion: 0.10
Nodes (17): Plan, PAYER_HASH_PATTERN, adjustmentMetadataSchema, metadataSchema, STRIPE_API_VERSION, StripeProviderDeps, ACCESS_SUSPENDING_DISPUTES, PlanPriceMismatchError (+9 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.07
Nodes (31): AnimationSettings(), RetypeResult, ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, Edge (+23 more)

### Community 16 - "index.ts"
Cohesion: 0.39
Nodes (6): NewFunnelForm(), slugify(), FUNNELS_ROUTE, SLUG_INPUT_PATTERN, SLUG_MAX_LENGTH, SLUG_PATTERN

### Community 17 - "validate.ts"
Cohesion: 0.16
Nodes (17): retypeEdges(), isQuizType(), getOptionLists(), isFallbackEdge(), isPaymentScreen(), isQuiz(), IssueCode, IssueSeverity (+9 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.14
Nodes (9): DomainCheck, DomainNotFoundError, DomainTakenError, FunnelNotFoundError, RevisionConflictError, fail(), SupabaseFunnelRepository, toDomain() (+1 more)

### Community 19 - "webhook.ts"
Cohesion: 0.09
Nodes (21): POST(), AnalyticsEmitter, getClient(), posthogServerAnalytics, warn(), serverAnalytics, PaymentStore, isAdjustment() (+13 more)

### Community 20 - "email.ts"
Cohesion: 0.33
Nodes (8): EmailBlock, emailBlocksOf(), EmailInputProps, emailKey(), isValidEmail(), EmailInputBlock(), LeadTarget, Step: Collect email and consent

### Community 21 - "Payments DB Migrations"
Cohesion: 0.09
Nodes (24): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+16 more)

### Community 22 - "mock/webhook/route.ts"
Cohesion: 0.12
Nodes (26): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, formSchema (+18 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "repository.ts"
Cohesion: 0.16
Nodes (19): @supabase/ssr@0.12.7, signOut(), register(), requireAppUrlInProduction(), readSupabaseEnv(), requireSupabaseEnv(), resolveStorageMode(), StorageMode (+11 more)

### Community 25 - "RuntimeInner"
Cohesion: 0.14
Nodes (18): dynamic, PublishedFunnelPage(), dynamic, PreviewPage(), FunnelRuntime(), longestPathFrom(), parseDefinition(), RuntimeInner() (+10 more)

### Community 26 - "ref_zod"
Cohesion: 0.05
Nodes (68): dynamic, NO_STORE, POST(), Summary, askSecretMatches(), dynamic, GET(), NO_STORE (+60 more)

### Community 27 - "api/leads/route.ts"
Cohesion: 0.22
Nodes (17): bodySchema, dynamic, POST(), rateLimited(), GET(), normalizeEmail(), resolveLeadTarget(), getLeadStore() (+9 more)

### Community 28 - "migrate"
Cohesion: 0.21
Nodes (12): DefinitionCheck, isOlderDefinition(), parseInput(), Step: Validate definition, clampScreenAnimation(), isRecord(), migrate(), MigrationError (+4 more)

### Community 29 - "Puck Screen Adapters"
Cohesion: 0.20
Nodes (16): PUCK_OVERRIDES, ScreenEditor(), ScreenEditorProps, applyOptionMode(), fromPuckData(), OptionRef, toPuckData(), blockId() (+8 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "getPublishedReader"
Cohesion: 0.17
Nodes (16): AuthKeys, customDomainOrigin(), platformRequestOrigin(), requestProto(), Bucket, clientIpHeader(), clientKeyFromHeaders(), defaultLimiter (+8 more)

### Community 33 - "next"
Cohesion: 0.13
Nodes (15): DocsIndexPage(), dynamic, DocPage(), dynamic, dynamic, EditFunnelPage(), dynamic, StudioPage() (+7 more)

### Community 35 - "funnelRoutes"
Cohesion: 0.12
Nodes (21): formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, describe(), formatDate(), formatMoney() (+13 more)

### Community 36 - "status/route.ts"
Cohesion: 0.20
Nodes (9): dynamic, NO_STORE, querySchema, toPublicPaymentStatus(), 4. Checkout, webhook, status, Step: Advance funnel, Step: Poll status, Step: Verify webhook (+1 more)

### Community 37 - "Draft Saving and Validation"
Cohesion: 0.11
Nodes (23): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+15 more)

### Community 38 - "Repository Audit Doc"
Cohesion: 0.15
Nodes (13): coolify, License table, Method, motion, Not integrated / rejected, posthog, react-sdk (Solidgate), react-stripe-js (+5 more)

### Community 39 - "file-funnel-repository.ts"
Cohesion: 0.09
Nodes (21): DomainStatus, domainStatusSchema, resultSchema, rowSchema, domainFileSchema, isNotFound(), versionSummarySchema, DomainLimitError (+13 more)

### Community 41 - "Run Storage"
Cohesion: 0.26
Nodes (15): loadUsableRun(), randomId(), adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN (+7 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "templates.ts"
Cohesion: 0.41
Nodes (11): checkoutBlock(), createScreenContent(), heading(), nextButton(), optionList(), paragraph(), priceCard(), PuckItem (+3 more)

### Community 45 - "Implementation Plan"
Cohesion: 0.20
Nodes (10): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 1: Minimal vertical slice (in progress), Stage 2: Components and logic, Stage 3: Database and publishing, Stage 5: Analytics and publishing operations, Stage 6: Custom domains (+2 more)

### Community 46 - "FunnelRuntime.tsx"
Cohesion: 0.14
Nodes (23): contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS, ReturnParams (+15 more)

### Community 47 - "CheckoutPanel.tsx"
Cohesion: 0.21
Nodes (12): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult, CheckoutPanel(), checkoutResponse, EmbeddedView() (+4 more)

### Community 48 - "Data Flow Doc"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+2 more)

### Community 49 - "src/proxy.ts"
Cohesion: 0.17
Nodes (21): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+13 more)

### Community 50 - "Architecture"
Cohesion: 0.22
Nodes (9): Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Repository layout, Stack, Storage, auth and public read path (Stage 3) (+1 more)

### Community 51 - "getPaymentStore"
Cohesion: 0.23
Nodes (11): dynamic, NO_STORE, POST(), dynamic, POST(), cronAuthorized(), getPaymentStore(), getStripeProvider() (+3 more)

### Community 52 - "[id]/leads/route.ts"
Cohesion: 0.21
Nodes (11): Context, dynamic, GET(), Context, dynamic, GET(), isMissingServiceKey(), csvCell() (+3 more)

### Community 53 - "Seed Funnel"
Cohesion: 0.26
Nodes (10): DraftSaver, FunnelDefinition, button(), createSeedFunnel(), heading(), options(), paragraph(), puck() (+2 more)

### Community 54 - "Status log"
Cohesion: 0.44
Nodes (8): Step: Screen routing, Status log, matches(), nextScreen(), NextScreenOptions, own(), isPaymentType(), isSkipType()

### Community 55 - "Deployment Doc"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 56 - "draft/route.ts"
Cohesion: 0.32
Nodes (7): Context, dynamic, GET(), PUT(), saveSchema, checkDefinition(), Step: Save draft route

### Community 57 - "Docs Index"
Cohesion: 0.42
Nodes (3): C4 model, Level 1: System context, Level 2: Containers

### Community 58 - "Root Layout"
Cohesion: 0.16
Nodes (8): metadata, viewport, initialState, LoginForm(), dynamic, firstValue(), LoginPage(), react

### Community 59 - "Steps"
Cohesion: 0.18
Nodes (11): Flow, Refunds and disputes, Related, Step: Access policy, Step: Apply adjustment, Step: Apply deferred, Step: Match payment, Step: Resolve metadata (+3 more)

### Community 60 - "store.ts"
Cohesion: 0.12
Nodes (21): AdjustmentResult, FunnelPayment, RecordRejection, RecordResult, StaleDeferred, StatusDetail, StatusQuery, accessRowSchema (+13 more)

### Community 68 - "docs.ts"
Cohesion: 0.13
Nodes (10): devOrigins, nextConfig, privateHeaders, securityHeaders, DocEntry, DocGroup, listFeatures(), readOptional() (+2 more)

### Community 69 - "ThemeEditor.tsx"
Cohesion: 0.24
Nodes (9): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE (+1 more)

### Community 72 - "withStudio"
Cohesion: 0.11
Nodes (24): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), Context, dynamic, POST() (+16 more)

### Community 74 - "Feature map"
Cohesion: 0.40
Nodes (5): Background jobs, Feature map, How a funnel lives, Keeping these pages current, Map

### Community 75 - "Custom domains"
Cohesion: 0.40
Nodes (5): Custom domains, Domain status, Flow, Related, What it does

### Community 76 - "Analytics and consent"
Cohesion: 0.40
Nodes (5): Analytics and consent, Flow, Related, What is and is not sent, What it does

### Community 78 - "Checkout"
Cohesion: 0.50
Nodes (4): Checkout, Flow, Related, What it does

### Community 80 - "leads.ts"
Cohesion: 0.33
Nodes (6): emailBlocks(), LEADS_ROUTE, LeadSubmission, sendLead(), warn(), Step: Send on advance

### Community 82 - "Lead capture"
Cohesion: 0.50
Nodes (4): Flow, Lead capture, Related, What it does

## Knowledge Gaps
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `api-helpers.ts`, `Web App Dependencies`, `Checkout and Status API`, `Puck Blocks Config`, `Funnel Editor UI`, `actions.ts`, `index.ts`, `mock/webhook/route.ts`, `repository.ts`, `RuntimeInner`, `ref_zod`, `api/leads/route.ts`, `status/route.ts`, `src/proxy.ts`, `getPaymentStore`, `[id]/leads/route.ts`, `draft/route.ts`, `Root Layout`, `health/route.ts`, `withStudio`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `api-helpers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `webhook.ts` to `api-helpers.ts`, `Web App Dependencies`, `getPublishedReader`, `docs.ts`, `Checkout and Status API`, `supabase-funnel-repository.ts`, `file-funnel-repository.ts`, `leads/registry.ts`, `Payment Providers Registry`, `file-payment-store.ts`, `Stripe Provider`, `[id]/leads/route.ts`, `email.ts`, `mock/webhook/route.ts`, `repository.ts`, `ref_zod`, `store.ts`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `withStudio()` (e.g. with `Storage, auth and public read path (Stage 3)` and `Component responsibilities`) actually correct?**
  _`withStudio()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `Web App Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.054693877551020405 - nodes in this community are weakly interconnected._
- **Why does `Status log` connect `Status log` to `Analytics and Consent`, `supabase-funnel-repository.ts`, `leads/registry.ts`, `Run Storage`, `Payment Providers Registry`, `actions.ts`, `Implementation Plan`, `CheckoutPanel.tsx`, `Stripe Provider`, `validate.ts`, `webhook.ts`, `draft/route.ts`, `RuntimeInner`, `store.ts`, `Puck Screen Adapters`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._