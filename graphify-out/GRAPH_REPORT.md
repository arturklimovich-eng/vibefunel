# Graph Report - funnel-platform  (2026-11-03)

## Corpus Check
- 219 files · ~128,921 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .css 11, (none) 6, .example 1)

## Summary
- 2044 nodes · 5429 edges · 95 communities (85 shown, 10 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 378 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c9bab04c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- withStudio
- web/package.json
- use-funnel-analytics.ts
- Root Tooling and Lint
- checkout/route.ts
- content.tsx
- File Funnel Repository
- config.tsx
- server-only
- FunnelEditor.tsx
- FunnelEditor
- AssistantPanel.tsx
- Core DB Schema Migrations
- parseJsonBody
- ScreenCanvas.tsx
- Funnel Schema and Theme
- solidgate-provider.ts
- Status log
- Supabase Funnel Repository
- SECURITY.md
- StudioDashboard.tsx
- Payments DB Migrations
- mock/webhook/route.ts
- Web TS Config
- catalog.tsx
- actions.ts
- verify.ts
- ref_zod
- migrate.ts
- ScreenStyles.tsx
- Docker Compose
- Schema Package Manifest
- studio-overview.ts
- paywall.tsx
- Funnel Repository Interface
- funnelRoutes
- Repository Audit (Stage 0)
- use-draft-saver.ts
- styles.ts
- file-funnel-repository.ts
- StyleFields.tsx
- Schema TS Config
- README
- types.ts
- next
- FunnelRuntime.tsx
- repository.ts
- RuntimeInner
- inputs.tsx
- next
- api/leads/route.ts
- flow.tsx
- public.domains
- docs.ts
- Lead capture
- isMissingServiceKey
- cron/domains/route.ts
- types.ts
- webhook.ts
- DomainsPanel.tsx
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- [id]/domains/route.ts
- Data flow
- react
- public.payment_orphans
- payment-status.ts
- ThemeEditor.tsx
- Studio overview
- Implementation Plan
- repository.ts
- templates.ts
- getPublishedReader
- FunnelRuntime
- file-funnel-repository.ts
- ConditionPicker.tsx
- Screen elements
- frame.tsx
- Deployment
- Steps
- seed.ts
- public.leads
- Feature map
- Custom domains
- Checkout
- FunnelDefinition
- Steps
- Studio authoring

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 79 edges
2. `next` - 51 edges
3. `react` - 51 edges
4. `FileFunnelRepository` - 41 edges
5. `parse()` - 39 edges
6. `Icon()` - 38 edges
7. `withStudio()` - 36 edges
8. `server-only` - 34 edges
9. `useRuntime()` - 31 edges
10. `FunnelDefinition` - 30 edges

## Surprising Connections (you probably didn't know these)
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Step: Frame` --references--> `FunnelRuntime()`  [INFERRED]
  docs/features/12-elements.md → apps/web/src/components/FunnelRuntime.tsx
- `Step: Autosave draft` --references--> `useDraftSaver()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/lib/use-draft-saver.ts
- `Storage, auth and public read path (Stage 3)` --references--> `withStudio()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/server/api-helpers.ts
- `Component responsibilities` --references--> `withStudio()`  [INFERRED]
  docs/C4.md → apps/web/src/server/api-helpers.ts

## Import Cycles
- None detected.

## Communities (95 total, 10 thin omitted)

### Community 0 - "withStudio"
Cohesion: 0.11
Nodes (23): Context, DELETE(), dynamic, Context, dynamic, GET(), PUT(), saveSchema (+15 more)

### Community 1 - "web/package.json"
Cohesion: 0.05
Nodes (53): dependencies, @funnel/schema@workspace:*, lottie-web@5.12.2, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2 (+45 more)

### Community 2 - "use-funnel-analytics.ts"
Cohesion: 0.06
Nodes (53): isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent(), warn() (+45 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "checkout/route.ts"
Cohesion: 0.17
Nodes (23): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+15 more)

### Community 5 - "content.tsx"
Cohesion: 0.08
Nodes (30): badgeProps, chartProps, contentComponents, Divider(), dividerProps, faqProps, listProps, lottieProps (+22 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.18
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "config.tsx"
Cohesion: 0.10
Nodes (33): EmailInputProps, emailKey(), isValidEmail(), OptionRef, allowedTypesFor(), allowedComponentsForScreenType(), checkoutBlockProps, configForScreenType() (+25 more)

### Community 8 - "server-only"
Cohesion: 0.11
Nodes (21): Context, dynamic, GET(), csvCell(), HEADER, leadsToCsv(), FileLeadStore, fileSchema (+13 more)

### Community 9 - "FunnelEditor.tsx"
Cohesion: 0.07
Nodes (30): AnimationSettings(), ConnectionChoice, ADD_CHOICES, AddChoice, AddMenuAnchor, describeSaveState(), formatTime(), IMAGE_POSITIONS (+22 more)

### Community 10 - "FunnelEditor"
Cohesion: 0.17
Nodes (31): ArrowUpIcon(), ChatIcon(), ChevronLeft(), ChevronRight(), CopyIcon(), DotsIcon(), DuplicateIcon(), ExternalIcon() (+23 more)

### Community 11 - "AssistantPanel.tsx"
Cohesion: 0.13
Nodes (22): AssistantPanel(), Card, demoReply(), Message, PALETTES, PlanStep, SUGGESTIONS, TypeMeta (+14 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.15
Nodes (23): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+15 more)

### Community 13 - "parseJsonBody"
Cohesion: 0.22
Nodes (11): Context, dynamic, POST(), rollbackSchema, invalid(), ParsedBody, parseJsonBody(), sizeLabel() (+3 more)

### Community 14 - "ScreenCanvas.tsx"
Cohesion: 0.11
Nodes (31): buttonEdges(), CanvasMode, EditOverlay(), Focus(), layoutColumns(), NODE_TYPES, PHONE_H, PHONE_W (+23 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (36): ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, edgeSchema, funnelSchema, funnelVersionSchema (+28 more)

### Community 16 - "solidgate-provider.ts"
Cohesion: 0.07
Nodes (31): PAYER_HASH_PATTERN, apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot (+23 more)

### Community 17 - "Status log"
Cohesion: 0.09
Nodes (36): ActionField(), MissingServiceKeyError, Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Repository layout (+28 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.17
Nodes (7): DomainCheck, DomainNotFoundError, FunnelNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel()

### Community 19 - "SECURITY.md"
Cohesion: 0.42
Nodes (3): C4 model, Level 1: System context, Level 2: Containers

### Community 20 - "StudioDashboard.tsx"
Cohesion: 0.16
Nodes (20): DeleteFunnelButton(), FlowIcon(), PenIcon(), compress(), CreateAnotherButton(), formatMoney(), formatPercent(), FunnelActions() (+12 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.12
Nodes (18): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+10 more)

### Community 22 - "mock/webhook/route.ts"
Cohesion: 0.10
Nodes (31): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), dynamic, escapeHtml(), GET() (+23 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "catalog.tsx"
Cohesion: 0.06
Nodes (50): AddElementPanel(), isAttached(), NO_PREVIEW, presetProps(), Preview(), useApplyPresets(), usePuck, describe() (+42 more)

### Community 25 - "actions.ts"
Cohesion: 0.06
Nodes (57): accountClientKey(), authenticate(), AuthFormState, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK (+49 more)

### Community 26 - "verify.ts"
Cohesion: 0.17
Nodes (18): Context, dynamic, isDomainTaken(), POST(), RoutingStatus, txtRecordName(), txtRecordValue(), domainTarget (+10 more)

### Community 27 - "ref_zod"
Cohesion: 0.14
Nodes (18): useEditorData(), ACTION_LABELS, BUTTON_ACTIONS, buttonComponents, buttonProps, ButtonView(), css(), DestinationField() (+10 more)

### Community 28 - "migrate.ts"
Cohesion: 0.27
Nodes (10): clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition, retypeScreen(), textScreen(), toTextItem(), CURRENT_SCHEMA_VERSION (+2 more)

### Community 29 - "ScreenStyles.tsx"
Cohesion: 0.26
Nodes (19): ChevronDown(), ColorRow(), joinColor(), Label(), NumberInput(), NumberInputProps, NumberRow(), Row() (+11 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "studio-overview.ts"
Cohesion: 0.13
Nodes (18): bucketIndex(), buildWindow(), DAY_FORMAT, FunnelRow, loadStudioOverview(), Metric, MONTH_FORMAT, OVERVIEW_RANGES (+10 more)

### Community 33 - "paywall.tsx"
Cohesion: 0.14
Nodes (20): checkboxProps, datePickerProps, PlanItem, planPickerProps, ratingProps, SELECTED_PLAN_KEY, textInputProps, totalsProps (+12 more)

### Community 35 - "funnelRoutes"
Cohesion: 0.10
Nodes (27): formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm(), slugify() (+19 more)

### Community 36 - "Repository Audit (Stage 0)"
Cohesion: 0.15
Nodes (13): coolify, License table, Method, motion, Not integrated / rejected, posthog, react-sdk (Solidgate), react-stripe-js (+5 more)

### Community 37 - "use-draft-saver.ts"
Cohesion: 0.14
Nodes (18): AssistantPanelProps, IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson() (+10 more)

### Community 38 - "styles.ts"
Cohesion: 0.06
Nodes (48): ANIMATION_OPTIONS, EFFECT_TYPES, InspectedElement, Tab, VISIBILITY_OPTIONS, cleanObject(), Group, KIND (+40 more)

### Community 39 - "file-funnel-repository.ts"
Cohesion: 0.09
Nodes (18): DefinitionInvalidError, ForbiddenError, PublishedFunnel, PublishedReader, parseStoredDefinition(), domainRowSchema, draftRowSchema, funnelRowSchema (+10 more)

### Community 41 - "StyleFields.tsx"
Cohesion: 0.09
Nodes (22): ALIGN_OPTIONS, DECORATION_OPTIONS, EFFECT_OPTIONS, FONT_OPTIONS, POSITION_LABELS, POSITION_OPTIONS, SHADOW_OPTIONS, StyleFieldsProps (+14 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "types.ts"
Cohesion: 0.10
Nodes (32): dynamic, formSchema, POST(), dynamic, NO_STORE, querySchema, dynamic, POST() (+24 more)

### Community 45 - "next"
Cohesion: 0.23
Nodes (9): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, studioShellProps(), MermaidDiagrams(), listDocs() (+1 more)

### Community 46 - "FunnelRuntime.tsx"
Cohesion: 0.12
Nodes (29): ConsentBanner(), contrastingForeground(), EmailBlock, emailBlocks(), foregroundForLuminance(), linearize(), parseChannel(), parseHex() (+21 more)

### Community 47 - "repository.ts"
Cohesion: 0.22
Nodes (12): dynamic, EditFunnelPage(), dynamic, StudioPage(), uiFont, StorageMode, getDataDir(), getFileRepository() (+4 more)

### Community 48 - "RuntimeInner"
Cohesion: 0.27
Nodes (15): loadUsableRun(), adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN, runIdKey() (+7 more)

### Community 49 - "inputs.tsx"
Cohesion: 0.15
Nodes (18): sliderProps, editorOnly(), EmailOAuth(), emailOAuthProps, EMOJI_SCALE, inputComponents, OAuthButton(), oauthButtonProps (+10 more)

### Community 50 - "next"
Cohesion: 0.13
Nodes (4): dynamic, metadata, viewport, next

### Community 51 - "api/leads/route.ts"
Cohesion: 0.10
Nodes (36): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, dynamic, POST() (+28 more)

### Community 52 - "flow.tsx"
Cohesion: 0.10
Nodes (43): Badge(), Chart(), Faq(), Lottie(), Video(), autoNext, CookieConsent(), cookieProps (+35 more)

### Community 53 - "public.domains"
Cohesion: 0.21
Nodes (11): domains_funnel_id_idx, domains_guard, domains_project_id_idx, domains_verified_hostname_idx, public.domains, public.domains_guard(), public.get_published_funnel_by_host(), public.is_host_servable() (+3 more)

### Community 54 - "docs.ts"
Cohesion: 0.13
Nodes (10): devOrigins, nextConfig, privateHeaders, securityHeaders, DocEntry, DocGroup, listFeatures(), readOptional() (+2 more)

### Community 55 - "Lead capture"
Cohesion: 0.50
Nodes (4): Flow, Lead capture, Related, What it does

### Community 56 - "isMissingServiceKey"
Cohesion: 0.19
Nodes (10): dynamic, NO_STORE, POST(), Context, dynamic, GET(), isMissingServiceKey(), cronAuthorized() (+2 more)

### Community 57 - "cron/domains/route.ts"
Cohesion: 0.27
Nodes (9): dynamic, NO_STORE, POST(), Summary, checkDomainOwnership(), configuredDnsServers(), DnsConfigError, getDomainMaintenance() (+1 more)

### Community 58 - "types.ts"
Cohesion: 0.06
Nodes (40): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+32 more)

### Community 59 - "webhook.ts"
Cohesion: 0.08
Nodes (36): dynamic, POST(), isSolidgateConfigured(), isAdjustment(), PaymentAdjustment, toPublicPaymentStatus(), emitAdjustment(), eventUuid() (+28 more)

### Community 60 - "DomainsPanel.tsx"
Cohesion: 0.18
Nodes (16): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+8 more)

### Community 68 - "[id]/domains/route.ts"
Cohesion: 0.20
Nodes (16): bodySchema, Context, dynamic, GET(), POST(), HOSTNAME_MAX_LENGTH, normalizeHostname(), appHost() (+8 more)

### Community 69 - "Data flow"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+2 more)

### Community 71 - "react"
Cohesion: 0.26
Nodes (12): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, CheckoutBlockView(), REF_KEY() (+4 more)

### Community 72 - "public.payment_orphans"
Cohesion: 0.24
Nodes (6): public.payment_orphans, public.record_payment_adjustment(), public.record_payment_adjustment(), payment_orphans_payment_idx, payment_orphans_run_idx, public.apply_deferred_adjustments()

### Community 73 - "payment-status.ts"
Cohesion: 0.40
Nodes (5): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult

### Community 74 - "ThemeEditor.tsx"
Cohesion: 0.24
Nodes (9): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE (+1 more)

### Community 75 - "Studio overview"
Cohesion: 0.25
Nodes (7): Flow, Step: Create a funnel, Step: Load funnels, Step: Render, Steps, Studio overview, What it does

### Community 76 - "Implementation Plan"
Cohesion: 0.25
Nodes (8): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 2: Components and logic, Stage 3: Database and publishing, Stage 6: Custom domains, Stage overview, Verification commands (all stages)

### Community 77 - "repository.ts"
Cohesion: 0.16
Nodes (11): domainStatusSchema, createSupabaseServiceClient(), resultSchema, rowSchema, SupabaseDomainMaintenance, toDomain(), DomainMaintenance, RecheckOutcome (+3 more)

### Community 78 - "templates.ts"
Cohesion: 0.27
Nodes (16): newScreen(), shortId(), randomId(), attached(), checkoutBlock(), createQuizContent(), createScreenContent(), heading() (+8 more)

### Community 79 - "getPublishedReader"
Cohesion: 0.31
Nodes (7): CustomDomainFunnelPage(), dynamic, dynamic, PublishedFunnelPage(), parseReturnParams(), SearchParams, single()

### Community 80 - "FunnelRuntime"
Cohesion: 0.24
Nodes (9): dynamic, PreviewPage(), FunnelRuntime(), parseDefinition(), Flow, Public runtime, Related, Step: Render screen (+1 more)

### Community 81 - "file-funnel-repository.ts"
Cohesion: 0.13
Nodes (15): DomainStatus, domainFileSchema, isNotFound(), versionSummarySchema, DomainLimitError, DomainTakenError, FunnelDraft, FunnelValidationError (+7 more)

### Community 82 - "ConditionPicker.tsx"
Cohesion: 0.18
Nodes (17): choiceToCondition(), ConditionPicker(), decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition(), getScreenOptions() (+9 more)

### Community 83 - "Screen elements"
Cohesion: 0.67
Nodes (3): Flow, Screen elements, What it does

### Community 85 - "frame.tsx"
Cohesion: 0.23
Nodes (9): Frame(), framed(), FramedBlock(), defaultApi, ThemeContext, useFunnelTheme(), containerStyle(), isElementVisible() (+1 more)

### Community 86 - "Deployment"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 88 - "Steps"
Cohesion: 0.13
Nodes (14): AI assistant (design), Flow, Rollout, Security, Step: Assistant route, Step: Generative UI cards, Step: Guards, Step: Model adapter (+6 more)

### Community 90 - "seed.ts"
Cohesion: 0.36
Nodes (10): Step: Catalog, button(), createSeedFunnel(), createStarterFunnel(), heading(), options(), paragraph(), puck() (+2 more)

### Community 92 - "public.leads"
Cohesion: 0.53
Nodes (5): leads_funnel_created_idx, leads_project_id_idx, leads_version_id_idx, public.leads, public.record_lead()

### Community 94 - "Feature map"
Cohesion: 0.40
Nodes (5): Background jobs, Feature map, How a funnel lives, Keeping these pages current, Map

### Community 95 - "Custom domains"
Cohesion: 0.40
Nodes (5): Custom domains, Domain status, Flow, Related, What it does

### Community 97 - "Checkout"
Cohesion: 0.50
Nodes (4): Checkout, Flow, Related, What it does

### Community 98 - "FunnelDefinition"
Cohesion: 0.21
Nodes (12): checkDefinition(), DefinitionCheck, isOlderDefinition(), parseInput(), Step: Autosave draft, Step: Funnel versions, Step: Rollback, Step: Validate definition (+4 more)

### Community 100 - "Steps"
Cohesion: 0.20
Nodes (10): screenGate(), valueOf(), Step: Add Element panel, Step: Authentication, Step: Button actions, Step: Continue gates, Step: Frame, Step: Loaders (+2 more)

### Community 107 - "Studio authoring"
Cohesion: 0.50
Nodes (4): Flow, Related, Studio authoring, What it does

## Knowledge Gaps
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `withStudio`, `web/package.json`, `checkout/route.ts`, `config.tsx`, `server-only`, `FunnelEditor.tsx`, `AssistantPanel.tsx`, `parseJsonBody`, `ScreenCanvas.tsx`, `StudioDashboard.tsx`, `mock/webhook/route.ts`, `actions.ts`, `verify.ts`, `funnelRoutes`, `types.ts`, `next`, `repository.ts`, `api/leads/route.ts`, `flow.tsx`, `isMissingServiceKey`, `cron/domains/route.ts`, `webhook.ts`, `[id]/domains/route.ts`, `getPublishedReader`, `FunnelRuntime`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `withStudio` be split into smaller, more focused modules?**
  _Cohesion score 0.10837438423645321 - nodes in this community are weakly interconnected._
- **Why does `react` connect `frame.tsx` to `web/package.json`, `use-funnel-analytics.ts`, `content.tsx`, `config.tsx`, `FunnelEditor.tsx`, `FunnelEditor`, `AssistantPanel.tsx`, `ScreenCanvas.tsx`, `StudioDashboard.tsx`, `catalog.tsx`, `actions.ts`, `ref_zod`, `ScreenStyles.tsx`, `paywall.tsx`, `funnelRoutes`, `use-draft-saver.ts`, `styles.ts`, `StyleFields.tsx`, `next`, `FunnelRuntime.tsx`, `repository.ts`, `inputs.tsx`, `next`, `flow.tsx`, `DomainsPanel.tsx`, `react`, `ThemeEditor.tsx`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.050314465408805034 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `server-only` to `withStudio`, `web/package.json`, `use-funnel-analytics.ts`, `checkout/route.ts`, `solidgate-provider.ts`, `mock/webhook/route.ts`, `actions.ts`, `verify.ts`, `studio-overview.ts`, `file-funnel-repository.ts`, `types.ts`, `next`, `repository.ts`, `api/leads/route.ts`, `docs.ts`, `isMissingServiceKey`, `types.ts`, `webhook.ts`, `repository.ts`, `file-funnel-repository.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._