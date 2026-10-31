# Graph Report - funnel-platform  (2026-10-31)

## Corpus Check
- 181 files · ~91,746 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 1535 nodes · 3850 edges · 84 communities (67 shown, 17 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 299 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8f41a7a6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- withStudio
- dependencies
- use-funnel-analytics.ts
- Root Tooling and Lint
- Checkout and Status API
- FunnelDefinition
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
- solidgate-provider.ts
- validate.ts
- Supabase Funnel Repository
- webhook.ts
- events.ts
- Payments DB Migrations
- mock/webhook/route.ts
- Web TS Config
- repository.ts
- RuntimeInner
- ref_zod
- status/route.ts
- migrate
- Puck Screen Adapters
- Docker Compose
- Schema Package Manifest
- PaymentStore
- next
- Funnel Repository Interface
- funnelRoutes
- web/package.json
- Draft Saving and Validation
- Repository Audit (Stage 0)
- supabase-funnel-repository.ts
- Run Storage
- Schema TS Config
- README
- templates.ts
- Implementation Plan
- FunnelRuntime.tsx
- CheckoutPanel.tsx
- mock/webhook/route.ts
- src/proxy.ts
- Architecture
- service.ts
- [id]/leads/route.ts
- Seed Funnel
- Status log
- FilePaymentStore
- draft/route.ts
- Security
- layout.tsx
- Steps
- store.ts
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- docs.ts
- Steps
- ref_node_path
- health/route.ts
- parseJsonBody
- payment-status.ts
- scripts
- revocationOf
- Analytics and consent
- Public runtime
- marked
- motion
- leads.ts
- posthog-js
- @stripe/react-stripe-js
- @stripe/stripe-js

## God Nodes (most connected - your core abstractions)
1. `next` - 47 edges
2. `FileFunnelRepository` - 41 edges
3. `withStudio()` - 36 edges
4. `server-only` - 32 edges
5. `FunnelEditor()` - 31 edges
6. `SupabaseFunnelRepository` - 29 edges
7. `Status log` - 29 edges
8. `react` - 25 edges
9. `getPublishedReader()` - 24 edges
10. `FunnelRepository` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Stage 5: Analytics and publishing operations` --references--> `ConsentBanner()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → apps/web/src/components/ConsentBanner.tsx
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Known risks and open questions` --references--> `ScreenEditor()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/components/ScreenEditor.tsx
- `puck` --references--> `ScreenEditor()`  [INFERRED]
  docs/REPOSITORY_AUDIT.md → apps/web/src/components/ScreenEditor.tsx
- `Step: Autosave draft` --references--> `useDraftSaver()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/lib/use-draft-saver.ts

## Import Cycles
- None detected.

## Communities (84 total, 17 thin omitted)

### Community 0 - "withStudio"
Cohesion: 0.10
Nodes (23): Context, DELETE(), dynamic, Context, dynamic, GET(), Context, dynamic (+15 more)

### Community 1 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, @funnel/schema@workspace:*, mermaid@12.2.0, next@16.4.3, posthog-node@5.59.0, @puckeditor/core@0.23.0, react@19.3.1, react-dom@19.3.1 (+12 more)

### Community 2 - "use-funnel-analytics.ts"
Cohesion: 0.18
Nodes (19): ConsentBanner(), isBrowserAnalyticsConfigured(), startBrowserAnalytics(), warn(), ConsentDecision, ConsentState, readConsent(), warn() (+11 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "Checkout and Status API"
Cohesion: 0.29
Nodes (15): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), resolveCheckoutTarget(), cookieNonces(), mergeRunCookie() (+7 more)

### Community 5 - "FunnelDefinition"
Cohesion: 0.11
Nodes (10): DraftSaver, PublishedFunnel, PublishedReader, LeadTarget, parseStoredDefinition(), SupabasePublishedReader, toVersion(), Module boundaries (+2 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.21
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "Puck Blocks Config"
Cohesion: 0.08
Nodes (31): EmailBlock, emailBlocksOf(), EmailInputProps, emailKey(), isValidEmail(), blockId(), ALLOWED_COMPONENTS, ButtonBlock() (+23 more)

### Community 8 - "leads/registry.ts"
Cohesion: 0.16
Nodes (9): FileLeadStore, fileSchema, isNotFound(), LeadFile, recordSchema, FunnelLead, LeadInput, LeadStore (+1 more)

### Community 9 - "Payment Providers Registry"
Cohesion: 0.16
Nodes (12): isMockEnabled(), MockProvider, getPaymentProvider(), CheckoutInput, CheckoutResult, MockForbiddenError, PaymentEvent, PaymentProvider (+4 more)

### Community 10 - "Funnel Editor UI"
Cohesion: 0.11
Nodes (32): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+24 more)

### Community 11 - "file-payment-store.ts"
Cohesion: 0.16
Nodes (14): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), fileSchema, findAdjustmentTarget(), isNotFound() (+6 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.08
Nodes (39): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+31 more)

### Community 13 - "actions.ts"
Cohesion: 0.08
Nodes (35): accountClientKey(), authenticate(), AuthFormState, AuthKeys, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError() (+27 more)

### Community 14 - "Stripe Provider"
Cohesion: 0.14
Nodes (11): getPlan(), PAYER_HASH_PATTERN, adjustmentMetadataSchema, metadataSchema, STRIPE_API_VERSION, StripeProvider, StripeProviderDeps, PlanPriceMismatchError (+3 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (37): AnimationSettings(), COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), ANIMATION_PRESETS, animationPresetSchema (+29 more)

### Community 16 - "solidgate-provider.ts"
Cohesion: 0.15
Nodes (16): apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot, safeEqual() (+8 more)

### Community 17 - "validate.ts"
Cohesion: 0.17
Nodes (15): getOptionLists(), isFallbackEdge(), isPaymentScreen(), isQuiz(), IssueCode, IssueSeverity, OptionListInfo, OptionListScan (+7 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.20
Nodes (5): FunnelNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel()

### Community 19 - "webhook.ts"
Cohesion: 0.13
Nodes (27): POST(), dynamic, POST(), dynamic, POST(), isMissingServiceKey(), getPaymentStore(), getSolidgateProvider() (+19 more)

### Community 20 - "events.ts"
Cohesion: 0.13
Nodes (18): trackBrowserEvent(), AnalyticsEmitter, AnalyticsEvent, AnalyticsEventName, AnalyticsProperties, AnalyticsPropertyValue, AnalyticsSource, EmitOptions (+10 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.09
Nodes (24): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+16 more)

### Community 22 - "mock/webhook/route.ts"
Cohesion: 0.12
Nodes (22): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), dynamic, GET(), CheckoutTarget (+14 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "repository.ts"
Cohesion: 0.16
Nodes (23): signOut(), readSupabaseEnv(), requireSupabaseEnv(), resolveStorageMode(), StorageMode, SupabaseEnv, createSupabaseAnonClient(), createSupabaseServerClient() (+15 more)

### Community 25 - "RuntimeInner"
Cohesion: 0.21
Nodes (14): CustomDomainFunnelPage(), dynamic, dynamic, PublishedFunnelPage(), FunnelRuntime(), longestPathFrom(), parseDefinition(), ReturnParams (+6 more)

### Community 26 - "ref_zod"
Cohesion: 0.06
Nodes (61): Context, dynamic, isDomainTaken(), POST(), bodySchema, Context, dynamic, GET() (+53 more)

### Community 27 - "status/route.ts"
Cohesion: 0.12
Nodes (30): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, dynamic, POST() (+22 more)

### Community 28 - "migrate"
Cohesion: 0.20
Nodes (13): DefinitionCheck, isOlderDefinition(), parseInput(), Step: Validate definition, clampScreenAnimation(), isRecord(), migrate(), MigrationError (+5 more)

### Community 29 - "Puck Screen Adapters"
Cohesion: 0.24
Nodes (13): PUCK_OVERRIDES, ScreenEditor(), ScreenEditorProps, applyOptionMode(), fromPuckData(), OptionRef, toPuckData(), PuckItem (+5 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "PaymentStore"
Cohesion: 0.12
Nodes (5): AdjustmentResult, PaymentStore, RecordResult, SupabasePaymentStore, Data flow

### Community 33 - "next"
Cohesion: 0.11
Nodes (19): dynamic, PreviewPage(), DocsIndexPage(), dynamic, dynamic, EditFunnelPage(), dynamic, StudioPage() (+11 more)

### Community 35 - "funnelRoutes"
Cohesion: 0.12
Nodes (21): formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, describe(), formatDate(), formatMoney() (+13 more)

### Community 36 - "web/package.json"
Cohesion: 0.17
Nodes (14): stripe@23.0.1, devDependencies, @types/node@22.19.1, @types/react@19.3.0, @types/react-dom@19.3.0, typescript@5.9.3, typescript, name (+6 more)

### Community 37 - "Draft Saving and Validation"
Cohesion: 0.17
Nodes (15): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+7 more)

### Community 38 - "Repository Audit (Stage 0)"
Cohesion: 0.06
Nodes (50): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+42 more)

### Community 39 - "supabase-funnel-repository.ts"
Cohesion: 0.08
Nodes (29): domainStatusSchema, domainFileSchema, isNotFound(), versionSummarySchema, DefinitionInvalidError, DomainCheck, DomainLimitError, DomainNotFoundError (+21 more)

### Community 41 - "Run Storage"
Cohesion: 0.24
Nodes (16): loadUsableRun(), adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN, runIdKey() (+8 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "templates.ts"
Cohesion: 0.30
Nodes (13): randomId(), newOptionId(), checkoutBlock(), createScreenContent(), heading(), nextButton(), optionList(), paragraph() (+5 more)

### Community 45 - "Implementation Plan"
Cohesion: 0.20
Nodes (10): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 1: Minimal vertical slice (in progress), Stage 2: Components and logic, Stage 3: Database and publishing, Stage 5: Analytics and publishing operations, Stage 6: Custom domains (+2 more)

### Community 46 - "FunnelRuntime.tsx"
Cohesion: 0.16
Nodes (22): contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS, RuntimeProps (+14 more)

### Community 47 - "CheckoutPanel.tsx"
Cohesion: 0.29
Nodes (11): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, REF_KEY(), rememberSolidgateRef() (+3 more)

### Community 48 - "mock/webhook/route.ts"
Cohesion: 0.21
Nodes (11): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, formSchema (+3 more)

### Community 49 - "src/proxy.ts"
Cohesion: 0.13
Nodes (25): @supabase/ssr@0.12.7, SESSION_COOKIE_OPTIONS, SessionResult, updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage() (+17 more)

### Community 50 - "Architecture"
Cohesion: 0.20
Nodes (10): Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Known risks and open questions, Repository layout, Stack (+2 more)

### Community 51 - "service.ts"
Cohesion: 0.09
Nodes (18): dynamic, NO_STORE, POST(), Summary, dynamic, NO_STORE, POST(), createSupabaseServiceClient() (+10 more)

### Community 52 - "[id]/leads/route.ts"
Cohesion: 0.25
Nodes (9): Context, dynamic, GET(), csvCell(), HEADER, leadsToCsv(), Step: Export CSV, Step: List leads (+1 more)

### Community 53 - "Seed Funnel"
Cohesion: 0.39
Nodes (8): button(), createSeedFunnel(), heading(), options(), paragraph(), puck(), PuckItem, skipButton()

### Community 54 - "Status log"
Cohesion: 0.44
Nodes (8): Step: Screen routing, Status log, matches(), nextScreen(), NextScreenOptions, own(), isPaymentType(), isSkipType()

### Community 56 - "draft/route.ts"
Cohesion: 0.32
Nodes (7): Context, dynamic, GET(), PUT(), saveSchema, checkDefinition(), Step: Save draft route

### Community 57 - "Security"
Cohesion: 0.18
Nodes (11): Custom domains, Leads (personal data), Operational, Payment rules, Response headers, Runtime safety, Secrets policy, Security (+3 more)

### Community 59 - "Steps"
Cohesion: 0.15
Nodes (15): PaymentAdjustment, processAdjustment(), Flow, Refunds and disputes, Related, Step: Apply deferred, Step: Daily report, Step: Defer adjustment (+7 more)

### Community 60 - "store.ts"
Cohesion: 0.18
Nodes (18): FunnelPayment, RecordRejection, StaleDeferred, StatusDetail, StatusQuery, accessRowSchema, funnelPaymentRowSchema, projectRowSchema (+10 more)

### Community 68 - "docs.ts"
Cohesion: 0.15
Nodes (10): DocPage(), dynamic, MermaidDiagrams(), DocEntry, DocGroup, listFeatures(), loadDoc(), readOptional() (+2 more)

### Community 69 - "Steps"
Cohesion: 0.22
Nodes (9): Flow, Related, Step: Autosave draft, Step: Edit graph, Step: Funnel versions, Step: Rollback, Steps, Studio authoring (+1 more)

### Community 70 - "ref_node_path"
Cohesion: 0.33
Nodes (4): devOrigins, nextConfig, privateHeaders, securityHeaders

### Community 72 - "parseJsonBody"
Cohesion: 0.36
Nodes (7): invalid(), ParsedBody, parseJsonBody(), sizeLabel(), BodyResult, MAX_BODY_BYTES, readJsonBody()

### Community 73 - "payment-status.ts"
Cohesion: 0.40
Nodes (5): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult

### Community 74 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, typecheck

### Community 75 - "revocationOf"
Cohesion: 0.67
Nodes (3): rowRevocation(), revocationOf(), Step: Access policy

### Community 76 - "Analytics and consent"
Cohesion: 0.29
Nodes (7): Analytics and consent, Flow, Related, Step: Consent travels with checkout, Steps, What is and is not sent, What it does

### Community 77 - "Public runtime"
Cohesion: 0.50
Nodes (4): Flow, Public runtime, Related, What it does

### Community 80 - "leads.ts"
Cohesion: 0.33
Nodes (6): emailBlocks(), LEADS_ROUTE, LeadSubmission, sendLead(), warn(), Step: Send on advance

## Knowledge Gaps
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `withStudio`, `dependencies`, `Checkout and Status API`, `Puck Blocks Config`, `Funnel Editor UI`, `actions.ts`, `webhook.ts`, `mock/webhook/route.ts`, `repository.ts`, `RuntimeInner`, `ref_zod`, `status/route.ts`, `web/package.json`, `mock/webhook/route.ts`, `src/proxy.ts`, `service.ts`, `[id]/leads/route.ts`, `draft/route.ts`, `layout.tsx`, `docs.ts`, `health/route.ts`, `parseJsonBody`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `withStudio` be split into smaller, more focused modules?**
  _Cohesion score 0.10114942528735632 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `repository.ts` to `withStudio`, `dependencies`, `Checkout and Status API`, `FunnelDefinition`, `leads/registry.ts`, `Payment Providers Registry`, `file-payment-store.ts`, `Stripe Provider`, `solidgate-provider.ts`, `webhook.ts`, `events.ts`, `mock/webhook/route.ts`, `ref_zod`, `status/route.ts`, `web/package.json`, `supabase-funnel-repository.ts`, `service.ts`, `store.ts`, `docs.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `withStudio()` (e.g. with `Storage, auth and public read path (Stage 3)` and `Component responsibilities`) actually correct?**
  _`withStudio()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `react` connect `funnelRoutes` to `dependencies`, `next`, `ref_zod`, `web/package.json`, `docs.ts`, `use-funnel-analytics.ts`, `Puck Blocks Config`, `Draft Saving and Validation`, `Funnel Editor UI`, `actions.ts`, `FunnelRuntime.tsx`, `Funnel Schema and Theme`, `CheckoutPanel.tsx`, `repository.ts`, `layout.tsx`, `Puck Screen Adapters`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._