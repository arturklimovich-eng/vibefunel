# Graph Report - funnel-platform  (2026-11-03)

## Corpus Check
- 219 files · ~128,401 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .css 11, (none) 6, .example 1)

## Summary
- 2038 nodes · 5410 edges · 111 communities (100 shown, 11 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 377 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7b9348bc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- withStudio
- web/package.json
- Status log
- Root Tooling and Lint
- checkout/route.ts
- content.tsx
- File Funnel Repository
- config.tsx
- file-lead-store.ts
- stripe-provider.ts
- FunnelEditor.tsx
- actions.ts
- Core DB Schema Migrations
- parseJsonBody
- ScreenCanvas.tsx
- Funnel Schema and Theme
- solidgate-provider.ts
- validate.ts
- Supabase Funnel Repository
- rate-limit.ts
- StudioDashboard.tsx
- Payments DB Migrations
- mock/webhook/route.ts
- Web TS Config
- catalog.tsx
- src/proxy.ts
- verify.ts
- ref_zod
- migrate
- ScreenEditor.tsx
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
- PaymentEvent
- next
- FunnelRuntime.tsx
- use-funnel-analytics.ts
- RuntimeInner
- inputs.tsx
- Architecture
- api/leads/route.ts
- flow.tsx
- public.domains
- docs.ts
- Lead capture
- webhook.ts
- FilePaymentStore
- types.ts
- PaymentStore
- DomainsPanel.tsx
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- normalizeHostname
- Data flow
- react
- public.payment_orphans
- Status log
- ThemeEditor.tsx
- Studio overview
- Implementation Plan
- repository.ts
- templates.ts
- getPublishedReader
- Public runtime
- file-funnel-repository.ts
- ConditionPicker.tsx
- index.ts
- Security
- frame.tsx
- Deployment
- createSupabaseServiceClient
- Steps
- isPaymentType
- seed.ts
- leads/registry.ts
- public.leads
- [id]/domains/route.ts
- Feature map
- Custom domains
- Analytics and consent
- Checkout
- publish/route.ts
- resolveStorageMode
- Steps
- login/page.tsx
- randomId
- LayersPanel.tsx
- draft/route.ts
- RateLimiter
- configForScreenType
- Studio authoring
- Refunds and disputes
- Auth and access
- Steps

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
- `Stage 5: Analytics and publishing operations` --references--> `ConsentBanner()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → apps/web/src/components/ConsentBanner.tsx
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Step: Frame` --references--> `FunnelRuntime()`  [INFERRED]
  docs/features/12-elements.md → apps/web/src/components/FunnelRuntime.tsx
- `Step: Continue gates` --references--> `screenGate()`  [INFERRED]
  docs/features/12-elements.md → apps/web/src/lib/puck/gates.ts
- `Step: Autosave draft` --references--> `useDraftSaver()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/lib/use-draft-saver.ts

## Import Cycles
- None detected.

## Communities (111 total, 11 thin omitted)

### Community 0 - "withStudio"
Cohesion: 0.15
Nodes (16): Context, DELETE(), dynamic, Context, DELETE(), dynamic, Context, dynamic (+8 more)

### Community 1 - "web/package.json"
Cohesion: 0.05
Nodes (53): dependencies, @funnel/schema@workspace:*, lottie-web@5.12.2, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2 (+45 more)

### Community 2 - "Status log"
Cohesion: 0.17
Nodes (12): AnalyticsEmitter, AnalyticsEventName, AnalyticsProperties, AnalyticsPropertyValue, AnalyticsSource, EmitOptions, PropertyOptions, getClient() (+4 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "checkout/route.ts"
Cohesion: 0.31
Nodes (14): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+6 more)

### Community 5 - "content.tsx"
Cohesion: 0.08
Nodes (47): Badge(), badgeProps, Chart(), chartProps, contentComponents, Divider(), dividerProps, Faq() (+39 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.18
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "config.tsx"
Cohesion: 0.14
Nodes (22): checkoutBlockProps, Heading(), headingProps, ImageBlock(), imageProps, isHttpsUrl(), OptionListBlock(), optionListProps (+14 more)

### Community 8 - "file-lead-store.ts"
Cohesion: 0.23
Nodes (5): FileLeadStore, fileSchema, isNotFound(), LeadFile, recordSchema

### Community 9 - "stripe-provider.ts"
Cohesion: 0.14
Nodes (10): PAYER_HASH_PATTERN, adjustmentMetadataSchema, metadataSchema, STRIPE_API_VERSION, StripeProvider, StripeProviderDeps, PlanPriceMismatchError, ProviderNotConfiguredError (+2 more)

### Community 10 - "FunnelEditor.tsx"
Cohesion: 0.08
Nodes (64): AddElementPanel(), AnimationSettings(), ChatIcon(), ChevronLeft(), ChevronRight(), CopyIcon(), DotsIcon(), DuplicateIcon() (+56 more)

### Community 11 - "actions.ts"
Cohesion: 0.20
Nodes (18): accountClientKey(), authenticate(), credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK, releaseSignInFailure() (+10 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.15
Nodes (23): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+15 more)

### Community 13 - "parseJsonBody"
Cohesion: 0.22
Nodes (11): Context, dynamic, POST(), rollbackSchema, invalid(), ParsedBody, parseJsonBody(), sizeLabel() (+3 more)

### Community 14 - "ScreenCanvas.tsx"
Cohesion: 0.13
Nodes (25): AssistantPanelProps, buttonEdges(), layoutColumns(), NODE_H, NODE_TYPES, ScreenFlowNode, ScreenNode, ScreenNodeData (+17 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (36): ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, edgeSchema, FontFamily, hasOversizedString() (+28 more)

### Community 16 - "solidgate-provider.ts"
Cohesion: 0.12
Nodes (19): apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot, safeEqual() (+11 more)

### Community 17 - "validate.ts"
Cohesion: 0.19
Nodes (15): getOptionLists(), isFallbackEdge(), isQuiz(), IssueCode, IssueSeverity, OptionListInfo, OptionListScan, optionListSchema (+7 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.18
Nodes (6): DomainNotFoundError, FunnelNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel()

### Community 19 - "rate-limit.ts"
Cohesion: 0.15
Nodes (16): AuthKeys, register(), requireAppUrlInProduction(), Bucket, clientIpHeader(), clientKeyFromHeaders(), defaultLimiter, DIRECT_KEY (+8 more)

### Community 20 - "StudioDashboard.tsx"
Cohesion: 0.12
Nodes (30): BookIcon(), FlowIcon(), HomeIcon(), LogoMark(), LogoutIcon(), PenIcon(), SparkIcon(), compress() (+22 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.12
Nodes (18): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+10 more)

### Community 22 - "mock/webhook/route.ts"
Cohesion: 0.11
Nodes (28): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, formSchema (+20 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "catalog.tsx"
Cohesion: 0.10
Nodes (20): isAttached(), NO_PREVIEW, presetProps(), Preview(), ASK, Base, CATALOG, CATEGORIES (+12 more)

### Community 25 - "src/proxy.ts"
Cohesion: 0.20
Nodes (18): SessionResult, updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy() (+10 more)

### Community 26 - "verify.ts"
Cohesion: 0.20
Nodes (16): RoutingStatus, txtRecordName(), txtRecordValue(), checkDomainDns(), checkDomainOwnership(), checkOwnership(), checkRouting(), configuredDnsServers() (+8 more)

### Community 27 - "ref_zod"
Cohesion: 0.15
Nodes (15): ACTION_LABELS, BUTTON_ACTIONS, buttonComponents, buttonProps, ButtonView(), css(), TargetField(), usePuck (+7 more)

### Community 28 - "migrate"
Cohesion: 0.16
Nodes (18): parseDefinition(), DefinitionCheck, isOlderDefinition(), parseInput(), Step: Validate definition, Step: Render screen, clampScreenAnimation(), isRecord() (+10 more)

### Community 29 - "ScreenEditor.tsx"
Cohesion: 0.15
Nodes (17): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditor(), ScreenEditorProps, ScreenEditorSlots, usePuck (+9 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "studio-overview.ts"
Cohesion: 0.14
Nodes (22): revocationOf(), bucketIndex(), buildWindow(), DAY_FORMAT, FunnelRow, isPaid(), loadStudioOverview(), Metric (+14 more)

### Community 33 - "paywall.tsx"
Cohesion: 0.15
Nodes (19): defaultPickerPlan(), PLAN_PICKER_TYPES, PlanItem, planPickerProps, SELECTED_PLAN_KEY, totalsProps, trialPickerProps, walletProps (+11 more)

### Community 35 - "funnelRoutes"
Cohesion: 0.09
Nodes (29): DeleteFunnelButton(), formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm() (+21 more)

### Community 36 - "Repository Audit (Stage 0)"
Cohesion: 0.15
Nodes (13): coolify, License table, Method, motion, Not integrated / rejected, posthog, react-sdk (Solidgate), react-stripe-js (+5 more)

### Community 37 - "use-draft-saver.ts"
Cohesion: 0.09
Nodes (30): AssistantPanel(), Card, demoReply(), Message, PALETTES, PlanStep, SUGGESTIONS, TypeMeta (+22 more)

### Community 38 - "styles.ts"
Cohesion: 0.06
Nodes (44): ANIMATION_OPTIONS, EFFECT_TYPES, InspectedElement, Tab, VISIBILITY_OPTIONS, Group, KIND, animationSchema (+36 more)

### Community 39 - "file-funnel-repository.ts"
Cohesion: 0.09
Nodes (18): DefinitionInvalidError, ForbiddenError, PublishedFunnel, PublishedReader, parseStoredDefinition(), domainRowSchema, draftRowSchema, funnelRowSchema (+10 more)

### Community 41 - "StyleFields.tsx"
Cohesion: 0.10
Nodes (42): ChevronDown(), ColorRow(), joinColor(), Label(), NumberInput(), NumberInputProps, NumberRow(), Row() (+34 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "PaymentEvent"
Cohesion: 0.23
Nodes (10): isMockEnabled(), MockProvider, getPaymentProvider(), CheckoutInput, CheckoutResult, MockForbiddenError, PaymentEvent, ProviderStatus (+2 more)

### Community 45 - "next"
Cohesion: 0.16
Nodes (16): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, dynamic, EditFunnelPage(), dynamic (+8 more)

### Community 46 - "FunnelRuntime.tsx"
Cohesion: 0.13
Nodes (21): contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS, RuntimeProps (+13 more)

### Community 47 - "use-funnel-analytics.ts"
Cohesion: 0.27
Nodes (13): ConsentBanner(), isBrowserAnalyticsConfigured(), ConsentDecision, ConsentState, readConsent(), warn(), writeConsent(), FunnelAnalytics (+5 more)

### Community 48 - "RuntimeInner"
Cohesion: 0.15
Nodes (25): loadUsableRun(), RuntimeInner(), fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult, advance() (+17 more)

### Community 49 - "inputs.tsx"
Cohesion: 0.12
Nodes (28): datePickerProps, sliderProps, editorOnly(), CookieConsent(), Checkbox(), DatePicker(), EmailOAuth(), emailOAuthProps (+20 more)

### Community 50 - "Architecture"
Cohesion: 0.25
Nodes (8): Animation, Architecture, Deployment (Stage 5), Goals and non-goals, Repository layout, Stack, Storage, auth and public read path (Stage 3), Versioning

### Community 51 - "api/leads/route.ts"
Cohesion: 0.14
Nodes (25): bodySchema, dynamic, POST(), rateLimited(), emailBlocks(), EMAIL_BLOCK_TYPES, EmailBlock, emailBlocksOf() (+17 more)

### Community 52 - "flow.tsx"
Cohesion: 0.17
Nodes (15): autoNext, cookieProps, customerProps, flowComponents, Loader(), loaderProps, Processing(), processingProps (+7 more)

### Community 53 - "public.domains"
Cohesion: 0.21
Nodes (11): domains_funnel_id_idx, domains_guard, domains_project_id_idx, domains_verified_hostname_idx, public.domains, public.domains_guard(), public.get_published_funnel_by_host(), public.is_host_servable() (+3 more)

### Community 54 - "docs.ts"
Cohesion: 0.13
Nodes (10): devOrigins, nextConfig, privateHeaders, securityHeaders, DocEntry, DocGroup, listFeatures(), readOptional() (+2 more)

### Community 55 - "Lead capture"
Cohesion: 0.50
Nodes (4): Flow, Lead capture, Related, What it does

### Community 56 - "webhook.ts"
Cohesion: 0.07
Nodes (41): dynamic, NO_STORE, POST(), Summary, dynamic, NO_STORE, POST(), Context (+33 more)

### Community 57 - "FilePaymentStore"
Cohesion: 0.25
Nodes (5): applyAdjustment(), applyDeferred(), FilePaymentStore, findAdjustmentTarget(), matchesTarget()

### Community 58 - "types.ts"
Cohesion: 0.08
Nodes (37): Deferred, deferredSchema, eventKey(), fileSchema, isNotFound(), PaymentFile, PaymentRecord, recordSchema (+29 more)

### Community 59 - "PaymentStore"
Cohesion: 0.08
Nodes (21): POST(), PaymentStore, isAdjustment(), emitAdjustment(), processAdjustment(), recordVerifiedEvent(), Step: Advance funnel, Step: Record payment (+13 more)

### Community 60 - "DomainsPanel.tsx"
Cohesion: 0.18
Nodes (16): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+8 more)

### Community 68 - "normalizeHostname"
Cohesion: 0.20
Nodes (19): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), normalizeHostname(), stripPort(), appHost() (+11 more)

### Community 69 - "Data flow"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+2 more)

### Community 71 - "react"
Cohesion: 0.13
Nodes (16): metadata, viewport, CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View (+8 more)

### Community 72 - "public.payment_orphans"
Cohesion: 0.24
Nodes (6): public.payment_orphans, public.record_payment_adjustment(), public.record_payment_adjustment(), payment_orphans_payment_idx, payment_orphans_run_idx, public.apply_deferred_adjustments()

### Community 73 - "Status log"
Cohesion: 0.20
Nodes (15): startBrowserAnalytics(), trackBrowserEvent(), warn(), AnalyticsEvent, AnalyticsScope, BrowserAnalyticsEvent, ServerOnlyAnalyticsEvent, toProperties() (+7 more)

### Community 74 - "ThemeEditor.tsx"
Cohesion: 0.28
Nodes (8): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE

### Community 75 - "Studio overview"
Cohesion: 0.29
Nodes (6): Flow, Step: Create a funnel, Step: Load funnels, Steps, Studio overview, What it does

### Community 76 - "Implementation Plan"
Cohesion: 0.22
Nodes (9): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 2: Components and logic, Stage 3: Database and publishing, Stage 5: Analytics and publishing operations, Stage 6: Custom domains, Stage overview (+1 more)

### Community 77 - "repository.ts"
Cohesion: 0.13
Nodes (13): domainStatusSchema, StorageMode, resultSchema, rowSchema, SupabaseDomainMaintenance, toDomain(), DomainMaintenance, RecheckOutcome (+5 more)

### Community 78 - "templates.ts"
Cohesion: 0.36
Nodes (13): attached(), checkoutBlock(), createQuizContent(), createScreenContent(), heading(), nextButton(), optionList(), paragraph() (+5 more)

### Community 79 - "getPublishedReader"
Cohesion: 0.22
Nodes (13): CustomDomainFunnelPage(), dynamic, dynamic, PublishedFunnelPage(), dynamic, PreviewPage(), FunnelRuntime(), ReturnParams (+5 more)

### Community 80 - "Public runtime"
Cohesion: 0.50
Nodes (4): Flow, Public runtime, Related, What it does

### Community 81 - "file-funnel-repository.ts"
Cohesion: 0.11
Nodes (19): DomainStatus, domainFileSchema, isNotFound(), versionSummarySchema, DomainCheck, DomainLimitError, DomainTakenError, FunnelDraft (+11 more)

### Community 82 - "ConditionPicker.tsx"
Cohesion: 0.25
Nodes (14): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+6 more)

### Community 83 - "index.ts"
Cohesion: 0.17
Nodes (11): OptionRef, blockId(), PuckItem, checkboxProps, ratingProps, textInputProps, screenGate(), valueOf() (+3 more)

### Community 84 - "Security"
Cohesion: 0.20
Nodes (10): Custom domains, Leads (personal data), Operational, Response headers, Runtime safety, Secrets policy, Security, Stage 3 implementation: auth, RLS, public read (+2 more)

### Community 85 - "frame.tsx"
Cohesion: 0.33
Nodes (10): Frame(), framed(), FramedBlock(), SLOT_CLASS, useFunnelTheme(), containerStyle(), isElementVisible(), readElementMeta() (+2 more)

### Community 86 - "Deployment"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 87 - "createSupabaseServiceClient"
Cohesion: 0.21
Nodes (8): createSupabaseServiceClient(), MissingServiceKeyError, FunnelLead, LeadInput, LeadStore, leadRowSchema, SupabaseLeadStore, Step: Store lead

### Community 88 - "Steps"
Cohesion: 0.13
Nodes (14): AI assistant (design), Flow, Rollout, Security, Step: Assistant route, Step: Generative UI cards, Step: Guards, Step: Model adapter (+6 more)

### Community 89 - "isPaymentType"
Cohesion: 0.23
Nodes (13): useEditorData(), ActionField(), DestinationField(), Data model, Step: Screen routing, Stage 1: Minimal vertical slice (in progress), matches(), nextScreen() (+5 more)

### Community 90 - "seed.ts"
Cohesion: 0.26
Nodes (11): RetypeResult, Step: Catalog, Edge, button(), createSeedFunnel(), heading(), options(), paragraph() (+3 more)

### Community 91 - "leads/registry.ts"
Cohesion: 0.26
Nodes (9): Context, dynamic, GET(), csvCell(), HEADER, leadsToCsv(), getLeadStore(), globalForLeads (+1 more)

### Community 92 - "public.leads"
Cohesion: 0.53
Nodes (5): leads_funnel_created_idx, leads_project_id_idx, leads_version_id_idx, public.leads, public.record_lead()

### Community 93 - "[id]/domains/route.ts"
Cohesion: 0.23
Nodes (12): Context, dynamic, isDomainTaken(), POST(), bodySchema, Context, dynamic, GET() (+4 more)

### Community 94 - "Feature map"
Cohesion: 0.40
Nodes (5): Background jobs, Feature map, How a funnel lives, Keeping these pages current, Map

### Community 95 - "Custom domains"
Cohesion: 0.40
Nodes (5): Custom domains, Domain status, Flow, Related, What it does

### Community 96 - "Analytics and consent"
Cohesion: 0.40
Nodes (5): Analytics and consent, Flow, Related, What is and is not sent, What it does

### Community 97 - "Checkout"
Cohesion: 0.50
Nodes (4): Checkout, Flow, Related, What it does

### Community 98 - "publish/route.ts"
Cohesion: 0.20
Nodes (10): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), PLAN_BOUND_BLOCKS, Step: Autosave draft, Step: Funnel versions (+2 more)

### Community 99 - "resolveStorageMode"
Cohesion: 0.31
Nodes (8): readSupabaseEnv(), requireSupabaseEnv(), resolveStorageMode(), SupabaseEnv, SESSION_COOKIE_OPTIONS, createSupabaseAnonClient(), ServiceClient, @supabase/ssr

### Community 100 - "Steps"
Cohesion: 0.18
Nodes (11): Flow, Screen elements, Step: Add Element panel, Step: Authentication, Step: Button actions, Step: Continue gates, Step: Frame, Step: Loaders (+3 more)

### Community 101 - "login/page.tsx"
Cohesion: 0.33
Nodes (6): AuthFormState, initialState, LoginForm(), dynamic, firstValue(), LoginPage()

### Community 102 - "randomId"
Cohesion: 0.28
Nodes (7): useApplyPresets(), usePuck, randomId(), newOptionId(), insertTracker, newElementId(), PendingPreset

### Community 103 - "LayersPanel.tsx"
Cohesion: 0.33
Nodes (8): describe(), flatten(), isItem(), Item, Layer, LayersPanel(), usePuck, CATALOG_BY_TYPE

### Community 104 - "draft/route.ts"
Cohesion: 0.32
Nodes (7): Context, dynamic, GET(), PUT(), saveSchema, checkDefinition(), Step: Save draft route

### Community 106 - "configForScreenType"
Cohesion: 0.67
Nodes (4): allowedTypesFor(), allowedComponentsForScreenType(), configForScreenType(), Step: Context builder

### Community 107 - "Studio authoring"
Cohesion: 0.50
Nodes (4): Flow, Related, Studio authoring, What it does

### Community 108 - "Refunds and disputes"
Cohesion: 0.50
Nodes (4): Flow, Refunds and disputes, Related, What it does

### Community 109 - "Auth and access"
Cohesion: 0.50
Nodes (4): Auth and access, Flow, Related, What it does

### Community 110 - "Steps"
Cohesion: 0.67
Nodes (3): Step: Record the check, Step: Warn, revoke, restore, Steps

## Knowledge Gaps
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `webhook.ts` to `withStudio`, `web/package.json`, `checkout/route.ts`, `config.tsx`, `FunnelEditor.tsx`, `actions.ts`, `parseJsonBody`, `ScreenCanvas.tsx`, `StudioDashboard.tsx`, `mock/webhook/route.ts`, `src/proxy.ts`, `funnelRoutes`, `next`, `api/leads/route.ts`, `flow.tsx`, `normalizeHostname`, `react`, `getPublishedReader`, `leads/registry.ts`, `[id]/domains/route.ts`, `publish/route.ts`, `resolveStorageMode`, `login/page.tsx`, `draft/route.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `withStudio` be split into smaller, more focused modules?**
  _Cohesion score 0.14761904761904762 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `web/package.json`, `content.tsx`, `config.tsx`, `FunnelEditor.tsx`, `ScreenCanvas.tsx`, `StudioDashboard.tsx`, `catalog.tsx`, `ref_zod`, `ScreenEditor.tsx`, `paywall.tsx`, `funnelRoutes`, `use-draft-saver.ts`, `styles.ts`, `StyleFields.tsx`, `next`, `FunnelRuntime.tsx`, `use-funnel-analytics.ts`, `inputs.tsx`, `flow.tsx`, `DomainsPanel.tsx`, `ThemeEditor.tsx`, `repository.ts`, `frame.tsx`, `login/page.tsx`, `LayersPanel.tsx`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.050314465408805034 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `webhook.ts` to `withStudio`, `web/package.json`, `Status log`, `checkout/route.ts`, `file-lead-store.ts`, `stripe-provider.ts`, `solidgate-provider.ts`, `rate-limit.ts`, `mock/webhook/route.ts`, `verify.ts`, `studio-overview.ts`, `file-funnel-repository.ts`, `PaymentEvent`, `next`, `api/leads/route.ts`, `docs.ts`, `types.ts`, `normalizeHostname`, `repository.ts`, `file-funnel-repository.ts`, `createSupabaseServiceClient`, `leads/registry.ts`, `[id]/domains/route.ts`, `resolveStorageMode`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._