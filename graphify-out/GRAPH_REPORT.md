# Graph Report - funnel-platform  (2026-11-02)

## Corpus Check
- 190 files · ~101,391 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .css 8, (none) 6, .example 1)

## Summary
- 1661 nodes · 4210 edges · 90 communities (76 shown, 14 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 321 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a78c4335`
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
- Puck Blocks Config
- leads/registry.ts
- repository.ts
- FunnelEditor.tsx
- file-payment-store.ts
- Core DB Schema Migrations
- actions.ts
- ScreenCanvas.tsx
- Funnel Schema and Theme
- solidgate-provider.ts
- validate.ts
- Supabase Funnel Repository
- webhook.ts
- StudioDashboard.tsx
- Payments DB Migrations
- mock/webhook/route.ts
- Web TS Config
- publish/route.ts
- FunnelRuntime
- verify.ts
- types.ts
- file-funnel-repository.ts
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
- file-funnel-repository.ts
- templates.ts
- Schema TS Config
- README
- isMissingServiceKey
- docs/[slug]/page.tsx
- FunnelRuntime.tsx
- CheckoutPanel.tsx
- [id]/domains/route.ts
- react
- Architecture
- run-storage.ts
- Level 3: Components of the web app
- Seed Funnel
- Status log
- resolveStorageMode
- login/page.tsx
- Security
- Steps
- store.ts
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- docs.ts
- Data flow
- email.ts
- ConditionPicker.tsx
- src/proxy.ts
- Deployment
- ThemeEditor.tsx
- Steps
- Implementation Plan
- maintenance.ts
- instrumentation.ts
- getStudioContext
- leads.ts
- retype-edges.ts
- Feature map
- Custom domains
- Analytics and consent
- Lead capture
- Checkout
- Auth and access
- layout.ts

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 54 edges
2. `next` - 49 edges
3. `FileFunnelRepository` - 41 edges
4. `withStudio()` - 36 edges
5. `server-only` - 34 edges
6. `react` - 29 edges
7. `SupabaseFunnelRepository` - 29 edges
8. `Status log` - 29 edges
9. `Icon()` - 28 edges
10. `FunnelRepository` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Stage 5: Analytics and publishing operations` --references--> `ConsentBanner()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → apps/web/src/components/ConsentBanner.tsx
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Storage, auth and public read path (Stage 3)` --references--> `withStudio()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/server/api-helpers.ts
- `Component responsibilities` --references--> `withStudio()`  [INFERRED]
  docs/C4.md → apps/web/src/server/api-helpers.ts
- `Step: List leads` --references--> `withStudio()`  [INFERRED]
  docs/features/25-lead-capture.md → apps/web/src/server/api-helpers.ts

## Import Cycles
- None detected.

## Communities (90 total, 14 thin omitted)

### Community 0 - "withStudio"
Cohesion: 0.07
Nodes (29): Context, DELETE(), dynamic, Context, dynamic, GET(), PUT(), saveSchema (+21 more)

### Community 1 - "web/package.json"
Cohesion: 0.05
Nodes (52): dependencies, @funnel/schema@workspace:*, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2, posthog-node@5.59.0 (+44 more)

### Community 2 - "Status log"
Cohesion: 0.09
Nodes (39): ConsentBanner(), isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent() (+31 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "checkout/route.ts"
Cohesion: 0.11
Nodes (39): bodySchema, dynamic, POST(), rateLimited(), appOrigin(), bodySchema, dynamic, POST() (+31 more)

### Community 5 - "supabase-funnel-repository.ts"
Cohesion: 0.09
Nodes (18): DefinitionInvalidError, ForbiddenError, PublishedFunnel, PublishedReader, parseStoredDefinition(), domainRowSchema, draftRowSchema, funnelRowSchema (+10 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.18
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "Puck Blocks Config"
Cohesion: 0.09
Nodes (21): ALLOWED_COMPONENTS, ButtonBlock(), buttonProps, checkoutBlockProps, COMMON_BLOCKS, headingProps, ImageBlock(), imageProps (+13 more)

### Community 8 - "leads/registry.ts"
Cohesion: 0.10
Nodes (20): createSupabaseServiceClient(), MissingServiceKeyError, csvCell(), HEADER, leadsToCsv(), FileLeadStore, fileSchema, isNotFound() (+12 more)

### Community 9 - "repository.ts"
Cohesion: 0.31
Nodes (10): dynamic, POST(), createSupabaseAnonClient(), getPaymentStore(), getStripeProvider(), globalForPayments, getDataDir(), getFileRepository() (+2 more)

### Community 10 - "FunnelEditor.tsx"
Cohesion: 0.12
Nodes (41): AnimationSettings(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight(), CloseIcon(), CopyIcon(), DotsIcon() (+33 more)

### Community 11 - "file-payment-store.ts"
Cohesion: 0.13
Nodes (15): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+7 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.08
Nodes (39): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+31 more)

### Community 13 - "actions.ts"
Cohesion: 0.13
Nodes (23): accountClientKey(), authenticate(), AuthKeys, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK (+15 more)

### Community 14 - "ScreenCanvas.tsx"
Cohesion: 0.20
Nodes (12): layoutColumns(), NODE_H, NODE_TYPES, ScreenCanvas(), ScreenFlowNode, ScreenNode, ScreenNodeData, screenStyle() (+4 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.08
Nodes (27): ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, edgeSchema, hasOversizedString(), ID_PATTERN (+19 more)

### Community 16 - "solidgate-provider.ts"
Cohesion: 0.09
Nodes (27): MockProvider, apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot (+19 more)

### Community 17 - "validate.ts"
Cohesion: 0.17
Nodes (15): isQuizType(), getOptionLists(), isFallbackEdge(), isQuiz(), IssueCode, IssueSeverity, OptionListInfo, OptionListScan (+7 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.17
Nodes (7): DomainCheck, DomainNotFoundError, FunnelNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel()

### Community 19 - "webhook.ts"
Cohesion: 0.11
Nodes (22): dynamic, POST(), isSolidgateConfigured(), PaymentStore, isAdjustment(), emitAdjustment(), eventUuid(), isNamed() (+14 more)

### Community 20 - "StudioDashboard.tsx"
Cohesion: 0.12
Nodes (32): BookIcon(), FlowIcon(), HomeIcon(), LogoMark(), LogoutIcon(), PenIcon(), PlusIcon(), SparkIcon() (+24 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.09
Nodes (24): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+16 more)

### Community 22 - "mock/webhook/route.ts"
Cohesion: 0.14
Nodes (21): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, CheckoutTarget, resolveCheckoutTarget() (+13 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "publish/route.ts"
Cohesion: 0.13
Nodes (18): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), Context, dynamic, POST() (+10 more)

### Community 25 - "FunnelRuntime"
Cohesion: 0.16
Nodes (16): CustomDomainFunnelPage(), dynamic, dynamic, PublishedFunnelPage(), dynamic, PreviewPage(), FunnelRuntime(), ReturnParams (+8 more)

### Community 26 - "verify.ts"
Cohesion: 0.15
Nodes (21): Context, dynamic, isDomainTaken(), POST(), RoutingStatus, txtRecordName(), txtRecordValue(), checkDomainDns() (+13 more)

### Community 27 - "types.ts"
Cohesion: 0.10
Nodes (24): dynamic, formSchema, POST(), isMockEnabled(), PAYER_HASH_PATTERN, runTokenSecret(), adjustmentMetadataSchema, metadataSchema (+16 more)

### Community 28 - "file-funnel-repository.ts"
Cohesion: 0.18
Nodes (14): DraftSaver, DefinitionCheck, isOlderDefinition(), parseInput(), Step: Validate definition, clampScreenAnimation(), isRecord(), migrate() (+6 more)

### Community 29 - "ScreenEditor.tsx"
Cohesion: 0.15
Nodes (20): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditor(), ScreenEditorProps, ScreenEditorSlots, usePuck (+12 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "studio-overview.ts"
Cohesion: 0.14
Nodes (22): revocationOf(), bucketIndex(), buildWindow(), DAY_FORMAT, FunnelRow, isPaid(), loadStudioOverview(), Metric (+14 more)

### Community 33 - "Steps"
Cohesion: 0.14
Nodes (13): AI assistant (design), Flow, Rollout, Step: Assistant route, Step: Generative UI cards, Step: Guards, Step: Model adapter, Step: Proposals (+5 more)

### Community 35 - "funnelRoutes"
Cohesion: 0.10
Nodes (27): DeleteFunnelButton(), formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm() (+19 more)

### Community 36 - "Repository Audit (Stage 0)"
Cohesion: 0.15
Nodes (13): coolify, License table, Method, motion, Not integrated / rejected, posthog, react-sdk (Solidgate), react-stripe-js (+5 more)

### Community 37 - "Draft Saving and Validation"
Cohesion: 0.12
Nodes (22): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+14 more)

### Community 38 - "DomainsPanel.tsx"
Cohesion: 0.12
Nodes (22): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+14 more)

### Community 39 - "file-funnel-repository.ts"
Cohesion: 0.11
Nodes (18): domainFileSchema, isNotFound(), versionSummarySchema, DomainLimitError, DomainTakenError, FunnelDraft, FunnelValidationError, MAX_AUTO_RECHECKS (+10 more)

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
Cohesion: 0.14
Nodes (17): dynamic, NO_STORE, POST(), Summary, dynamic, NO_STORE, POST(), Context (+9 more)

### Community 45 - "docs/[slug]/page.tsx"
Cohesion: 0.25
Nodes (9): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, studioShellProps(), MermaidDiagrams(), listDocs() (+1 more)

### Community 46 - "FunnelRuntime.tsx"
Cohesion: 0.22
Nodes (16): contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS, RuntimeProps (+8 more)

### Community 47 - "CheckoutPanel.tsx"
Cohesion: 0.18
Nodes (17): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult, CheckoutPanel(), checkoutResponse, EmbeddedView() (+9 more)

### Community 48 - "[id]/domains/route.ts"
Cohesion: 0.17
Nodes (22): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, Context, dynamic (+14 more)

### Community 50 - "Architecture"
Cohesion: 0.29
Nodes (7): Animation, Architecture, Deployment (Stage 5), Goals and non-goals, Repository layout, Stack, Storage, auth and public read path (Stage 3)

### Community 51 - "run-storage.ts"
Cohesion: 0.15
Nodes (26): loadUsableRun(), longestPathFrom(), parseDefinition(), RuntimeInner(), randomId(), newOptionId(), advance(), MAX_RUN_HISTORY (+18 more)

### Community 52 - "Level 3: Components of the web app"
Cohesion: 0.33
Nodes (6): C4 model, Component responsibilities, Import-graph edges (value imports, grouped), Level 1: System context, Level 2: Containers, Level 3: Components of the web app

### Community 53 - "Seed Funnel"
Cohesion: 0.39
Nodes (8): button(), createSeedFunnel(), heading(), options(), paragraph(), puck(), PuckItem, skipButton()

### Community 54 - "Status log"
Cohesion: 0.26
Nodes (11): Data model, Step: Screen routing, Stage 1: Minimal vertical slice (in progress), matches(), nextScreen(), NextScreenOptions, own(), Condition (+3 more)

### Community 55 - "resolveStorageMode"
Cohesion: 0.36
Nodes (7): readSupabaseEnv(), requireSupabaseEnv(), resolveStorageMode(), SupabaseEnv, SESSION_COOKIE_OPTIONS, SessionResult, @supabase/ssr

### Community 56 - "login/page.tsx"
Cohesion: 0.33
Nodes (6): AuthFormState, initialState, LoginForm(), dynamic, firstValue(), LoginPage()

### Community 57 - "Security"
Cohesion: 0.20
Nodes (10): Custom domains, Leads (personal data), Operational, Response headers, Runtime safety, Secrets policy, Security, Stage 3 implementation: auth, RLS, public read (+2 more)

### Community 59 - "Steps"
Cohesion: 0.17
Nodes (12): Flow, Refunds and disputes, Related, Step: Apply adjustment, Step: Apply deferred, Step: Defer adjustment, Step: Match payment, Step: Resolve metadata (+4 more)

### Community 60 - "store.ts"
Cohesion: 0.13
Nodes (20): AdjustmentResult, FunnelPayment, RecordRejection, RecordResult, StaleDeferred, StatusDetail, StatusQuery, accessRowSchema (+12 more)

### Community 68 - "docs.ts"
Cohesion: 0.13
Nodes (10): devOrigins, nextConfig, privateHeaders, securityHeaders, DocEntry, DocGroup, listFeatures(), readOptional() (+2 more)

### Community 69 - "Data flow"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+2 more)

### Community 70 - "email.ts"
Cohesion: 0.16
Nodes (16): emailBlocks(), EmailBlock, emailBlocksOf(), EmailInputProps, emailKey(), isValidEmail(), blockId(), PuckItem (+8 more)

### Community 71 - "ConditionPicker.tsx"
Cohesion: 0.33
Nodes (10): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+2 more)

### Community 72 - "src/proxy.ts"
Cohesion: 0.20
Nodes (20): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+12 more)

### Community 73 - "Deployment"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 74 - "ThemeEditor.tsx"
Cohesion: 0.28
Nodes (8): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE

### Community 75 - "Steps"
Cohesion: 0.25
Nodes (7): Flow, Step: Create a funnel, Step: Load funnels, Step: Render, Steps, Studio overview, What it does

### Community 76 - "Implementation Plan"
Cohesion: 0.22
Nodes (9): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 2: Components and logic, Stage 3: Database and publishing, Stage 5: Analytics and publishing operations, Stage 6: Custom domains, Stage overview (+1 more)

### Community 77 - "maintenance.ts"
Cohesion: 0.17
Nodes (9): resultSchema, rowSchema, SupabaseDomainMaintenance, toDomain(), DomainMaintenance, RecheckOutcome, RecheckResult, Custom domains (Stage 6) (+1 more)

### Community 78 - "instrumentation.ts"
Cohesion: 0.70
Nodes (3): register(), requireAppUrlInProduction(), trustedHops()

### Community 79 - "getStudioContext"
Cohesion: 0.33
Nodes (7): dynamic, EditFunnelPage(), dynamic, StudioPage(), uiFont, getStudioContext, parseRange()

### Community 80 - "leads.ts"
Cohesion: 0.50
Nodes (4): LEADS_ROUTE, LeadSubmission, sendLead(), warn()

### Community 83 - "Feature map"
Cohesion: 0.40
Nodes (5): Background jobs, Feature map, How a funnel lives, Keeping these pages current, Map

### Community 84 - "Custom domains"
Cohesion: 0.40
Nodes (5): Custom domains, Domain status, Flow, Related, What it does

### Community 85 - "Analytics and consent"
Cohesion: 0.40
Nodes (5): Analytics and consent, Flow, Related, What is and is not sent, What it does

### Community 87 - "Lead capture"
Cohesion: 0.50
Nodes (4): Flow, Lead capture, Related, What it does

### Community 88 - "Checkout"
Cohesion: 0.50
Nodes (4): Checkout, Flow, Related, What it does

### Community 89 - "Auth and access"
Cohesion: 0.50
Nodes (4): Auth and access, Flow, Related, What it does

## Knowledge Gaps
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `withStudio` to `web/package.json`, `checkout/route.ts`, `Puck Blocks Config`, `repository.ts`, `FunnelEditor.tsx`, `actions.ts`, `webhook.ts`, `StudioDashboard.tsx`, `publish/route.ts`, `FunnelRuntime`, `verify.ts`, `types.ts`, `funnelRoutes`, `isMissingServiceKey`, `docs/[slug]/page.tsx`, `[id]/domains/route.ts`, `resolveStorageMode`, `login/page.tsx`, `src/proxy.ts`, `getStudioContext`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `withStudio` be split into smaller, more focused modules?**
  _Cohesion score 0.0666049953746531 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `mock/webhook/route.ts` to `withStudio`, `web/package.json`, `Status log`, `checkout/route.ts`, `supabase-funnel-repository.ts`, `leads/registry.ts`, `repository.ts`, `file-payment-store.ts`, `solidgate-provider.ts`, `webhook.ts`, `verify.ts`, `types.ts`, `studio-overview.ts`, `file-funnel-repository.ts`, `isMissingServiceKey`, `docs/[slug]/page.tsx`, `[id]/domains/route.ts`, `resolveStorageMode`, `store.ts`, `docs.ts`, `email.ts`, `maintenance.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05152394775036284 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `withStudio`, `web/package.json`, `Status log`, `funnelRoutes`, `Draft Saving and Validation`, `DomainsPanel.tsx`, `Puck Blocks Config`, `repository.ts`, `FunnelEditor.tsx`, `ThemeEditor.tsx`, `docs/[slug]/page.tsx`, `FunnelRuntime.tsx`, `ScreenCanvas.tsx`, `CheckoutPanel.tsx`, `StudioDashboard.tsx`, `login/page.tsx`, `ScreenEditor.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._