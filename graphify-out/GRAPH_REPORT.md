# Graph Report - funnel-platform  (2026-11-04)

## Corpus Check
- 228 files · ~135,084 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .css 11, (none) 6, .example 1)

## Summary
- 2149 nodes · 5766 edges · 107 communities (93 shown, 14 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 386 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f3602742`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- parseJsonBody
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
- Status log
- Supabase Funnel Repository
- cron/domains/route.ts
- StudioFunnels.tsx
- Payments DB Migrations
- publish/route.ts
- Web TS Config
- catalog.tsx
- actions.ts
- DomainsPanel.tsx
- plans.ts
- migrate.ts
- ScreenStyles.tsx
- Docker Compose
- Schema Package Manifest
- studio-overview.ts
- paywall.tsx
- Funnel Repository Interface
- funnelRoutes
- Steps
- styles.ts
- parseStoredDefinition
- StyleFields.tsx
- Schema TS Config
- README
- createSupabaseServiceClient
- next
- leads/registry.ts
- src/proxy.ts
- FunnelRuntime.tsx
- inputs.tsx
- types.ts
- Steps
- ThemeDefaults.tsx
- public.domains
- AssistantPanel.tsx
- content.tsx
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
- next
- clientKeyFromHeaders
- Data flow
- react
- public.payment_orphans
- payment-status.ts
- Security
- Deployment
- FileLeadStore
- resolveStorageMode
- templates.ts
- app/layout.tsx
- seed.ts
- file-funnel-repository.ts
- ConditionPicker.tsx
- ref_node_path
- ElementInspector.tsx
- frame.tsx
- getStudioContext
- funnel-groups/[id]/route.ts
- Steps
- login/page.tsx
- file-lead-store.ts
- repository.ts
- public.leads
- RateLimiter
- screen-refs.ts
- Steps
- leads.ts
- Feature map
- Custom domains
- Analytics and consent
- Lead capture
- Checkout
- layout.ts
- Refunds and disputes
- Auth and access
- public.funnel_groups

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 82 edges
2. `next` - 54 edges
3. `react` - 53 edges
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
- `puck` --references--> `ScreenEditor()`  [INFERRED]
  docs/REPOSITORY_AUDIT.md → apps/web/src/components/ScreenEditor.tsx
- `Step: Render the funnel list` --references--> `StudioFunnels()`  [INFERRED]
  docs/features/15-studio-overview.md → apps/web/src/components/StudioFunnels.tsx

## Import Cycles
- None detected.

## Communities (107 total, 14 thin omitted)

### Community 0 - "parseJsonBody"
Cohesion: 0.16
Nodes (15): Context, dynamic, POST(), rollbackSchema, createSchema, dynamic, GET(), POST() (+7 more)

### Community 1 - "web/package.json"
Cohesion: 0.05
Nodes (51): dependencies, @funnel/schema@workspace:*, lottie-web@5.12.2, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2 (+43 more)

### Community 2 - "use-funnel-analytics.ts"
Cohesion: 0.09
Nodes (39): ConsentBanner(), isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent() (+31 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "checkout/route.ts"
Cohesion: 0.21
Nodes (20): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), getPaymentProvider(), cookieNonces(), mergeRunCookie() (+12 more)

### Community 5 - "content.tsx"
Cohesion: 0.07
Nodes (36): badgeProps, chartProps, contentComponents, Divider(), dividerProps, faqProps, List(), listProps (+28 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.16
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "config.tsx"
Cohesion: 0.13
Nodes (25): allowedTypesFor(), allowedComponentsForScreenType(), checkoutBlockProps, configForScreenType(), Heading(), headingProps, ImageBlock(), imageProps (+17 more)

### Community 8 - "switch-platform-domain.mjs"
Cohesion: 0.14
Nodes (14): APPLY, call(), COOLIFY_URL, coolifyHeaders, coolifyToken, local, plan(), ROOT (+6 more)

### Community 9 - "api/leads/route.ts"
Cohesion: 0.15
Nodes (22): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, dynamic, POST() (+14 more)

### Community 10 - "FunnelEditor"
Cohesion: 0.08
Nodes (64): AnimationSettings(), AssistantPanel(), demoReply(), ArrowUpIcon(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight() (+56 more)

### Community 11 - "index.ts"
Cohesion: 0.10
Nodes (26): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditor(), ScreenEditorProps, ScreenEditorSlots, usePuck (+18 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.15
Nodes (23): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+15 more)

### Community 13 - "withStudio"
Cohesion: 0.13
Nodes (16): createSchema, dynamic, GET(), POST(), Context, DELETE(), dynamic, Context (+8 more)

### Community 14 - "ScreenCanvas.tsx"
Cohesion: 0.12
Nodes (31): AssistantPanelProps, CanvasMode, EditOverlay(), Focus(), layoutColumns(), NODE_TYPES, PHONE_H, PHONE_W (+23 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.05
Nodes (45): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), ANIMATION_PRESETS, AnimationPreset, animationPresetSchema (+37 more)

### Community 16 - "solidgate-provider.ts"
Cohesion: 0.13
Nodes (18): apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot, safeEqual() (+10 more)

### Community 17 - "Status log"
Cohesion: 0.08
Nodes (41): buttonEdges(), useEditorData(), ActionField(), DestinationField(), Step: Screen routing, Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit (+33 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.13
Nodes (10): DomainNotFoundError, DomainTakenError, FunnelGroup, FunnelNotFoundError, GroupNotFoundError, fail(), SupabaseFunnelRepository, toDomain() (+2 more)

### Community 19 - "cron/domains/route.ts"
Cohesion: 0.12
Nodes (12): dynamic, NO_STORE, POST(), Summary, domainStatusSchema, resultSchema, rowSchema, SupabaseDomainMaintenance (+4 more)

### Community 20 - "StudioFunnels.tsx"
Cohesion: 0.09
Nodes (48): DeleteFunnelButton(), BookIcon(), FlowIcon(), FolderIcon(), HomeIcon(), LogoMark(), LogoutIcon(), PenIcon() (+40 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.12
Nodes (18): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+10 more)

### Community 22 - "publish/route.ts"
Cohesion: 0.22
Nodes (12): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), pickerPlanKeys(), CheckoutTarget, ContentItem (+4 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "catalog.tsx"
Cohesion: 0.08
Nodes (34): AddElementPanel(), isAttached(), NO_PREVIEW, presetProps(), Preview(), useApplyPresets(), usePuck, describe() (+26 more)

### Community 25 - "actions.ts"
Cohesion: 0.23
Nodes (13): authenticate(), credentialsSchema, failureLimiter, hasControlCharacter(), NOT_A_CREDENTIAL_CHECK, requestLimiter, requestOrigin(), safeNext() (+5 more)

### Community 26 - "DomainsPanel.tsx"
Cohesion: 0.07
Nodes (55): Context, dynamic, isDomainTaken(), POST(), bodySchema, Context, dynamic, GET() (+47 more)

### Community 27 - "plans.ts"
Cohesion: 0.23
Nodes (12): dynamic, GET(), getPlan(), listPublicPlans(), loadPlans(), parsePlans(), PlanCatalogue, planSchema (+4 more)

### Community 28 - "migrate.ts"
Cohesion: 0.17
Nodes (16): DefinitionCheck, isOlderDefinition(), parseInput(), Step: Validate definition, clampScreenAnimation(), isRecord(), migrate(), MigrationError (+8 more)

### Community 29 - "ScreenStyles.tsx"
Cohesion: 0.17
Nodes (26): channel(), ColorRow(), hexOf(), hslToRgb(), joinColor(), Label(), NumberInput(), NumberInputProps (+18 more)

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
Cohesion: 0.18
Nodes (15): PLAN_PICKER_TYPES, PlanItem, planPickerProps, SELECTED_PLAN_KEY, totalsProps, trialPickerProps, walletProps, BillingPlanPicker() (+7 more)

### Community 35 - "funnelRoutes"
Cohesion: 0.07
Nodes (43): formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm(), slugify() (+35 more)

### Community 37 - "Steps"
Cohesion: 0.22
Nodes (9): Flow, Related, Step: Autosave draft, Step: Funnel versions, Step: Publish version, Step: Rollback, Steps, Studio authoring (+1 more)

### Community 38 - "styles.ts"
Cohesion: 0.09
Nodes (23): animationSchema, BUTTON_TYPES, ElementAnimation, elementMetaSchema, elementStyleSchema, FONT_STACKS, INPUT_TYPES, isElementVisible() (+15 more)

### Community 39 - "parseStoredDefinition"
Cohesion: 0.31
Nodes (5): PublishedFunnel, parseStoredDefinition(), SupabasePublishedReader, toVersion(), Step: Load live version

### Community 41 - "StyleFields.tsx"
Cohesion: 0.11
Nodes (18): ALIGN_OPTIONS, DECORATION_OPTIONS, EFFECT_OPTIONS, POSITION_LABELS, POSITION_OPTIONS, SHADOW_OPTIONS, StyleFieldsProps, StyleKind (+10 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "createSupabaseServiceClient"
Cohesion: 0.22
Nodes (7): createSupabaseServiceClient(), MissingServiceKeyError, HEADER, FunnelLead, LeadInput, leadRowSchema, ServiceClient

### Community 45 - "next"
Cohesion: 0.27
Nodes (7): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, studioShellProps(), MermaidDiagrams()

### Community 46 - "leads/registry.ts"
Cohesion: 0.24
Nodes (8): Context, dynamic, GET(), getLeadStore(), globalForLeads, LeadStore, SupabaseLeadStore, Step: Store lead

### Community 47 - "src/proxy.ts"
Cohesion: 0.22
Nodes (18): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+10 more)

### Community 48 - "FunnelRuntime.tsx"
Cohesion: 0.09
Nodes (51): contrastingForeground(), EmailBlock, emailBlocks(), foregroundForLuminance(), linearize(), loadUsableRun(), parseChannel(), parseHex() (+43 more)

### Community 49 - "inputs.tsx"
Cohesion: 0.12
Nodes (21): checkboxProps, datePickerProps, ratingProps, sliderProps, textInputProps, editorOnly(), EmailOAuth(), emailOAuthProps (+13 more)

### Community 50 - "types.ts"
Cohesion: 0.12
Nodes (26): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, formSchema (+18 more)

### Community 51 - "Steps"
Cohesion: 0.40
Nodes (6): csvCell(), leadsToCsv(), Step: Export CSV, Step: List leads, Step: Send on advance, Steps

### Community 52 - "ThemeDefaults.tsx"
Cohesion: 0.23
Nodes (11): cleanObject(), Group, KIND, ThemeDefaults(), BUILTIN_SCREEN, builtinTokens(), readStyleRecord(), safe() (+3 more)

### Community 53 - "public.domains"
Cohesion: 0.21
Nodes (11): domains_funnel_id_idx, domains_guard, domains_project_id_idx, domains_verified_hostname_idx, public.domains, public.domains_guard(), public.get_published_funnel_by_host(), public.is_host_servable() (+3 more)

### Community 54 - "AssistantPanel.tsx"
Cohesion: 0.25
Nodes (6): Card, Message, PALETTES, PlanStep, SUGGESTIONS, TypeMeta

### Community 55 - "content.tsx"
Cohesion: 0.10
Nodes (44): ButtonView(), Badge(), Chart(), Faq(), autoNext, CookieConsent(), cookieProps, CustomerCarousel() (+36 more)

### Community 56 - "stripe-provider.ts"
Cohesion: 0.09
Nodes (21): isMockEnabled(), MockProvider, PAYER_HASH_PATTERN, adjustmentMetadataSchema, metadataSchema, STRIPE_API_VERSION, StripeProvider, StripeProviderDeps (+13 more)

### Community 57 - "FunnelRuntime"
Cohesion: 0.10
Nodes (20): dynamic, PreviewPage(), FunnelRuntime(), parseDefinition(), longestPathFrom(), Animation, Architecture, Custom domains (Stage 6) (+12 more)

### Community 58 - "file-payment-store.ts"
Cohesion: 0.06
Nodes (36): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+28 more)

### Community 59 - "webhook.ts"
Cohesion: 0.06
Nodes (53): dynamic, NO_STORE, POST(), Context, dynamic, GET(), POST(), dynamic (+45 more)

### Community 60 - "docs.ts"
Cohesion: 0.23
Nodes (8): DocEntry, DocGroup, listDocs(), listFeatures(), loadDoc(), readOptional(), REFERENCE, RenderedDoc

### Community 64 - "draft/route.ts"
Cohesion: 0.24
Nodes (9): Context, dynamic, GET(), PUT(), saveSchema, isNamed(), mapRepositoryError(), checkDefinition() (+1 more)

### Community 69 - "clientKeyFromHeaders"
Cohesion: 0.19
Nodes (12): AuthKeys, register(), requireAppUrlInProduction(), clientIpHeader(), clientKeyFromHeaders(), trustedHops(), C4 model, Component responsibilities (+4 more)

### Community 70 - "Data flow"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+2 more)

### Community 71 - "react"
Cohesion: 0.10
Nodes (24): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, CheckoutBlockView(), ACTION_LABELS (+16 more)

### Community 72 - "public.payment_orphans"
Cohesion: 0.24
Nodes (6): public.payment_orphans, public.record_payment_adjustment(), public.record_payment_adjustment(), payment_orphans_payment_idx, payment_orphans_run_idx, public.apply_deferred_adjustments()

### Community 73 - "payment-status.ts"
Cohesion: 0.40
Nodes (5): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult

### Community 74 - "Security"
Cohesion: 0.20
Nodes (10): Custom domains, Leads (personal data), Operational, Response headers, Runtime safety, Secrets policy, Security, Stage 3 implementation: auth, RLS, public read (+2 more)

### Community 75 - "Deployment"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 77 - "resolveStorageMode"
Cohesion: 0.29
Nodes (8): @supabase/ssr@0.12.7, readSupabaseEnv(), requireSupabaseEnv(), resolveStorageMode(), SupabaseEnv, SESSION_COOKIE_OPTIONS, SessionResult, @supabase/ssr

### Community 78 - "templates.ts"
Cohesion: 0.25
Nodes (17): newScreen(), shortId(), randomId(), newOptionId(), attached(), checkoutBlock(), createQuizContent(), createScreenContent() (+9 more)

### Community 80 - "seed.ts"
Cohesion: 0.07
Nodes (35): Flow, Screen elements, Step: Add Element panel, Step: Authentication, Step: Button actions, Step: Catalog, Step: Continue gates, Step: Frame (+27 more)

### Community 81 - "file-funnel-repository.ts"
Cohesion: 0.08
Nodes (32): DomainStatus, domainFileSchema, groupFileSchema, isNotFound(), versionSummarySchema, DefinitionInvalidError, DomainCheck, DomainLimitError (+24 more)

### Community 82 - "ConditionPicker.tsx"
Cohesion: 0.19
Nodes (17): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+9 more)

### Community 83 - "ref_node_path"
Cohesion: 0.33
Nodes (4): devOrigins, nextConfig, privateHeaders, securityHeaders

### Community 84 - "ElementInspector.tsx"
Cohesion: 0.17
Nodes (12): ANIMATION_OPTIONS, EFFECT_TYPES, InspectedElement, Tab, VISIBILITY_OPTIONS, ELEMENT_ANIMATIONS, ElementMeta, inheritedStyle() (+4 more)

### Community 85 - "frame.tsx"
Cohesion: 0.38
Nodes (10): Frame(), framed(), FramedBlock(), SLOT_CLASS, useFunnelTheme(), containerStyle(), isItemShown(), readElementMeta() (+2 more)

### Community 86 - "getStudioContext"
Cohesion: 0.27
Nodes (10): dynamic, EditFunnelPage(), dynamic, first(), StudioFunnelsPage(), dynamic, StudioPage(), uiFont (+2 more)

### Community 87 - "funnel-groups/[id]/route.ts"
Cohesion: 0.33
Nodes (5): Context, DELETE(), dynamic, PATCH(), renameSchema

### Community 88 - "Steps"
Cohesion: 0.13
Nodes (14): AI assistant (design), Flow, Rollout, Security, Step: Assistant route, Step: Generative UI cards, Step: Guards, Step: Model adapter (+6 more)

### Community 89 - "login/page.tsx"
Cohesion: 0.33
Nodes (6): AuthFormState, initialState, LoginForm(), dynamic, firstValue(), LoginPage()

### Community 90 - "file-lead-store.ts"
Cohesion: 0.33
Nodes (4): fileSchema, isNotFound(), LeadFile, recordSchema

### Community 91 - "repository.ts"
Cohesion: 0.33
Nodes (7): createSupabaseAnonClient(), globalForPayments, getDataDir(), getFileRepository(), globalForRepo, server-only, @supabase/supabase-js

### Community 92 - "public.leads"
Cohesion: 0.53
Nodes (5): leads_funnel_created_idx, leads_project_id_idx, leads_version_id_idx, public.leads, public.record_lead()

### Community 94 - "RateLimiter"
Cohesion: 0.26
Nodes (7): accountClientKey(), isNonCredentialError(), releaseSignInFailure(), requestBlocked(), reserveSignInFailure(), RateLimiter, Step: Rate limits

### Community 95 - "screen-refs.ts"
Cohesion: 0.53
Nodes (5): cleanItem(), cleanItems(), isItem(), Item, stripScreenRefs()

### Community 96 - "Steps"
Cohesion: 0.18
Nodes (10): Flow, Step: Create a funnel, Step: Load funnels, Step: Manage projects, Step: Move a funnel, Step: Render the funnel list, Step: Render the overview, Steps (+2 more)

### Community 97 - "leads.ts"
Cohesion: 0.50
Nodes (4): LEADS_ROUTE, LeadSubmission, sendLead(), warn()

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
Cohesion: 0.50
Nodes (4): Flow, Lead capture, Related, What it does

### Community 102 - "Checkout"
Cohesion: 0.50
Nodes (4): Checkout, Flow, Related, What it does

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
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `web/package.json`, `use-funnel-analytics.ts`, `content.tsx`, `config.tsx`, `FunnelEditor`, `index.ts`, `ScreenCanvas.tsx`, `Funnel Schema and Theme`, `StudioFunnels.tsx`, `catalog.tsx`, `DomainsPanel.tsx`, `ScreenStyles.tsx`, `paywall.tsx`, `funnelRoutes`, `styles.ts`, `StyleFields.tsx`, `next`, `FunnelRuntime.tsx`, `inputs.tsx`, `ThemeDefaults.tsx`, `AssistantPanel.tsx`, `content.tsx`, `app/layout.tsx`, `ElementInspector.tsx`, `frame.tsx`, `login/page.tsx`, `repository.ts`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05203619909502263 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `parseJsonBody`, `web/package.json`, `checkout/route.ts`, `config.tsx`, `api/leads/route.ts`, `FunnelEditor`, `withStudio`, `ScreenCanvas.tsx`, `cron/domains/route.ts`, `StudioFunnels.tsx`, `publish/route.ts`, `actions.ts`, `DomainsPanel.tsx`, `plans.ts`, `funnelRoutes`, `next`, `leads/registry.ts`, `src/proxy.ts`, `types.ts`, `content.tsx`, `FunnelRuntime`, `webhook.ts`, `draft/route.ts`, `resolveStorageMode`, `app/layout.tsx`, `file-funnel-repository.ts`, `getStudioContext`, `funnel-groups/[id]/route.ts`, `login/page.tsx`, `repository.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `use-funnel-analytics.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08599290780141844 - nodes in this community are weakly interconnected._
- **Why does `FileFunnelRepository` connect `File Funnel Repository` to `Funnel Repository Interface`, `Steps`, `index.ts`, `file-funnel-repository.ts`, `Status log`, `cron/domains/route.ts`, `repository.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._