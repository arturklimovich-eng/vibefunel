# Graph Report - funnel-platform  (2026-11-03)

## Corpus Check
- 193 files · ~103,139 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .css 9, (none) 6, .example 1)

## Summary
- 1690 nodes · 4300 edges · 87 communities (75 shown, 12 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 321 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `525db146`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- withStudio
- web/package.json
- Status log
- Root Tooling and Lint
- checkout/route.ts
- file-funnel-repository.ts
- File Funnel Repository
- Puck Blocks Config
- leads/registry.ts
- stripe-provider.ts
- FunnelEditor.tsx
- file-payment-store.ts
- Core DB Schema Migrations
- actions.ts
- ScreenCanvas.tsx
- Funnel Schema and Theme
- solidgate-provider.ts
- validate.ts
- Supabase Funnel Repository
- payments/registry.ts
- StudioDashboard.tsx
- Payments DB Migrations
- mock/webhook/route.ts
- Web TS Config
- publish/route.ts
- getPublishedReader
- verify.ts
- types.ts
- migrate.ts
- ScreenEditor.tsx
- Docker Compose
- Schema Package Manifest
- studio-overview.ts
- Steps
- Funnel Repository Interface
- funnelRoutes
- Repository Audit (Stage 0)
- Draft Saving and Validation
- DomainsPanel.tsx
- supabase-funnel-repository.ts
- templates.ts
- Schema TS Config
- README
- isMissingServiceKey
- docs/[slug]/page.tsx
- FunnelRuntime.tsx
- CheckoutPanel.tsx
- [id]/domains/route.ts
- serve-check/route.ts
- Architecture
- run-storage.ts
- next
- Seed Funnel
- Status log
- FilePaymentStore
- PaymentStore
- revocationOf
- supabase-payment-store.ts
- Steps
- payments/store.ts
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- docs.ts
- Data flow
- email.ts
- ConditionPicker.tsx
- FileLeadStore
- payment-status.ts
- ThemeEditor.tsx
- Steps
- Implementation Plan
- maintenance.ts
- rate-limit.ts
- getStudioContext
- RuntimeInner
- AI assistant (design)
- FunnelEditor.tsx
- scripts
- AnimationSettings.tsx
- hasOversizedString
- Steps

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 63 edges
2. `next` - 50 edges
3. `FileFunnelRepository` - 41 edges
4. `withStudio()` - 36 edges
5. `server-only` - 34 edges
6. `Icon()` - 30 edges
7. `react` - 29 edges
8. `SupabaseFunnelRepository` - 29 edges
9. `Status log` - 29 edges
10. `FunnelDefinition` - 27 edges

## Surprising Connections (you probably didn't know these)
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Storage, auth and public read path (Stage 3)` --references--> `withStudio()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/server/api-helpers.ts
- `Component responsibilities` --references--> `withStudio()`  [INFERRED]
  docs/C4.md → apps/web/src/server/api-helpers.ts
- `Step: List leads` --references--> `withStudio()`  [INFERRED]
  docs/features/25-lead-capture.md → apps/web/src/server/api-helpers.ts
- `Step: Daily report` --references--> `cronAuthorized()`  [INFERRED]
  docs/features/40-refunds-disputes.md → apps/web/src/server/cron-auth.ts

## Import Cycles
- None detected.

## Communities (87 total, 12 thin omitted)

### Community 0 - "withStudio"
Cohesion: 0.10
Nodes (26): Context, DELETE(), dynamic, Context, dynamic, GET(), PUT(), saveSchema (+18 more)

### Community 1 - "web/package.json"
Cohesion: 0.06
Nodes (44): dependencies, @funnel/schema@workspace:*, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2, posthog-node@5.59.0 (+36 more)

### Community 2 - "Status log"
Cohesion: 0.08
Nodes (43): isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent(), warn() (+35 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "checkout/route.ts"
Cohesion: 0.31
Nodes (14): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+6 more)

### Community 5 - "file-funnel-repository.ts"
Cohesion: 0.15
Nodes (13): domainFileSchema, versionSummarySchema, PublishedFunnel, PublishedReader, parseStoredDefinition(), SupabasePublishedReader, DefinitionCheck, isOlderDefinition() (+5 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.18
Nodes (5): FileFunnelRepository, isNotFound(), isRecord(), withRevision(), CustomDomain

### Community 7 - "Puck Blocks Config"
Cohesion: 0.09
Nodes (23): ALLOWED_COMPONENTS, ButtonBlock(), buttonProps, checkoutBlockProps, COMMON_BLOCKS, headingProps, ImageBlock(), imageProps (+15 more)

### Community 8 - "leads/registry.ts"
Cohesion: 0.16
Nodes (14): createSupabaseServiceClient(), MissingServiceKeyError, HEADER, fileSchema, isNotFound(), LeadFile, recordSchema, globalForLeads (+6 more)

### Community 9 - "stripe-provider.ts"
Cohesion: 0.10
Nodes (12): PAYER_HASH_PATTERN, adjustmentMetadataSchema, metadataSchema, STRIPE_API_VERSION, StripeProvider, StripeProviderDeps, PaymentProvider, PlanPriceMismatchError (+4 more)

### Community 10 - "FunnelEditor.tsx"
Cohesion: 0.14
Nodes (37): BookIcon(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight(), CloseIcon(), CopyIcon(), DotsIcon() (+29 more)

### Community 11 - "file-payment-store.ts"
Cohesion: 0.16
Nodes (14): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), fileSchema, findAdjustmentTarget(), isNotFound() (+6 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.08
Nodes (39): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+31 more)

### Community 13 - "actions.ts"
Cohesion: 0.05
Nodes (67): @supabase/ssr@0.12.7, accountClientKey(), authenticate(), AuthFormState, AuthKeys, credentialsSchema, failureLimiter, hasControlCharacter() (+59 more)

### Community 14 - "ScreenCanvas.tsx"
Cohesion: 0.17
Nodes (20): layoutColumns(), NODE_H, NODE_TYPES, ScreenCanvas(), ScreenFlowNode, ScreenNode, ScreenNodeData, screenStyle() (+12 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (31): animationPresetSchema, animationSchema, conditionSchema, edgeSchema, funnelSchema, funnelVersionSchema, ID_PATTERN, idSchema (+23 more)

### Community 16 - "solidgate-provider.ts"
Cohesion: 0.13
Nodes (18): apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot, safeEqual() (+10 more)

### Community 17 - "validate.ts"
Cohesion: 0.17
Nodes (15): isQuizType(), getOptionLists(), isFallbackEdge(), isQuiz(), IssueCode, IssueSeverity, OptionListInfo, OptionListScan (+7 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.18
Nodes (6): FunnelNotFoundError, RevisionConflictError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel()

### Community 19 - "payments/registry.ts"
Cohesion: 0.12
Nodes (26): dynamic, NO_STORE, POST(), dynamic, POST(), dynamic, NO_STORE, querySchema (+18 more)

### Community 20 - "StudioDashboard.tsx"
Cohesion: 0.16
Nodes (20): DeleteFunnelButton(), FlowIcon(), PenIcon(), compress(), CreateAnotherButton(), formatMoney(), formatPercent(), FunnelActions() (+12 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.09
Nodes (24): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+16 more)

### Community 22 - "mock/webhook/route.ts"
Cohesion: 0.14
Nodes (23): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, GET() (+15 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "publish/route.ts"
Cohesion: 0.15
Nodes (16): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), Context, dynamic, POST() (+8 more)

### Community 25 - "getPublishedReader"
Cohesion: 0.29
Nodes (9): CustomDomainFunnelPage(), dynamic, dynamic, PublishedFunnelPage(), getPublishedReader(), parseReturnParams(), SearchParams, single() (+1 more)

### Community 26 - "verify.ts"
Cohesion: 0.12
Nodes (24): dynamic, NO_STORE, POST(), Summary, Context, dynamic, isDomainTaken(), POST() (+16 more)

### Community 27 - "types.ts"
Cohesion: 0.11
Nodes (23): dynamic, formSchema, POST(), ReturnParams, isMockEnabled(), MockProvider, ACCESS_SUSPENDING_DISPUTES, CheckoutInput (+15 more)

### Community 28 - "migrate.ts"
Cohesion: 0.33
Nodes (6): clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition, CURRENT_SCHEMA_VERSION, funnelDefinitionSchema

### Community 29 - "ScreenEditor.tsx"
Cohesion: 0.14
Nodes (19): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditor(), ScreenEditorProps, ScreenEditorSlots, usePuck (+11 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "studio-overview.ts"
Cohesion: 0.13
Nodes (18): bucketIndex(), buildWindow(), DAY_FORMAT, FunnelRow, loadStudioOverview(), Metric, MONTH_FORMAT, OVERVIEW_RANGES (+10 more)

### Community 33 - "Steps"
Cohesion: 0.22
Nodes (9): Step: Assistant route, Step: Generative UI cards, Step: Guards, Step: Model adapter, Step: Proposals, Step: Threads, Step: Tools, Step: Working copy (+1 more)

### Community 35 - "funnelRoutes"
Cohesion: 0.09
Nodes (28): formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm(), slugify() (+20 more)

### Community 36 - "Repository Audit (Stage 0)"
Cohesion: 0.06
Nodes (48): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs (+40 more)

### Community 37 - "Draft Saving and Validation"
Cohesion: 0.10
Nodes (26): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+18 more)

### Community 38 - "DomainsPanel.tsx"
Cohesion: 0.18
Nodes (16): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+8 more)

### Community 39 - "supabase-funnel-repository.ts"
Cohesion: 0.08
Nodes (26): DomainStatus, DefinitionInvalidError, DomainCheck, DomainLimitError, DomainNotFoundError, DomainTakenError, ForbiddenError, FunnelDraft (+18 more)

### Community 41 - "templates.ts"
Cohesion: 0.41
Nodes (11): checkoutBlock(), createScreenContent(), heading(), nextButton(), optionList(), paragraph(), priceCard(), PuckItem (+3 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "isMissingServiceKey"
Cohesion: 0.33
Nodes (8): Context, dynamic, GET(), isMissingServiceKey(), csvCell(), leadsToCsv(), getLeadStore(), Step: Export CSV

### Community 45 - "docs/[slug]/page.tsx"
Cohesion: 0.26
Nodes (9): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, studioShellProps(), MermaidDiagrams(), listDocs() (+1 more)

### Community 46 - "FunnelRuntime.tsx"
Cohesion: 0.13
Nodes (24): ConsentBanner(), contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS (+16 more)

### Community 47 - "CheckoutPanel.tsx"
Cohesion: 0.23
Nodes (14): @solidgate/client-sdk-loader@1.39.0, CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, CheckoutBlockView() (+6 more)

### Community 48 - "[id]/domains/route.ts"
Cohesion: 0.25
Nodes (14): bodySchema, Context, dynamic, GET(), POST(), txtRecordValue(), HOSTNAME_MAX_LENGTH, normalizeHostname() (+6 more)

### Community 49 - "serve-check/route.ts"
Cohesion: 0.30
Nodes (14): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), POST(), GET(), stripPort() (+6 more)

### Community 50 - "Architecture"
Cohesion: 0.22
Nodes (9): Animation, Architecture, Custom domains (Stage 6), Deployment (Stage 5), Goals and non-goals, Repository layout, Stack, Storage, auth and public read path (Stage 3) (+1 more)

### Community 51 - "run-storage.ts"
Cohesion: 0.24
Nodes (16): loadUsableRun(), randomId(), adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN (+8 more)

### Community 52 - "next"
Cohesion: 0.13
Nodes (4): dynamic, metadata, viewport, next

### Community 53 - "Seed Funnel"
Cohesion: 0.39
Nodes (8): button(), createSeedFunnel(), heading(), options(), paragraph(), puck(), PuckItem, skipButton()

### Community 54 - "Status log"
Cohesion: 0.29
Nodes (11): Data model, Step: Screen routing, Stage 1: Minimal vertical slice (in progress), Status log, matches(), nextScreen(), NextScreenOptions, own() (+3 more)

### Community 56 - "PaymentStore"
Cohesion: 0.18
Nodes (5): PaymentStore, RecordResult, SupabasePaymentStore, Data flow, Stage 4: Payments

### Community 57 - "revocationOf"
Cohesion: 0.24
Nodes (9): rowRevocation(), revocationOf(), toPublicPaymentStatus(), isPaid(), netAmount(), 4. Checkout, webhook, status, Step: Aggregate, Step: Poll status (+1 more)

### Community 58 - "supabase-payment-store.ts"
Cohesion: 0.20
Nodes (8): AdjustmentResult, accessRowSchema, funnelPaymentRowSchema, projectRowSchema, ServiceClient, statusRowSchema, statusSchema, paymentReasonSchema

### Community 59 - "Steps"
Cohesion: 0.13
Nodes (18): isAdjustment(), PaymentAdjustment, emitAdjustment(), processAdjustment(), Flow, Refunds and disputes, Related, Step: Apply adjustment (+10 more)

### Community 60 - "payments/store.ts"
Cohesion: 0.32
Nodes (9): FunnelPayment, RecordRejection, StaleDeferred, StatusDetail, StatusQuery, PaymentReason, PaymentRevocation, PaymentStatus (+1 more)

### Community 68 - "docs.ts"
Cohesion: 0.12
Nodes (10): devOrigins, nextConfig, privateHeaders, securityHeaders, DocEntry, DocGroup, listFeatures(), readOptional() (+2 more)

### Community 69 - "Data flow"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+2 more)

### Community 70 - "email.ts"
Cohesion: 0.16
Nodes (18): bodySchema, dynamic, rateLimited(), EmailBlock, emailBlocksOf(), EmailInputProps, emailKey(), isValidEmail() (+10 more)

### Community 71 - "ConditionPicker.tsx"
Cohesion: 0.38
Nodes (9): choiceToCondition(), ConditionPicker(), decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition(), getScreenOptions() (+1 more)

### Community 73 - "payment-status.ts"
Cohesion: 0.40
Nodes (5): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult

### Community 74 - "ThemeEditor.tsx"
Cohesion: 0.24
Nodes (9): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE (+1 more)

### Community 75 - "Steps"
Cohesion: 0.25
Nodes (7): Flow, Step: Create a funnel, Step: Load funnels, Step: Render, Steps, Studio overview, What it does

### Community 76 - "Implementation Plan"
Cohesion: 0.25
Nodes (8): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 2: Components and logic, Stage 3: Database and publishing, Stage 6: Custom domains, Stage overview, Verification commands (all stages)

### Community 77 - "maintenance.ts"
Cohesion: 0.16
Nodes (9): domainStatusSchema, resultSchema, rowSchema, SupabaseDomainMaintenance, toDomain(), DomainMaintenance, RecheckOutcome, RecheckResult (+1 more)

### Community 78 - "rate-limit.ts"
Cohesion: 0.21
Nodes (12): register(), requireAppUrlInProduction(), requestHost, customDomainOrigin(), platformRequestOrigin(), requestProto(), Bucket, defaultLimiter (+4 more)

### Community 79 - "getStudioContext"
Cohesion: 0.19
Nodes (12): dynamic, PreviewPage(), dynamic, EditFunnelPage(), dynamic, StudioPage(), uiFont, StorageMode (+4 more)

### Community 80 - "RuntimeInner"
Cohesion: 0.17
Nodes (14): emailBlocks(), FunnelRuntime(), parseDefinition(), RuntimeInner(), LEADS_ROUTE, LeadSubmission, sendLead(), warn() (+6 more)

### Community 81 - "AI assistant (design)"
Cohesion: 0.33
Nodes (5): AI assistant (design), Flow, Rollout, Security, What it does

### Community 82 - "FunnelEditor.tsx"
Cohesion: 0.08
Nodes (29): AnimationSettings(), ConnectionChoice, AddMenuAnchor, describeSaveState(), formatTime(), IMAGE_POSITIONS, LeftTab, Mode (+21 more)

### Community 83 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, typecheck

### Community 84 - "AnimationSettings.tsx"
Cohesion: 0.40
Nodes (4): ANIMATION_PRESETS, AnimationPreset, MAX_ANIMATION_MS, ScreenAnimation

### Community 88 - "Steps"
Cohesion: 0.25
Nodes (8): Checkout, Flow, Related, Step: Advance funnel, Step: Solidgate, Step: Verify webhook, Steps, What it does

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `withStudio`, `web/package.json`, `checkout/route.ts`, `Puck Blocks Config`, `FunnelEditor.tsx`, `actions.ts`, `ScreenCanvas.tsx`, `payments/registry.ts`, `StudioDashboard.tsx`, `mock/webhook/route.ts`, `publish/route.ts`, `getPublishedReader`, `verify.ts`, `types.ts`, `funnelRoutes`, `isMissingServiceKey`, `docs/[slug]/page.tsx`, `[id]/domains/route.ts`, `serve-check/route.ts`, `email.ts`, `getStudioContext`, `FunnelEditor.tsx`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `withStudio` be split into smaller, more focused modules?**
  _Cohesion score 0.09848484848484848 - nodes in this community are weakly interconnected._
- **Why does `Status log` connect `Status log` to `withStudio`, `Status log`, `file-funnel-repository.ts`, `email.ts`, `leads/registry.ts`, `stripe-provider.ts`, `Implementation Plan`, `actions.ts`, `FunnelRuntime.tsx`, `CheckoutPanel.tsx`, `RuntimeInner`, `solidgate-provider.ts`, `validate.ts`, `run-storage.ts`, `PaymentStore`, `types.ts`, `payments/store.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06262626262626263 - nodes in this community are weakly interconnected._
- **Why does `react` connect `funnelRoutes` to `web/package.json`, `Status log`, `Draft Saving and Validation`, `DomainsPanel.tsx`, `Puck Blocks Config`, `FunnelEditor.tsx`, `ThemeEditor.tsx`, `actions.ts`, `FunnelRuntime.tsx`, `docs/[slug]/page.tsx`, `ScreenCanvas.tsx`, `CheckoutPanel.tsx`, `FunnelEditor.tsx`, `getStudioContext`, `StudioDashboard.tsx`, `next`, `ScreenEditor.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._