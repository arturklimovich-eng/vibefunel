# Graph Report - funnel-platform  (2026-11-03)

## Corpus Check
- 226 files · ~134,345 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .css 11, (none) 6, .example 1)

## Summary
- 2130 nodes · 5696 edges · 95 communities (84 shown, 11 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 383 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `51721ebf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Status log
- web/package.json
- use-funnel-analytics.ts
- Root Tooling and Lint
- ref_zod
- elements/layout.tsx
- File Funnel Repository
- config.tsx
- server-only
- layout.ts
- FunnelEditor
- index.ts
- Core DB Schema Migrations
- withStudio
- ScreenCanvas.tsx
- Funnel Schema and Theme
- solidgate-provider.ts
- validate.ts
- Supabase Funnel Repository
- devDependencies
- StudioDashboard.tsx
- Payments DB Migrations
- plans.ts
- Web TS Config
- catalog.tsx
- actions.ts
- verify.ts
- button.tsx
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
- parseStoredDefinition
- StyleFields.tsx
- Schema TS Config
- README
- confirm/route.ts
- next
- FunnelRuntime.tsx
- src/proxy.ts
- RuntimeInner
- inputs.tsx
- next
- email.ts
- flow.tsx
- public.domains
- switch-platform-domain.mjs
- content.tsx
- AI assistant (design)
- Architecture
- file-payment-store.ts
- webhook.ts
- DomainsPanel.tsx
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- normalizeHostname
- next.config.mjs
- scripts
- react
- public.payment_orphans
- payment-status.ts
- ThemeEditor.tsx
- LayersPanel.tsx
- Implementation Plan
- supabase/proxy.ts
- templates.ts
- app/layout.tsx
- file-funnel-repository.ts
- ConditionPicker.tsx
- ElementInspector.tsx
- frame.tsx
- getStudioContext
- Steps
- docs.ts
- seed.ts
- repository.ts
- public.leads
- Steps
- index.ts
- Refunds and disputes
- Auth and access
- public.funnel_groups

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 79 edges
2. `next` - 55 edges
3. `react` - 52 edges
4. `FileFunnelRepository` - 47 edges
5. `withStudio()` - 43 edges
6. `Icon()` - 39 edges
7. `parse()` - 39 edges
8. `SupabaseFunnelRepository` - 35 edges
9. `server-only` - 34 edges
10. `RuntimeInner()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Stage 5: Analytics and publishing operations` --references--> `ConsentBanner()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → apps/web/src/components/ConsentBanner.tsx
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Step: Frame` --references--> `FunnelRuntime()`  [INFERRED]
  docs/features/12-elements.md → apps/web/src/components/FunnelRuntime.tsx
- `Known risks and open questions` --references--> `ScreenEditor()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/components/ScreenEditor.tsx
- `puck` --references--> `ScreenEditor()`  [INFERRED]
  docs/REPOSITORY_AUDIT.md → apps/web/src/components/ScreenEditor.tsx

## Import Cycles
- None detected.

## Communities (95 total, 11 thin omitted)

### Community 0 - "Status log"
Cohesion: 0.40
Nodes (9): ActionField(), Step: Screen routing, Status log, matches(), nextScreen(), NextScreenOptions, own(), isPaymentType() (+1 more)

### Community 1 - "web/package.json"
Cohesion: 0.07
Nodes (36): dependencies, @funnel/schema@workspace:*, lottie-web@5.12.2, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2 (+28 more)

### Community 2 - "use-funnel-analytics.ts"
Cohesion: 0.06
Nodes (53): isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent(), warn() (+45 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "ref_zod"
Cohesion: 0.12
Nodes (40): bodySchema, dynamic, POST(), rateLimited(), appOrigin(), bodySchema, dynamic, POST() (+32 more)

### Community 5 - "elements/layout.tsx"
Cohesion: 0.12
Nodes (20): carouselProps, columnsProps, layoutComponents, popupProps, rowsProps, slot, Components, number() (+12 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.16
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "config.tsx"
Cohesion: 0.16
Nodes (20): checkoutBlockProps, Heading(), headingProps, ImageBlock(), imageProps, isHttpsUrl(), OptionListBlock(), OptionPopup() (+12 more)

### Community 8 - "server-only"
Cohesion: 0.11
Nodes (21): Context, dynamic, GET(), csvCell(), HEADER, leadsToCsv(), FileLeadStore, fileSchema (+13 more)

### Community 10 - "FunnelEditor"
Cohesion: 0.08
Nodes (63): AnimationSettings(), AssistantPanel(), ArrowUpIcon(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight(), CloseIcon() (+55 more)

### Community 11 - "index.ts"
Cohesion: 0.12
Nodes (23): Bridge(), EditorBridgeState, EditorSelection, ScreenEditor(), ScreenEditorProps, usePuck, fromPuckData(), allowedTypesFor() (+15 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.15
Nodes (23): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+15 more)

### Community 13 - "withStudio"
Cohesion: 0.07
Nodes (45): Context, DELETE(), dynamic, PATCH(), renameSchema, createSchema, dynamic, GET() (+37 more)

### Community 14 - "ScreenCanvas.tsx"
Cohesion: 0.15
Nodes (23): buttonEdges(), CanvasMode, EditOverlay(), Focus(), layoutColumns(), NODE_TYPES, PHONE_H, PHONE_W (+15 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (38): ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, edgeSchema, funnelSchema, funnelVersionSchema (+30 more)

### Community 16 - "solidgate-provider.ts"
Cohesion: 0.06
Nodes (42): isMockEnabled(), MockProvider, PAYER_HASH_PATTERN, apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema (+34 more)

### Community 17 - "validate.ts"
Cohesion: 0.18
Nodes (16): getOptionLists(), isFallbackEdge(), isPaymentScreen(), isQuiz(), IssueCode, IssueSeverity, OptionListInfo, OptionListScan (+8 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.16
Nodes (8): FunnelGroup, FunnelNotFoundError, GroupNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel(), toGroup()

### Community 19 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @types/node@22.19.1, @types/react@19.3.0, @types/react-dom@19.3.0, typescript@5.9.3, typescript, @types/node, @types/react (+1 more)

### Community 20 - "StudioDashboard.tsx"
Cohesion: 0.09
Nodes (43): BookIcon(), DotsIcon(), FlowIcon(), FolderIcon(), HomeIcon(), LogoMark(), LogoutIcon(), PenIcon() (+35 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.12
Nodes (18): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+10 more)

### Community 22 - "plans.ts"
Cohesion: 0.06
Nodes (44): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), dynamic, GET(), pickerPlanKeys() (+36 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "catalog.tsx"
Cohesion: 0.09
Nodes (27): AddElementPanel(), isAttached(), NO_PREVIEW, presetProps(), Preview(), useApplyPresets(), usePuck, randomId() (+19 more)

### Community 25 - "actions.ts"
Cohesion: 0.07
Nodes (38): accountClientKey(), authenticate(), AuthFormState, AuthKeys, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError() (+30 more)

### Community 26 - "verify.ts"
Cohesion: 0.16
Nodes (21): Context, dynamic, isDomainTaken(), POST(), RoutingStatus, txtRecordName(), txtRecordValue(), checkDomainDns() (+13 more)

### Community 27 - "button.tsx"
Cohesion: 0.15
Nodes (16): ACTION_LABELS, BUTTON_ACTIONS, buttonComponents, buttonProps, ButtonView(), css(), TargetField(), usePuck (+8 more)

### Community 28 - "migrate.ts"
Cohesion: 0.17
Nodes (16): DefinitionCheck, isOlderDefinition(), parseInput(), Step: Validate definition, clampScreenAnimation(), isRecord(), migrate(), MigrationError (+8 more)

### Community 29 - "ScreenStyles.tsx"
Cohesion: 0.21
Nodes (24): channel(), ColorRow(), hexOf(), hslToRgb(), joinColor(), Label(), NumberInput(), NumberInputProps (+16 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "studio-overview.ts"
Cohesion: 0.16
Nodes (19): revocationOf(), bucketIndex(), buildWindow(), DAY_FORMAT, FunnelRow, isPaid(), loadStudioOverview(), MONTH_FORMAT (+11 more)

### Community 33 - "paywall.tsx"
Cohesion: 0.12
Nodes (23): checkboxProps, datePickerProps, PLAN_PICKER_TYPES, PlanItem, planPickerProps, ratingProps, SELECTED_PLAN_KEY, sliderProps (+15 more)

### Community 35 - "funnelRoutes"
Cohesion: 0.10
Nodes (28): DeleteFunnelButton(), formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm() (+20 more)

### Community 36 - "Repository Audit (Stage 0)"
Cohesion: 0.05
Nodes (51): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 4. Checkout, webhook, status, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication (+43 more)

### Community 37 - "use-draft-saver.ts"
Cohesion: 0.09
Nodes (26): AssistantPanelProps, Card, demoReply(), Message, PALETTES, PlanStep, SUGGESTIONS, TypeMeta (+18 more)

### Community 38 - "styles.ts"
Cohesion: 0.07
Nodes (33): animationSchema, builtinTokens(), BUTTON_TYPES, cssUrl(), ElementAnimation, elementMetaSchema, elementStyleSchema, FONT_STACKS (+25 more)

### Community 39 - "parseStoredDefinition"
Cohesion: 0.19
Nodes (7): PublishedFunnel, PublishedReader, parseStoredDefinition(), SupabasePublishedReader, toVersion(), Module boundaries, Step: Load live version

### Community 41 - "StyleFields.tsx"
Cohesion: 0.10
Nodes (21): ALIGN_OPTIONS, DECORATION_OPTIONS, EFFECT_OPTIONS, FONT_OPTIONS, POSITION_LABELS, POSITION_OPTIONS, SHADOW_OPTIONS, StyleFieldsProps (+13 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "confirm/route.ts"
Cohesion: 0.43
Nodes (7): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, formatPrice()

### Community 45 - "next"
Cohesion: 0.27
Nodes (7): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, studioShellProps(), MermaidDiagrams()

### Community 46 - "FunnelRuntime.tsx"
Cohesion: 0.10
Nodes (35): dynamic, PreviewPage(), ConsentBanner(), contrastingForeground(), EmailBlock, foregroundForLuminance(), FunnelRuntime(), linearize() (+27 more)

### Community 47 - "src/proxy.ts"
Cohesion: 0.23
Nodes (17): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+9 more)

### Community 48 - "RuntimeInner"
Cohesion: 0.18
Nodes (20): loadUsableRun(), MAX_RUN_HISTORY, adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN (+12 more)

### Community 49 - "inputs.tsx"
Cohesion: 0.16
Nodes (23): Checkbox(), DatePicker(), EmailOAuth(), emailOAuthProps, EMOJI_SCALE, fieldCss(), OAuthButton(), oauthButtonProps (+15 more)

### Community 50 - "next"
Cohesion: 0.13
Nodes (10): dynamic, CustomDomainFunnelPage(), dynamic, dynamic, PublishedFunnelPage(), providerRefSchema, parseReturnParams(), SearchParams (+2 more)

### Community 51 - "email.ts"
Cohesion: 0.13
Nodes (18): emailBlocks(), EMAIL_BLOCK_TYPES, EmailBlock, emailBlocksOf(), EmailInputProps, emailKey(), isValidEmail(), LEADS_ROUTE (+10 more)

### Community 52 - "flow.tsx"
Cohesion: 0.17
Nodes (15): autoNext, cookieProps, customerProps, flowComponents, Loader(), loaderProps, Processing(), processingProps (+7 more)

### Community 53 - "public.domains"
Cohesion: 0.21
Nodes (11): domains_funnel_id_idx, domains_guard, domains_project_id_idx, domains_verified_hostname_idx, public.domains, public.domains_guard(), public.get_published_funnel_by_host(), public.is_host_servable() (+3 more)

### Community 54 - "switch-platform-domain.mjs"
Cohesion: 0.15
Nodes (13): APPLY, call(), coolifyHeaders, coolifyToken, local, plan(), ROOT, supabaseHeaders (+5 more)

### Community 55 - "content.tsx"
Cohesion: 0.11
Nodes (31): Badge(), badgeProps, Chart(), chartProps, contentComponents, Divider(), dividerProps, editorOnly() (+23 more)

### Community 56 - "AI assistant (design)"
Cohesion: 0.33
Nodes (5): AI assistant (design), Flow, Rollout, Security, What it does

### Community 57 - "Architecture"
Cohesion: 0.20
Nodes (10): Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Known risks and open questions, Repository layout, Stack (+2 more)

### Community 58 - "file-payment-store.ts"
Cohesion: 0.06
Nodes (36): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+28 more)

### Community 59 - "webhook.ts"
Cohesion: 0.09
Nodes (33): dynamic, POST(), isSolidgateConfigured(), isAdjustment(), PaymentAdjustment, toPublicPaymentStatus(), emitAdjustment(), eventUuid() (+25 more)

### Community 60 - "DomainsPanel.tsx"
Cohesion: 0.18
Nodes (16): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+8 more)

### Community 68 - "normalizeHostname"
Cohesion: 0.13
Nodes (29): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, Context, dynamic (+21 more)

### Community 69 - "next.config.mjs"
Cohesion: 0.40
Nodes (4): devOrigins, nextConfig, privateHeaders, securityHeaders

### Community 70 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, typecheck

### Community 71 - "react"
Cohesion: 0.18
Nodes (14): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, CheckoutBlockView(), defaultApi (+6 more)

### Community 72 - "public.payment_orphans"
Cohesion: 0.24
Nodes (6): public.payment_orphans, public.record_payment_adjustment(), public.record_payment_adjustment(), payment_orphans_payment_idx, payment_orphans_run_idx, public.apply_deferred_adjustments()

### Community 73 - "payment-status.ts"
Cohesion: 0.40
Nodes (5): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult

### Community 74 - "ThemeEditor.tsx"
Cohesion: 0.28
Nodes (8): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE

### Community 75 - "LayersPanel.tsx"
Cohesion: 0.33
Nodes (8): describe(), flatten(), isItem(), Item, Layer, LayersPanel(), usePuck, CATALOG_BY_TYPE

### Community 76 - "Implementation Plan"
Cohesion: 0.20
Nodes (10): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 1: Minimal vertical slice (in progress), Stage 2: Components and logic, Stage 3: Database and publishing, Stage 5: Analytics and publishing operations, Stage 6: Custom domains (+2 more)

### Community 77 - "supabase/proxy.ts"
Cohesion: 0.47
Nodes (4): @supabase/ssr@0.12.7, SESSION_COOKIE_OPTIONS, SessionResult, @supabase/ssr

### Community 78 - "templates.ts"
Cohesion: 0.36
Nodes (13): attached(), checkoutBlock(), createQuizContent(), createScreenContent(), heading(), nextButton(), optionList(), paragraph() (+5 more)

### Community 81 - "file-funnel-repository.ts"
Cohesion: 0.06
Nodes (36): DomainStatus, domainStatusSchema, domainFileSchema, groupFileSchema, isNotFound(), versionSummarySchema, DefinitionInvalidError, DomainCheck (+28 more)

### Community 82 - "ConditionPicker.tsx"
Cohesion: 0.16
Nodes (19): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+11 more)

### Community 84 - "ElementInspector.tsx"
Cohesion: 0.13
Nodes (14): ANIMATION_OPTIONS, EFFECT_TYPES, InspectedElement, Tab, VISIBILITY_OPTIONS, Group, KIND, BUILTIN_SCREEN (+6 more)

### Community 85 - "frame.tsx"
Cohesion: 0.44
Nodes (9): Frame(), framed(), FramedBlock(), useFunnelTheme(), containerStyle(), isItemShown(), readElementMeta(), readElementStyle() (+1 more)

### Community 86 - "getStudioContext"
Cohesion: 0.27
Nodes (10): dynamic, EditFunnelPage(), dynamic, first(), StudioFunnelsPage(), dynamic, StudioPage(), uiFont (+2 more)

### Community 88 - "Steps"
Cohesion: 0.22
Nodes (9): Step: Assistant route, Step: Generative UI cards, Step: Guards, Step: Model adapter, Step: Proposals, Step: Threads, Step: Tools, Step: Working copy (+1 more)

### Community 89 - "docs.ts"
Cohesion: 0.21
Nodes (8): DocEntry, DocGroup, listDocs(), listFeatures(), loadDoc(), readOptional(), REFERENCE, RenderedDoc

### Community 90 - "seed.ts"
Cohesion: 0.36
Nodes (10): Step: Catalog, button(), createSeedFunnel(), createStarterFunnel(), heading(), options(), paragraph(), puck() (+2 more)

### Community 91 - "repository.ts"
Cohesion: 0.07
Nodes (40): dynamic, NO_STORE, POST(), Summary, dynamic, NO_STORE, POST(), Context (+32 more)

### Community 92 - "public.leads"
Cohesion: 0.53
Nodes (5): leads_funnel_created_idx, leads_project_id_idx, leads_version_id_idx, public.leads, public.record_lead()

### Community 96 - "Steps"
Cohesion: 0.18
Nodes (10): Flow, Step: Create a funnel, Step: Load funnels, Step: Manage projects, Step: Move a funnel, Step: Render the funnel list, Step: Render the overview, Steps (+2 more)

### Community 100 - "index.ts"
Cohesion: 0.24
Nodes (9): OptionRef, blockId(), PuckItem, optionListProps, defaultPickerPlan(), hiddenBlockIds(), screenGate(), valueOf() (+1 more)

### Community 111 - "Refunds and disputes"
Cohesion: 0.50
Nodes (4): Flow, Refunds and disputes, Related, What it does

### Community 112 - "Auth and access"
Cohesion: 0.50
Nodes (4): Auth and access, Flow, Related, What it does

### Community 113 - "public.funnel_groups"
Cohesion: 0.67
Nodes (3): funnel_groups_project_id_idx, funnels_group_id_idx, public.funnel_groups

## Knowledge Gaps
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `web/package.json`, `ref_zod`, `config.tsx`, `server-only`, `FunnelEditor`, `withStudio`, `ScreenCanvas.tsx`, `StudioDashboard.tsx`, `plans.ts`, `actions.ts`, `verify.ts`, `funnelRoutes`, `next`, `FunnelRuntime.tsx`, `src/proxy.ts`, `flow.tsx`, `webhook.ts`, `normalizeHostname`, `supabase/proxy.ts`, `app/layout.tsx`, `getStudioContext`, `repository.ts`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07357357357357357 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `web/package.json`, `use-funnel-analytics.ts`, `elements/layout.tsx`, `config.tsx`, `FunnelEditor`, `index.ts`, `ScreenCanvas.tsx`, `StudioDashboard.tsx`, `catalog.tsx`, `actions.ts`, `button.tsx`, `ScreenStyles.tsx`, `paywall.tsx`, `funnelRoutes`, `use-draft-saver.ts`, `styles.ts`, `StyleFields.tsx`, `next`, `FunnelRuntime.tsx`, `inputs.tsx`, `flow.tsx`, `content.tsx`, `DomainsPanel.tsx`, `ThemeEditor.tsx`, `LayersPanel.tsx`, `app/layout.tsx`, `ElementInspector.tsx`, `frame.tsx`, `repository.ts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `use-funnel-analytics.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.060451977401129946 - nodes in this community are weakly interconnected._
- **Why does `FunnelRepository` connect `Funnel Repository Interface` to `studio-overview.ts`, `File Funnel Repository`, `Implementation Plan`, `file-funnel-repository.ts`, `Supabase Funnel Repository`, `Steps`, `repository.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._