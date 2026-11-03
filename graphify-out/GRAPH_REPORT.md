# Graph Report - funnel-platform  (2026-11-03)

## Corpus Check
- 194 files · ~105,011 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .css 10, (none) 6, .example 1)

## Summary
- 1703 nodes · 4346 edges · 75 communities (66 shown, 9 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 322 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d99873b7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- withStudio
- web/package.json
- Status log
- Root Tooling and Lint
- checkout/route.ts
- supabase-funnel-repository.ts
- File Funnel Repository
- config.tsx
- leads/registry.ts
- types.ts
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
- src/proxy.ts
- DomainsPanel.tsx
- mock/webhook/route.ts
- migrate
- ScreenEditor.tsx
- Docker Compose
- Schema Package Manifest
- studio-overview.ts
- Steps
- Funnel Repository Interface
- funnelRoutes
- Repository Audit (Stage 0)
- Draft Saving and Validation
- Security
- file-funnel-repository.ts
- server.ts
- Schema TS Config
- README
- isMissingServiceKey
- next
- FunnelRuntime.tsx
- login/page.tsx
- loadStudioOverview
- serve-check/route.ts
- Architecture
- Level 3: Components of the web app
- revocationOf
- Seed Funnel
- Status log
- Auth and access
- webhook.ts
- SupabasePaymentStore
- supabase-payment-store.ts
- Steps
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- ref_node_path
- Data flow
- email.ts
- ThemeEditor.tsx
- Steps
- repository.ts
- studio/page.tsx
- FunnelEditor.tsx

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 64 edges
2. `next` - 50 edges
3. `FileFunnelRepository` - 41 edges
4. `withStudio()` - 36 edges
5. `server-only` - 34 edges
6. `Icon()` - 32 edges
7. `react` - 31 edges
8. `SupabaseFunnelRepository` - 29 edges
9. `FunnelDefinition` - 29 edges
10. `Status log` - 29 edges

## Surprising Connections (you probably didn't know these)
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Known risks and open questions` --references--> `ScreenEditor()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/components/ScreenEditor.tsx
- `puck` --references--> `ScreenEditor()`  [INFERRED]
  docs/REPOSITORY_AUDIT.md → apps/web/src/components/ScreenEditor.tsx
- `Storage, auth and public read path (Stage 3)` --references--> `withStudio()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/server/api-helpers.ts
- `Component responsibilities` --references--> `withStudio()`  [INFERRED]
  docs/C4.md → apps/web/src/server/api-helpers.ts

## Import Cycles
- None detected.

## Communities (75 total, 9 thin omitted)

### Community 0 - "withStudio"
Cohesion: 0.14
Nodes (18): Context, DELETE(), dynamic, Context, dynamic, GET(), PUT(), saveSchema (+10 more)

### Community 1 - "web/package.json"
Cohesion: 0.05
Nodes (49): dependencies, @funnel/schema@workspace:*, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2, posthog-node@5.59.0 (+41 more)

### Community 2 - "Status log"
Cohesion: 0.07
Nodes (48): ConsentBanner(), isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent() (+40 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "checkout/route.ts"
Cohesion: 0.22
Nodes (19): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+11 more)

### Community 5 - "supabase-funnel-repository.ts"
Cohesion: 0.09
Nodes (19): DefinitionInvalidError, ForbiddenError, PublishedFunnel, PublishedReader, parseStoredDefinition(), domainRowSchema, draftRowSchema, funnelRowSchema (+11 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.18
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "config.tsx"
Cohesion: 0.06
Nodes (46): randomId(), CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, ALLOWED_COMPONENTS (+38 more)

### Community 8 - "leads/registry.ts"
Cohesion: 0.16
Nodes (12): FileLeadStore, fileSchema, isNotFound(), LeadFile, recordSchema, globalForLeads, FunnelLead, LeadInput (+4 more)

### Community 9 - "types.ts"
Cohesion: 0.08
Nodes (28): isMockEnabled(), MockProvider, PAYER_HASH_PATTERN, adjustmentMetadataSchema, metadataSchema, STRIPE_API_VERSION, StripeProvider, StripeProviderDeps (+20 more)

### Community 10 - "FunnelEditor.tsx"
Cohesion: 0.12
Nodes (38): AssistantPanel(), Card, demoReply(), Message, PALETTES, PlanStep, SUGGESTIONS, TypeMeta (+30 more)

### Community 11 - "file-payment-store.ts"
Cohesion: 0.10
Nodes (26): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+18 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.08
Nodes (39): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+31 more)

### Community 13 - "actions.ts"
Cohesion: 0.13
Nodes (23): accountClientKey(), authenticate(), AuthKeys, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK (+15 more)

### Community 14 - "ScreenCanvas.tsx"
Cohesion: 0.16
Nodes (23): AssistantPanelProps, layoutColumns(), NODE_H, NODE_TYPES, ScreenCanvas(), ScreenFlowNode, ScreenNode, ScreenNodeData (+15 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (36): ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, edgeSchema, hasOversizedString(), ID_PATTERN (+28 more)

### Community 16 - "solidgate-provider.ts"
Cohesion: 0.15
Nodes (16): apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot, safeEqual() (+8 more)

### Community 17 - "validate.ts"
Cohesion: 0.15
Nodes (18): RetypeResult, Edge, isQuizType(), getOptionLists(), isFallbackEdge(), isPaymentScreen(), isQuiz(), IssueCode (+10 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.17
Nodes (7): DomainCheck, DomainNotFoundError, FunnelNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel()

### Community 19 - "payments/registry.ts"
Cohesion: 0.12
Nodes (30): dynamic, NO_STORE, POST(), Context, dynamic, GET(), POST(), dynamic (+22 more)

### Community 20 - "StudioDashboard.tsx"
Cohesion: 0.13
Nodes (29): BookIcon(), FlowIcon(), HomeIcon(), LogoMark(), LogoutIcon(), PenIcon(), SparkIcon(), compress() (+21 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.09
Nodes (24): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+16 more)

### Community 22 - "mock/webhook/route.ts"
Cohesion: 0.13
Nodes (21): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), dynamic, GET(), CheckoutTarget (+13 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "publish/route.ts"
Cohesion: 0.16
Nodes (15): Context, dynamic, POST(), rollbackSchema, createSchema, dynamic, GET(), POST() (+7 more)

### Community 25 - "src/proxy.ts"
Cohesion: 0.23
Nodes (17): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+9 more)

### Community 26 - "DomainsPanel.tsx"
Cohesion: 0.06
Nodes (60): dynamic, NO_STORE, POST(), Summary, Context, dynamic, isDomainTaken(), POST() (+52 more)

### Community 27 - "mock/webhook/route.ts"
Cohesion: 0.22
Nodes (13): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, formSchema (+5 more)

### Community 28 - "migrate"
Cohesion: 0.17
Nodes (16): parseDefinition(), checkDefinition(), DefinitionCheck, isOlderDefinition(), parseInput(), Step: Validate definition, Step: Render screen, Stage 1: Minimal vertical slice (in progress) (+8 more)

### Community 29 - "ScreenEditor.tsx"
Cohesion: 0.17
Nodes (18): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditor(), ScreenEditorProps, ScreenEditorSlots, usePuck (+10 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "studio-overview.ts"
Cohesion: 0.17
Nodes (12): buildWindow(), DAY_FORMAT, FunnelRow, Metric, MONTH_FORMAT, OVERVIEW_RANGES, OverviewRange, RevenueMetric (+4 more)

### Community 33 - "Steps"
Cohesion: 0.13
Nodes (14): AI assistant (design), Flow, Rollout, Security, Step: Assistant route, Step: Generative UI cards, Step: Guards, Step: Model adapter (+6 more)

### Community 35 - "funnelRoutes"
Cohesion: 0.10
Nodes (28): DeleteFunnelButton(), formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm() (+20 more)

### Community 36 - "Repository Audit (Stage 0)"
Cohesion: 0.06
Nodes (49): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs (+41 more)

### Community 37 - "Draft Saving and Validation"
Cohesion: 0.14
Nodes (19): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+11 more)

### Community 38 - "Security"
Cohesion: 0.20
Nodes (10): Custom domains, Leads (personal data), Operational, Response headers, Runtime safety, Secrets policy, Security, Stage 3 implementation: auth, RLS, public read (+2 more)

### Community 39 - "file-funnel-repository.ts"
Cohesion: 0.09
Nodes (22): DomainStatus, domainStatusSchema, domainFileSchema, isNotFound(), versionSummarySchema, DomainLimitError, DomainTakenError, FunnelDraft (+14 more)

### Community 41 - "server.ts"
Cohesion: 0.33
Nodes (6): @supabase/ssr@0.12.7, SESSION_COOKIE_OPTIONS, SessionResult, createSupabaseAnonClient(), @supabase/ssr, @supabase/supabase-js

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "isMissingServiceKey"
Cohesion: 0.33
Nodes (7): Context, dynamic, GET(), csvCell(), HEADER, leadsToCsv(), Step: Export CSV

### Community 45 - "next"
Cohesion: 0.07
Nodes (25): dynamic, metadata, viewport, dynamic, PreviewPage(), DocsSearch(), DocsIndexPage(), dynamic (+17 more)

### Community 46 - "FunnelRuntime.tsx"
Cohesion: 0.06
Nodes (60): CustomDomainFunnelPage(), dynamic, dynamic, PublishedFunnelPage(), contrastingForeground(), EmailBlock, foregroundForLuminance(), FunnelRuntime() (+52 more)

### Community 47 - "login/page.tsx"
Cohesion: 0.33
Nodes (6): AuthFormState, initialState, LoginForm(), dynamic, firstValue(), LoginPage()

### Community 48 - "loadStudioOverview"
Cohesion: 0.31
Nodes (6): bucketIndex(), loadStudioOverview(), safeLeads(), safePayments(), safeScreens(), Step: Load per-funnel data

### Community 49 - "serve-check/route.ts"
Cohesion: 0.26
Nodes (14): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), Bucket, checkRateLimit(), clientKey() (+6 more)

### Community 50 - "Architecture"
Cohesion: 0.20
Nodes (10): Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Known risks and open questions, Repository layout, Stack (+2 more)

### Community 51 - "Level 3: Components of the web app"
Cohesion: 0.33
Nodes (6): C4 model, Component responsibilities, Import-graph edges (value imports, grouped), Level 1: System context, Level 2: Containers, Level 3: Components of the web app

### Community 52 - "revocationOf"
Cohesion: 0.83
Nodes (4): revocationOf(), isPaid(), netAmount(), Step: Aggregate

### Community 53 - "Seed Funnel"
Cohesion: 0.39
Nodes (8): button(), createSeedFunnel(), heading(), options(), paragraph(), puck(), PuckItem, skipButton()

### Community 54 - "Status log"
Cohesion: 0.46
Nodes (7): Step: Screen routing, matches(), nextScreen(), NextScreenOptions, own(), isPaymentType(), isSkipType()

### Community 55 - "Auth and access"
Cohesion: 0.50
Nodes (4): Auth and access, Flow, Related, What it does

### Community 56 - "webhook.ts"
Cohesion: 0.13
Nodes (13): AdjustmentResult, PaymentStore, isAdjustment(), PaymentAdjustment, emitAdjustment(), eventUuid(), processAdjustment(), recordVerifiedEvent() (+5 more)

### Community 57 - "SupabasePaymentStore"
Cohesion: 0.15
Nodes (9): rowRevocation(), SupabasePaymentStore, toPublicPaymentStatus(), Step: Advance funnel, Step: Poll status, Step: Solidgate, Step: Verify webhook, Steps (+1 more)

### Community 58 - "supabase-payment-store.ts"
Cohesion: 0.15
Nodes (13): requireSupabaseEnv(), createSupabaseServiceClient(), MissingServiceKeyError, resultSchema, rowSchema, toDomain(), accessRowSchema, funnelPaymentRowSchema (+5 more)

### Community 59 - "Steps"
Cohesion: 0.15
Nodes (13): Flow, Refunds and disputes, Related, Step: Apply adjustment, Step: Apply deferred, Step: Daily report, Step: Defer adjustment, Step: Match payment (+5 more)

### Community 68 - "ref_node_path"
Cohesion: 0.33
Nodes (4): devOrigins, nextConfig, privateHeaders, securityHeaders

### Community 69 - "Data flow"
Cohesion: 0.18
Nodes (11): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 4. Checkout, webhook, status, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication (+3 more)

### Community 70 - "email.ts"
Cohesion: 0.13
Nodes (23): bodySchema, dynamic, POST(), rateLimited(), emailBlocks(), EmailBlock, emailBlocksOf(), EmailInputProps (+15 more)

### Community 74 - "ThemeEditor.tsx"
Cohesion: 0.28
Nodes (8): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE

### Community 75 - "Steps"
Cohesion: 0.25
Nodes (7): Flow, Step: Create a funnel, Step: Load funnels, Step: Render, Steps, Studio overview, What it does

### Community 77 - "repository.ts"
Cohesion: 0.16
Nodes (13): register(), requireAppUrlInProduction(), readSupabaseEnv(), resolveStorageMode(), StorageMode, SupabaseEnv, SupabaseDomainMaintenance, DomainMaintenance (+5 more)

### Community 79 - "studio/page.tsx"
Cohesion: 0.67
Nodes (3): dynamic, StudioPage(), parseRange()

### Community 82 - "FunnelEditor.tsx"
Cohesion: 0.07
Nodes (36): AnimationSettings(), choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice() (+28 more)

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `withStudio`, `web/package.json`, `checkout/route.ts`, `config.tsx`, `actions.ts`, `ScreenCanvas.tsx`, `payments/registry.ts`, `StudioDashboard.tsx`, `mock/webhook/route.ts`, `publish/route.ts`, `src/proxy.ts`, `DomainsPanel.tsx`, `mock/webhook/route.ts`, `funnelRoutes`, `server.ts`, `isMissingServiceKey`, `FunnelRuntime.tsx`, `login/page.tsx`, `serve-check/route.ts`, `email.ts`, `studio/page.tsx`, `FunnelEditor.tsx`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `withStudio` be split into smaller, more focused modules?**
  _Cohesion score 0.1383399209486166 - nodes in this community are weakly interconnected._
- **Why does `react` connect `funnelRoutes` to `web/package.json`, `Status log`, `Draft Saving and Validation`, `config.tsx`, `FunnelEditor.tsx`, `ThemeEditor.tsx`, `next`, `FunnelRuntime.tsx`, `login/page.tsx`, `ScreenCanvas.tsx`, `repository.ts`, `FunnelEditor.tsx`, `StudioDashboard.tsx`, `DomainsPanel.tsx`, `ScreenEditor.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.053877551020408164 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `leads/registry.ts` to `withStudio`, `web/package.json`, `Status log`, `checkout/route.ts`, `supabase-funnel-repository.ts`, `types.ts`, `file-payment-store.ts`, `solidgate-provider.ts`, `payments/registry.ts`, `mock/webhook/route.ts`, `DomainsPanel.tsx`, `studio-overview.ts`, `file-funnel-repository.ts`, `server.ts`, `next`, `serve-check/route.ts`, `webhook.ts`, `supabase-payment-store.ts`, `email.ts`, `repository.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._