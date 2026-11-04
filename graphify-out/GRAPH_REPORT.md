# Graph Report - funnel-platform  (2026-11-04)

## Corpus Check
- 229 files · ~135,529 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .css 11, (none) 6, .example 1)

## Summary
- 2153 nodes · 5774 edges · 104 communities (94 shown, 10 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 384 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0cec634a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- StudioFunnels.tsx
- web/package.json
- use-funnel-analytics.ts
- Root Tooling and Lint
- checkout/route.ts
- content.tsx
- File Funnel Repository
- config.tsx
- switch-platform-domain.mjs
- api/leads/route.ts
- FunnelEditor
- index.ts
- Core DB Schema Migrations
- withStudio
- ScreenCanvas.tsx
- Funnel Schema and Theme
- solidgate-provider.ts
- validate.ts
- Supabase Funnel Repository
- verify.ts
- StudioDashboard.tsx
- Payments DB Migrations
- confirm/route.ts
- Web TS Config
- AddElementPanel.tsx
- use-draft-saver.ts
- DomainsPanel.tsx
- normalizeHostname
- migrate.ts
- ScreenStyles.tsx
- Docker Compose
- Schema Package Manifest
- studio-overview.ts
- paywall.tsx
- Funnel Repository Interface
- funnelRoutes
- 30-checkout.md
- Steps
- styles.ts
- supabase-funnel-repository.ts
- StyleFields.tsx
- Schema TS Config
- README
- createSupabaseServiceClient
- [id]/domains/route.ts
- leads/registry.ts
- src/proxy.ts
- RuntimeInner
- content.tsx
- seed.ts
- catalog.tsx
- email.ts
- public.domains
- AssistantPanel.tsx
- flow.tsx
- stripe-provider.ts
- FunnelRuntime
- file-payment-store.ts
- webhook.ts
- docs.ts
- Next.js Agent Notes
- draft/route.ts
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- isPaymentType
- clientKeyFromHeaders
- Data flow
- react
- public.payment_orphans
- FunnelRuntime.tsx
- Architecture
- Deployment
- Implementation Plan
- LayersPanel.tsx
- templates.ts
- app/layout.tsx
- Repository Audit (Stage 0)
- file-funnel-repository.ts
- ConditionPicker.tsx
- ThemeEditor.tsx
- ScreenType
- frame.tsx
- repository.ts
- Steps
- Steps
- Steps
- Studio authoring
- public.leads
- actions.ts
- screen-refs.ts
- leads.ts
- Feature map
- Custom domains
- Analytics and consent
- Lead capture
- Checkout
- Steps
- Auth and access
- public.funnel_groups

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 82 edges
2. `next` - 54 edges
3. `react` - 54 edges
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
- `Step: Render the funnel list` --references--> `StudioFunnels()`  [INFERRED]
  docs/features/15-studio-overview.md → apps/web/src/components/StudioFunnels.tsx
- `Step: Continue gates` --references--> `screenGate()`  [INFERRED]
  docs/features/12-elements.md → apps/web/src/lib/puck/gates.ts

## Import Cycles
- None detected.

## Communities (104 total, 10 thin omitted)

### Community 0 - "StudioFunnels.tsx"
Cohesion: 0.17
Nodes (23): DeleteFunnelButton(), FlowIcon(), FolderIcon(), PenIcon(), PlusIcon(), NavLink(), PendingMark(), syncAttribute() (+15 more)

### Community 1 - "web/package.json"
Cohesion: 0.05
Nodes (53): dependencies, @funnel/schema@workspace:*, lottie-web@5.12.2, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2 (+45 more)

### Community 2 - "use-funnel-analytics.ts"
Cohesion: 0.07
Nodes (49): ConsentBanner(), isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent() (+41 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "checkout/route.ts"
Cohesion: 0.31
Nodes (14): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+6 more)

### Community 5 - "content.tsx"
Cohesion: 0.10
Nodes (23): SLOT_CHILDREN, carouselProps, columnsProps, layoutComponents, popupProps, rowsProps, slot, Components (+15 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.16
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "config.tsx"
Cohesion: 0.09
Nodes (39): checkoutBlockProps, CheckoutBlockView(), Heading(), headingProps, ImageBlock(), imageProps, isHttpsUrl(), OptionListBlock() (+31 more)

### Community 8 - "switch-platform-domain.mjs"
Cohesion: 0.14
Nodes (14): APPLY, call(), COOLIFY_URL, coolifyHeaders, coolifyToken, local, plan(), ROOT (+6 more)

### Community 9 - "api/leads/route.ts"
Cohesion: 0.14
Nodes (25): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, dynamic, POST() (+17 more)

### Community 10 - "FunnelEditor"
Cohesion: 0.07
Nodes (67): AnimationSettings(), ArrowUpIcon(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight(), CopyIcon(), DotsIcon() (+59 more)

### Community 11 - "index.ts"
Cohesion: 0.15
Nodes (17): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditor, ScreenEditorProps, ScreenEditorSlots, usePuck (+9 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.15
Nodes (23): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+15 more)

### Community 13 - "withStudio"
Cohesion: 0.07
Nodes (36): Context, DELETE(), dynamic, PATCH(), renameSchema, createSchema, dynamic, GET() (+28 more)

### Community 14 - "ScreenCanvas.tsx"
Cohesion: 0.11
Nodes (29): AssistantPanelProps, CanvasMode, EditOverlay(), Focus(), layoutColumns(), NODE_TYPES, PHONE_H, PHONE_W (+21 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (35): ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, edgeSchema, hasOversizedString(), idSchema (+27 more)

### Community 16 - "solidgate-provider.ts"
Cohesion: 0.13
Nodes (18): apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot, safeEqual() (+10 more)

### Community 17 - "validate.ts"
Cohesion: 0.15
Nodes (19): buttonEdges(), getOptionLists(), isFallbackEdge(), isQuiz(), IssueCode, IssueSeverity, OptionListInfo, OptionListScan (+11 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.14
Nodes (9): DomainNotFoundError, FunnelGroup, FunnelNotFoundError, GroupNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel() (+1 more)

### Community 19 - "verify.ts"
Cohesion: 0.13
Nodes (21): dynamic, NO_STORE, POST(), Summary, RoutingStatus, cronAuthorized(), toDomain(), checkDomainDns() (+13 more)

### Community 20 - "StudioDashboard.tsx"
Cohesion: 0.12
Nodes (27): BookIcon(), CloseIcon(), HomeIcon(), LogoMark(), LogoutIcon(), SearchIcon(), SparkIcon(), NavOverlay() (+19 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.12
Nodes (18): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+10 more)

### Community 22 - "confirm/route.ts"
Cohesion: 0.10
Nodes (33): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), dynamic, escapeHtml(), GET() (+25 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "AddElementPanel.tsx"
Cohesion: 0.22
Nodes (14): AddElementPanel(), isAttached(), NO_PREVIEW, presetProps(), Preview(), useApplyPresets(), usePuck, CATEGORIES (+6 more)

### Community 25 - "use-draft-saver.ts"
Cohesion: 0.15
Nodes (17): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+9 more)

### Community 26 - "DomainsPanel.tsx"
Cohesion: 0.13
Nodes (21): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+13 more)

### Community 27 - "normalizeHostname"
Cohesion: 0.24
Nodes (15): normalizeHostname(), stripPort(), appHost(), customHost(), extraPlatformHosts(), isPlatformHost(), requestHost, customDomainOrigin() (+7 more)

### Community 28 - "migrate.ts"
Cohesion: 0.31
Nodes (9): clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition, retypeScreen(), textScreen(), toTextItem(), funnelDefinitionSchema (+1 more)

### Community 29 - "ScreenStyles.tsx"
Cohesion: 0.18
Nodes (26): ColorInput(), Props, channel(), ColorRow(), hexOf(), hslToRgb(), joinColor(), Label() (+18 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "studio-overview.ts"
Cohesion: 0.09
Nodes (30): revocationOf(), bucketIndex(), buildWindow(), DAY_FORMAT, FunnelRow, isPaid(), loadStudioOverview(), Metric (+22 more)

### Community 33 - "paywall.tsx"
Cohesion: 0.12
Nodes (25): blockId(), checkboxProps, datePickerProps, defaultPickerPlan(), PlanItem, planPickerProps, ratingProps, SELECTED_PLAN_KEY (+17 more)

### Community 35 - "funnelRoutes"
Cohesion: 0.09
Nodes (28): formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm(), slugify() (+20 more)

### Community 36 - "30-checkout.md"
Cohesion: 0.54
Nodes (3): Flow, Screen elements, What it does

### Community 37 - "Steps"
Cohesion: 0.29
Nodes (6): VersionUnreadableError, Step: Autosave draft, Step: Funnel versions, Step: Publish version, Step: Rollback, Steps

### Community 38 - "styles.ts"
Cohesion: 0.06
Nodes (44): ANIMATION_OPTIONS, EFFECT_TYPES, InspectedElement, Tab, VISIBILITY_OPTIONS, Group, KIND, animationSchema (+36 more)

### Community 39 - "supabase-funnel-repository.ts"
Cohesion: 0.08
Nodes (23): DefinitionInvalidError, ForbiddenError, PublishedFunnel, PublishedReader, parseStoredDefinition(), domainRowSchema, draftRowSchema, funnelRowSchema (+15 more)

### Community 41 - "StyleFields.tsx"
Cohesion: 0.09
Nodes (22): ALIGN_OPTIONS, DECORATION_OPTIONS, EFFECT_OPTIONS, FONT_OPTIONS, POSITION_LABELS, POSITION_OPTIONS, SHADOW_OPTIONS, StyleFieldsProps (+14 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "createSupabaseServiceClient"
Cohesion: 0.25
Nodes (5): createSupabaseServiceClient(), MissingServiceKeyError, DomainTakenError, ServiceClient, Step: Record the check

### Community 45 - "[id]/domains/route.ts"
Cohesion: 0.23
Nodes (13): Context, dynamic, isDomainTaken(), POST(), bodySchema, Context, dynamic, GET() (+5 more)

### Community 46 - "leads/registry.ts"
Cohesion: 0.11
Nodes (22): Context, dynamic, GET(), normalizeEmail(), csvCell(), HEADER, leadsToCsv(), FileLeadStore (+14 more)

### Community 47 - "src/proxy.ts"
Cohesion: 0.14
Nodes (27): @supabase/ssr@0.12.7, readSupabaseEnv(), requireSupabaseEnv(), resolveStorageMode(), SupabaseEnv, SESSION_COOKIE_OPTIONS, SessionResult, updateSession() (+19 more)

### Community 48 - "RuntimeInner"
Cohesion: 0.23
Nodes (19): loadUsableRun(), RuntimeInner(), advance(), retreat(), adoptRunId(), answersSchema, getOrCreateRunId(), loadRun() (+11 more)

### Community 49 - "content.tsx"
Cohesion: 0.10
Nodes (39): Badge(), badgeProps, Chart(), chartProps, contentComponents, Divider(), dividerProps, editorOnly() (+31 more)

### Community 50 - "seed.ts"
Cohesion: 0.24
Nodes (14): allowedTypesFor(), allowedComponentsForScreenType(), configForScreenType(), Step: Catalog, Step: Context builder, button(), createSeedFunnel(), createStarterFunnel() (+6 more)

### Community 51 - "catalog.tsx"
Cohesion: 0.14
Nodes (11): ASK, Base, CATALOG, ENTRY, LOAD, PAY, PRESETS_BY_ID, pulse (+3 more)

### Community 52 - "email.ts"
Cohesion: 0.29
Nodes (10): EMAIL_BLOCK_TYPES, EmailBlock, emailBlocksOf(), EmailInputProps, emailKey(), isValidEmail(), EmailInputBlock(), LeadTarget (+2 more)

### Community 53 - "public.domains"
Cohesion: 0.21
Nodes (11): domains_funnel_id_idx, domains_guard, domains_project_id_idx, domains_verified_hostname_idx, public.domains, public.domains_guard(), public.get_published_funnel_by_host(), public.is_host_servable() (+3 more)

### Community 54 - "AssistantPanel.tsx"
Cohesion: 0.21
Nodes (10): AssistantPanel(), Card, demoReply(), Message, PALETTES, PlanStep, SUGGESTIONS, TypeMeta (+2 more)

### Community 55 - "flow.tsx"
Cohesion: 0.15
Nodes (19): ButtonView(), autoNext, cookieProps, customerProps, flowComponents, formatCountdown(), Loader(), loaderProps (+11 more)

### Community 56 - "stripe-provider.ts"
Cohesion: 0.09
Nodes (26): isMockEnabled(), MockProvider, PAYER_HASH_PATTERN, adjustmentMetadataSchema, metadataSchema, STRIPE_API_VERSION, StripeProvider, StripeProviderDeps (+18 more)

### Community 57 - "FunnelRuntime"
Cohesion: 0.24
Nodes (9): dynamic, PreviewPage(), FunnelRuntime(), parseDefinition(), Flow, Public runtime, Related, Step: Render screen (+1 more)

### Community 58 - "file-payment-store.ts"
Cohesion: 0.06
Nodes (36): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+28 more)

### Community 59 - "webhook.ts"
Cohesion: 0.08
Nodes (42): dynamic, NO_STORE, POST(), Context, dynamic, GET(), dynamic, dynamic (+34 more)

### Community 60 - "docs.ts"
Cohesion: 0.13
Nodes (12): devOrigins, nextConfig, privateHeaders, securityHeaders, DocEntry, DocGroup, listDocs(), listFeatures() (+4 more)

### Community 64 - "draft/route.ts"
Cohesion: 0.22
Nodes (11): Context, dynamic, GET(), PUT(), saveSchema, checkDefinition(), DefinitionCheck, isOlderDefinition() (+3 more)

### Community 68 - "isPaymentType"
Cohesion: 0.26
Nodes (12): useEditorData(), ActionField(), DestinationField(), Step: Screen routing, matches(), nextScreen(), NextScreenOptions, own() (+4 more)

### Community 69 - "clientKeyFromHeaders"
Cohesion: 0.15
Nodes (16): AuthKeys, register(), requireAppUrlInProduction(), Bucket, clientIpHeader(), clientKeyFromHeaders(), defaultLimiter, DIRECT_KEY (+8 more)

### Community 70 - "Data flow"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+2 more)

### Community 71 - "react"
Cohesion: 0.13
Nodes (21): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, ACTION_LABELS, BUTTON_ACTIONS (+13 more)

### Community 72 - "public.payment_orphans"
Cohesion: 0.24
Nodes (6): public.payment_orphans, public.record_payment_adjustment(), public.record_payment_adjustment(), payment_orphans_payment_idx, payment_orphans_run_idx, public.apply_deferred_adjustments()

### Community 73 - "FunnelRuntime.tsx"
Cohesion: 0.13
Nodes (21): contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS, ReturnParams (+13 more)

### Community 74 - "Architecture"
Cohesion: 0.20
Nodes (10): Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Known risks and open questions, Repository layout, Stack (+2 more)

### Community 75 - "Deployment"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 76 - "Implementation Plan"
Cohesion: 0.20
Nodes (10): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 1: Minimal vertical slice (in progress), Stage 2: Components and logic, Stage 3: Database and publishing, Stage 5: Analytics and publishing operations, Stage 6: Custom domains (+2 more)

### Community 77 - "LayersPanel.tsx"
Cohesion: 0.33
Nodes (8): describe(), flatten(), isItem(), Item, Layer, LayersPanel(), usePuck, CATALOG_BY_TYPE

### Community 78 - "templates.ts"
Cohesion: 0.36
Nodes (13): attached(), checkoutBlock(), createQuizContent(), createScreenContent(), heading(), nextButton(), optionList(), paragraph() (+5 more)

### Community 80 - "Repository Audit (Stage 0)"
Cohesion: 0.14
Nodes (14): coolify, License table, Method, motion, Not integrated / rejected, posthog, puck, react-sdk (Solidgate) (+6 more)

### Community 81 - "file-funnel-repository.ts"
Cohesion: 0.10
Nodes (20): domainFileSchema, groupFileSchema, isNotFound(), versionSummarySchema, DomainCheck, DomainLimitError, DomainMaintenance, FunnelDraft (+12 more)

### Community 82 - "ConditionPicker.tsx"
Cohesion: 0.20
Nodes (16): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+8 more)

### Community 83 - "ThemeEditor.tsx"
Cohesion: 0.28
Nodes (8): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE

### Community 84 - "ScreenType"
Cohesion: 0.32
Nodes (6): CatalogEntry, EditorData, EditorDataContext, RetypeResult, Edge, ScreenType

### Community 85 - "frame.tsx"
Cohesion: 0.33
Nodes (11): Frame(), framed(), FramedBlock(), SLOT_CLASS, useFunnelTheme(), containerStyle(), isElementVisible(), isItemShown() (+3 more)

### Community 86 - "repository.ts"
Cohesion: 0.12
Nodes (26): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, dynamic, EditFunnelPage(), dynamic (+18 more)

### Community 87 - "Steps"
Cohesion: 0.25
Nodes (8): toPublicPaymentStatus(), 4. Checkout, webhook, status, Step: Advance funnel, Step: Poll status, Step: Solidgate, Step: Verify webhook, Steps, Step: Access policy

### Community 88 - "Steps"
Cohesion: 0.13
Nodes (14): AI assistant (design), Flow, Rollout, Security, Step: Assistant route, Step: Generative UI cards, Step: Guards, Step: Model adapter (+6 more)

### Community 89 - "Steps"
Cohesion: 0.25
Nodes (8): Step: Add Element panel, Step: Authentication, Step: Button actions, Step: Continue gates, Step: Frame, Step: Loaders, Step: Plan pickers, Steps

### Community 90 - "Studio authoring"
Cohesion: 0.50
Nodes (4): Flow, Related, Studio authoring, What it does

### Community 92 - "public.leads"
Cohesion: 0.53
Nodes (5): leads_funnel_created_idx, leads_project_id_idx, leads_version_id_idx, public.leads, public.record_lead()

### Community 94 - "actions.ts"
Cohesion: 0.11
Nodes (25): accountClientKey(), authenticate(), AuthFormState, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK (+17 more)

### Community 95 - "screen-refs.ts"
Cohesion: 0.53
Nodes (5): cleanItem(), cleanItems(), isItem(), Item, stripScreenRefs()

### Community 97 - "leads.ts"
Cohesion: 0.33
Nodes (6): emailBlocks(), LEADS_ROUTE, LeadSubmission, sendLead(), warn(), Step: Send on advance

### Community 98 - "Feature map"
Cohesion: 0.40
Nodes (5): Background jobs, Feature map, How a funnel lives, Keeping these pages current, Map

### Community 99 - "Custom domains"
Cohesion: 0.40
Nodes (5): Custom domains, Domain status, Flow, Related, What it does

### Community 100 - "Analytics and consent"
Cohesion: 0.40
Nodes (5): Analytics and consent, Flow, Related, What is and is not sent, What it does

### Community 101 - "Lead capture"
Cohesion: 0.29
Nodes (7): Flow, Lead capture, Related, Step: List leads, Step: Resolve target, Steps, What it does

### Community 102 - "Checkout"
Cohesion: 0.50
Nodes (4): Checkout, Flow, Related, What it does

### Community 111 - "Steps"
Cohesion: 0.15
Nodes (13): Flow, Refunds and disputes, Related, Step: Apply adjustment, Step: Apply deferred, Step: Daily report, Step: Defer adjustment, Step: Match payment (+5 more)

### Community 112 - "Auth and access"
Cohesion: 0.50
Nodes (4): Auth and access, Flow, Related, What it does

### Community 113 - "public.funnel_groups"
Cohesion: 0.67
Nodes (3): funnel_groups_project_id_idx, funnels_group_id_idx, public.funnel_groups

## Knowledge Gaps
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `funnelRoutes` to `StudioFunnels.tsx`, `web/package.json`, `use-funnel-analytics.ts`, `content.tsx`, `config.tsx`, `FunnelEditor`, `index.ts`, `ScreenCanvas.tsx`, `StudioDashboard.tsx`, `AddElementPanel.tsx`, `use-draft-saver.ts`, `DomainsPanel.tsx`, `ScreenStyles.tsx`, `paywall.tsx`, `styles.ts`, `StyleFields.tsx`, `content.tsx`, `catalog.tsx`, `email.ts`, `AssistantPanel.tsx`, `flow.tsx`, `react`, `FunnelRuntime.tsx`, `LayersPanel.tsx`, `app/layout.tsx`, `ThemeEditor.tsx`, `ScreenType`, `frame.tsx`, `repository.ts`, `actions.ts`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05101327742837177 - nodes in this community are weakly interconnected._
- **Why does `next` connect `webhook.ts` to `StudioFunnels.tsx`, `web/package.json`, `checkout/route.ts`, `config.tsx`, `api/leads/route.ts`, `FunnelEditor`, `withStudio`, `ScreenCanvas.tsx`, `verify.ts`, `confirm/route.ts`, `funnelRoutes`, `[id]/domains/route.ts`, `leads/registry.ts`, `src/proxy.ts`, `flow.tsx`, `FunnelRuntime`, `draft/route.ts`, `app/layout.tsx`, `repository.ts`, `actions.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `use-funnel-analytics.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06641604010025062 - nodes in this community are weakly interconnected._
- **Why does `FileFunnelRepository` connect `File Funnel Repository` to `Funnel Repository Interface`, `Steps`, `supabase-funnel-repository.ts`, `Implementation Plan`, `file-funnel-repository.ts`, `repository.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._