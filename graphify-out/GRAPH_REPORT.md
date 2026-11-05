# Graph Report - funnel-platform  (2026-11-05)

## Corpus Check
- 269 files · ~161,857 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 14, (none) 6, .example 1)

## Summary
- 2570 nodes · 7043 edges · 129 communities (105 shown, 24 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 449 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bd4c383d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ImageAssets.tsx
- web/package.json
- use-funnel-analytics.ts
- Root Tooling and Lint
- webhook.ts
- [id]/domains/route.ts
- File Funnel Repository
- config.tsx
- switch-platform-domain.mjs
- rate-limit.ts
- FunnelEditor.tsx
- catalog.tsx
- Core DB Schema Migrations
- next
- index.ts
- Funnel Schema and Theme
- switch-platform-domain.mjs
- validate.ts
- Supabase Funnel Repository
- payments/types.ts
- StudioShell.tsx
- Payments DB Migrations
- stripe-provider.ts
- Web TS Config
- ref_zod
- use-draft-saver.ts
- templates.ts
- elements/layout.tsx
- flow.tsx
- StyleFields.tsx
- Docker Compose
- Schema Package Manifest
- verify.ts
- paywall.tsx
- Funnel Repository Interface
- react
- [id]/leads/route.ts
- Steps
- styles.ts
- supabase-funnel-repository.ts
- inline.ts
- Schema TS Config
- README
- repository.ts
- guards.ts
- api/leads/route.ts
- ai/brief.ts
- studio-overview.ts
- RuntimeInner
- FunnelDefinition
- assets/route.ts
- payments/registry.ts
- public.domains
- migrate.ts
- inputs.tsx
- solidgate-provider.ts
- ConditionPicker.tsx
- src/brief.ts
- getPaymentStore
- DomainsPanel.tsx
- Next.js Agent Notes
- events.ts
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- Security
- src/proxy.ts
- Repository Audit (Stage 0)
- CheckoutPanel.tsx
- public.payment_orphans
- FunnelRuntime.tsx
- chat.ts
- index.ts
- AssistantPanel.tsx
- payments/types.ts
- screen-refs.ts
- ref_zod
- text-edits.ts
- checkout/route.ts
- Implementation Plan
- login/page.tsx
- resolveStorageMode
- getStudioContext
- FunnelRuntime
- RateLimiter
- migrate
- Data flow
- Studio authoring
- public.leads
- Asset
- actions.ts
- Auth and access
- guards.ts
- seed.ts
- Analytics and consent
- Deployment
- next
- isPaymentType
- @stripe/react-stripe-js
- Feature map
- Custom domains
- react
- dependencies
- @stripe/stripe-js
- supabase-payment-store.ts
- Steps
- payment-status.ts
- Checkout
- public.funnel_groups
- Refunds and disputes
- @anthropic-ai/sdk
- stripe
- scripts
- @funnel/schema@workspace:*
- Steps
- public.ai_usage
- lottie-web
- marked
- posthog-js
- posthog-node
- motion
- sharp
- zod@4.6.7

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 91 edges
2. `next` - 66 edges
3. `react` - 60 edges
4. `withStudio()` - 59 edges
5. `FileFunnelRepository` - 56 edges
6. `server-only` - 49 edges
7. `SupabaseFunnelRepository` - 45 edges
8. `FunnelDefinition` - 44 edges
9. `Icon()` - 39 edges
10. `parse()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Step: Frame` --references--> `FunnelRuntime()`  [INFERRED]
  docs/features/12-elements.md → apps/web/src/components/FunnelRuntime.tsx
- `Step: Render the funnel list` --references--> `StudioFunnels()`  [INFERRED]
  docs/features/15-studio-overview.md → apps/web/src/components/StudioFunnels.tsx
- `Step: Browser events` --references--> `AnalyticsEvent`  [INFERRED]
  docs/features/60-analytics-consent.md → apps/web/src/lib/analytics/events.ts
- `Step: Autosave draft` --references--> `useDraftSaver()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/lib/use-draft-saver.ts

## Import Cycles
- None detected.

## Communities (129 total, 24 thin omitted)

### Community 0 - "ImageAssets.tsx"
Cohesion: 0.11
Nodes (17): AssetError, assetSchema, errorSchema, IMAGE_ASPECTS, ImageAspect, ImageAssetsContext, ImageAssetsValue, LibraryAsset (+9 more)

### Community 1 - "web/package.json"
Cohesion: 0.21
Nodes (12): devDependencies, @types/node@22.19.1, @types/react@19.3.0, @types/react-dom@19.3.0, typescript@5.9.3, typescript, name, private (+4 more)

### Community 2 - "use-funnel-analytics.ts"
Cohesion: 0.17
Nodes (24): isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent(), warn() (+16 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "webhook.ts"
Cohesion: 0.11
Nodes (21): PaymentStore, isAdjustment(), PaymentAdjustment, emitAdjustment(), eventUuid(), processAdjustment(), processEvents(), recordVerifiedEvent() (+13 more)

### Community 5 - "[id]/domains/route.ts"
Cohesion: 0.15
Nodes (22): bodySchema, Context, dynamic, GET(), POST(), CustomDomainFunnelPage(), dynamic, HOSTNAME_MAX_LENGTH (+14 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.15
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "config.tsx"
Cohesion: 0.11
Nodes (29): EmailInputProps, emailKey(), isValidEmail(), checkoutBlockProps, CheckoutBlockView(), Heading(), headingProps, ImageBlock() (+21 more)

### Community 8 - "switch-platform-domain.mjs"
Cohesion: 0.14
Nodes (12): HEADER, FileLeadStore, fileSchema, isNotFound(), LeadFile, recordSchema, globalForLeads, FunnelLead (+4 more)

### Community 9 - "rate-limit.ts"
Cohesion: 0.33
Nodes (6): C4 model, Component responsibilities, Import-graph edges (value imports, grouped), Level 1: System context, Level 2: Containers, Level 3: Components of the web app

### Community 10 - "FunnelEditor.tsx"
Cohesion: 0.07
Nodes (64): ImageAssetsProvider(), AnimationSettings(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight(), CopyIcon(), DotsIcon() (+56 more)

### Community 11 - "catalog.tsx"
Cohesion: 0.09
Nodes (27): AddElementPanel(), isAttached(), NO_PREVIEW, presetProps(), Preview(), useApplyPresets(), usePuck, allowedTypesFor() (+19 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.15
Nodes (23): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+15 more)

### Community 13 - "next"
Cohesion: 0.07
Nodes (37): Context, DELETE(), dynamic, PATCH(), renameSchema, createSchema, dynamic, GET() (+29 more)

### Community 14 - "index.ts"
Cohesion: 0.13
Nodes (25): ProposalPreview, touchedScreens(), buttonEdges(), CanvasMode, EditOverlay(), Focus(), layoutColumns(), NODE_TYPES (+17 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.05
Nodes (47): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), ANIMATION_PRESETS, AnimationPreset, animationPresetSchema (+39 more)

### Community 16 - "switch-platform-domain.mjs"
Cohesion: 0.14
Nodes (14): APPLY, call(), COOLIFY_URL, coolifyHeaders, coolifyToken, local, plan(), ROOT (+6 more)

### Community 17 - "validate.ts"
Cohesion: 0.13
Nodes (17): getOptionLists(), isFallbackEdge(), isQuiz(), IssueCode, IssueSeverity, OptionListInfo, OptionListScan, optionListSchema (+9 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.13
Nodes (8): FunnelGroup, FunnelNotFoundError, GroupNotFoundError, RevisionConflictError, fail(), SupabaseFunnelRepository, toFunnel(), toGroup()

### Community 19 - "payments/types.ts"
Cohesion: 0.07
Nodes (36): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+28 more)

### Community 20 - "StudioShell.tsx"
Cohesion: 0.08
Nodes (49): confirmStopGeneration(), BookIcon(), FlowIcon(), HomeIcon(), LogoMark(), LogoutIcon(), PlusIcon(), SearchIcon() (+41 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.12
Nodes (18): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+10 more)

### Community 22 - "stripe-provider.ts"
Cohesion: 0.15
Nodes (22): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), pickerPlanKeys(), CheckoutTarget, ContentItem (+14 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "ref_zod"
Cohesion: 0.10
Nodes (29): bodySchema, dynamic, POST(), bodySchema, dynamic, POST(), dynamic, POST() (+21 more)

### Community 25 - "use-draft-saver.ts"
Cohesion: 0.12
Nodes (18): Device, PreviewPane(), IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS (+10 more)

### Community 26 - "templates.ts"
Cohesion: 0.36
Nodes (13): attached(), checkoutBlock(), createQuizContent(), createScreenContent(), heading(), nextButton(), optionList(), paragraph() (+5 more)

### Community 27 - "elements/layout.tsx"
Cohesion: 0.08
Nodes (31): badgeProps, chartProps, contentComponents, Divider(), dividerProps, faqProps, listProps, lottieProps (+23 more)

### Community 28 - "flow.tsx"
Cohesion: 0.10
Nodes (46): ButtonView(), Badge(), Chart(), Faq(), Lottie(), Video(), autoNext, CookieConsent() (+38 more)

### Community 29 - "StyleFields.tsx"
Cohesion: 0.06
Nodes (62): ColorInput(), Props, ANIMATION_OPTIONS, EFFECT_TYPES, InspectedElement, Tab, VISIBILITY_OPTIONS, channel() (+54 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "verify.ts"
Cohesion: 0.17
Nodes (21): Context, dynamic, isDomainTaken(), POST(), RoutingStatus, txtRecordName(), txtRecordValue(), checkDomainDns() (+13 more)

### Community 33 - "paywall.tsx"
Cohesion: 0.11
Nodes (26): blockId(), PuckItem, checkboxProps, datePickerProps, defaultPickerPlan(), PLAN_PICKER_TYPES, PlanItem, planPickerProps (+18 more)

### Community 35 - "react"
Cohesion: 0.11
Nodes (26): DeleteFunnelButton(), formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm() (+18 more)

### Community 36 - "[id]/leads/route.ts"
Cohesion: 0.16
Nodes (15): Context, dynamic, GET(), csvCell(), leadsToCsv(), getLeadStore(), Flow, Lead capture (+7 more)

### Community 37 - "Steps"
Cohesion: 0.20
Nodes (10): Flow, Screen elements, Step: Add Element panel, Step: Authentication, Step: Button actions, Step: Frame, Step: Loaders, Step: Plan pickers (+2 more)

### Community 38 - "styles.ts"
Cohesion: 0.08
Nodes (41): Frame(), framed(), FramedBlock(), useFunnelTheme(), animationSchema, builtinTokens(), BUTTON_TYPES, containerStyle() (+33 more)

### Community 39 - "supabase-funnel-repository.ts"
Cohesion: 0.06
Nodes (35): DomainStatus, BriefResult, domainFileSchema, groupFileSchema, versionSummarySchema, AiUsageRecord, AssetSource, DefinitionInvalidError (+27 more)

### Community 41 - "inline.ts"
Cohesion: 0.15
Nodes (12): answerSchema, INLINE_ACTIONS, InlineAction, InlineRequest, inlineRequestSchema, InlineVariant, MAX_INLINE_FIELDS, TASKS (+4 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "repository.ts"
Cohesion: 0.09
Nodes (22): devOrigins, nextConfig, privateHeaders, securityHeaders, dynamic, NO_STORE, POST(), Summary (+14 more)

### Community 45 - "guards.ts"
Cohesion: 0.15
Nodes (24): dynamic, EditFunnelPage(), BUILTIN, ModelPrice, overrides(), priceFor(), priceSchema, aiBriefOptions (+16 more)

### Community 46 - "api/leads/route.ts"
Cohesion: 0.12
Nodes (27): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, dynamic, POST() (+19 more)

### Community 47 - "ai/brief.ts"
Cohesion: 0.11
Nodes (27): bodySchema, dynamic, POST(), slugFrom(), StreamEvent, randomId(), newOptionId(), BriefEvent (+19 more)

### Community 48 - "studio-overview.ts"
Cohesion: 0.16
Nodes (21): revocationOf(), bucketIndex(), buildWindow(), DAY_FORMAT, FunnelMetrics, FunnelRow, isPaid(), loadFunnelMetrics() (+13 more)

### Community 49 - "RuntimeInner"
Cohesion: 0.20
Nodes (21): loadUsableRun(), RuntimeInner(), advance(), retreat(), adoptRunId(), answersSchema, getOrCreateRunId(), loadRun() (+13 more)

### Community 50 - "FunnelDefinition"
Cohesion: 0.17
Nodes (17): AssistantPanelProps, Proposal, CardContext, KIND_TYPE, ProposalView, ScreenNodeData, StaticScreenProps, ScreenHeaderBarProps (+9 more)

### Community 51 - "assets/route.ts"
Cohesion: 0.23
Nodes (10): dynamic, GET(), POST(), ASSET_MIME, InvalidImageError, MAX_ASSET_SIDE, MAX_UPLOAD_BYTES, ProcessedImage (+2 more)

### Community 52 - "payments/registry.ts"
Cohesion: 0.11
Nodes (17): MockProvider, PAYER_HASH_PATTERN, adjustmentMetadataSchema, metadataSchema, STRIPE_API_VERSION, StripeProvider, StripeProviderDeps, PaymentEvent (+9 more)

### Community 53 - "public.domains"
Cohesion: 0.21
Nodes (11): domains_funnel_id_idx, domains_guard, domains_project_id_idx, domains_verified_hostname_idx, public.domains, public.domains_guard(), public.get_published_funnel_by_host(), public.is_host_servable() (+3 more)

### Community 54 - "migrate.ts"
Cohesion: 0.21
Nodes (12): DefinitionCheck, isOlderDefinition(), parseInput(), clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition, retypeScreen() (+4 more)

### Community 55 - "inputs.tsx"
Cohesion: 0.15
Nodes (17): sliderProps, editorOnly(), emailOAuthProps, EMOJI_SCALE, inputComponents, OAuthButton(), oauthButtonProps, OAuthButtons() (+9 more)

### Community 56 - "solidgate-provider.ts"
Cohesion: 0.13
Nodes (18): apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot, safeEqual() (+10 more)

### Community 57 - "ConditionPicker.tsx"
Cohesion: 0.20
Nodes (16): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+8 more)

### Community 58 - "src/brief.ts"
Cohesion: 0.05
Nodes (49): CLOSING_KINDS, errorResponse, FIXED_KINDS, GOALS, KIND_LABELS, LOCKED_KINDS, outlineResponse, Plan (+41 more)

### Community 59 - "getPaymentStore"
Cohesion: 0.12
Nodes (25): dynamic, NO_STORE, POST(), Context, dynamic, GET(), dynamic, POST() (+17 more)

### Community 60 - "DomainsPanel.tsx"
Cohesion: 0.18
Nodes (16): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+8 more)

### Community 64 - "events.ts"
Cohesion: 0.17
Nodes (12): AnalyticsEmitter, AnalyticsEvent, AnalyticsEventName, AnalyticsProperties, AnalyticsPropertyValue, AnalyticsSource, EmitOptions, PropertyOptions (+4 more)

### Community 68 - "Security"
Cohesion: 0.17
Nodes (12): ServerOnlyAnalyticsEvent, Custom domains, Leads (personal data), Operational, Privacy and analytics, Response headers, Runtime safety, Secrets policy (+4 more)

### Community 69 - "src/proxy.ts"
Cohesion: 0.23
Nodes (17): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+9 more)

### Community 70 - "Repository Audit (Stage 0)"
Cohesion: 0.14
Nodes (14): coolify, License table, Method, motion, Not integrated / rejected, posthog, puck, react-sdk (Solidgate) (+6 more)

### Community 71 - "CheckoutPanel.tsx"
Cohesion: 0.11
Nodes (24): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, ACTION_LABELS, BUTTON_ACTIONS (+16 more)

### Community 72 - "public.payment_orphans"
Cohesion: 0.24
Nodes (6): public.payment_orphans, public.record_payment_adjustment(), public.record_payment_adjustment(), payment_orphans_payment_idx, payment_orphans_run_idx, public.apply_deferred_adjustments()

### Community 73 - "FunnelRuntime.tsx"
Cohesion: 0.13
Nodes (23): contrastingForeground(), EmailBlock, emailBlocks(), foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS (+15 more)

### Community 74 - "chat.ts"
Cohesion: 0.07
Nodes (45): allowedElement(), pool(), ChatRequest, chatRequestSchema, ChatResult, check(), elementPrompt(), issueKey() (+37 more)

### Community 75 - "index.ts"
Cohesion: 0.11
Nodes (24): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditor, ScreenEditorProps, ScreenEditorSlots, usePuck (+16 more)

### Community 76 - "AssistantPanel.tsx"
Cohesion: 0.08
Nodes (35): blocksOf(), BriefWizard(), freeKey(), ERROR_TEXT, errorText(), Action, ACTIONS, chunk() (+27 more)

### Community 77 - "payments/types.ts"
Cohesion: 0.08
Nodes (36): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, formSchema (+28 more)

### Community 78 - "screen-refs.ts"
Cohesion: 0.53
Nodes (5): cleanItem(), cleanItems(), isItem(), Item, stripScreenRefs()

### Community 79 - "ref_zod"
Cohesion: 0.09
Nodes (34): ImageJob, DROPPED_KEYS, Json, strictJsonSchema(), walk(), createAnthropicModel(), FALLBACK_MODELS, mapError() (+26 more)

### Community 80 - "text-edits.ts"
Cohesion: 0.15
Nodes (20): applyOne(), isAttached(), mainTarget(), PatchOp, touches(), UNCONDITIONAL, MAX_TITLE_LENGTH, applyPropsTextEdits() (+12 more)

### Community 81 - "checkout/route.ts"
Cohesion: 0.19
Nodes (21): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), getPaymentProvider(), cookieNonces(), mergeRunCookie() (+13 more)

### Community 82 - "Implementation Plan"
Cohesion: 0.17
Nodes (10): ConsentBanner(), Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 2: Components and logic, Stage 3: Database and publishing, Stage 5: Analytics and publishing operations, Stage 6: Custom domains (+2 more)

### Community 83 - "login/page.tsx"
Cohesion: 0.33
Nodes (6): AuthFormState, initialState, LoginForm(), dynamic, firstValue(), LoginPage()

### Community 84 - "resolveStorageMode"
Cohesion: 0.36
Nodes (6): dynamic, GET(), register(), requireAppUrlInProduction(), resolveStorageMode(), trustedHops()

### Community 86 - "getStudioContext"
Cohesion: 0.14
Nodes (16): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, studioShellProps(), MermaidDiagrams(), DocEntry (+8 more)

### Community 87 - "FunnelRuntime"
Cohesion: 0.11
Nodes (18): dynamic, PreviewPage(), FunnelRuntime(), parseDefinition(), Animation, Architecture, Custom domains (Stage 6), Deployment (Stage 5) (+10 more)

### Community 89 - "migrate"
Cohesion: 0.12
Nodes (14): PublishedFunnel, VersionUnreadableError, parseStoredDefinition(), SupabasePublishedReader, toVersion(), Step: Autosave draft, Step: Funnel versions, Step: Publish version (+6 more)

### Community 90 - "Data flow"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+2 more)

### Community 91 - "Studio authoring"
Cohesion: 0.50
Nodes (4): Flow, Related, Studio authoring, What it does

### Community 92 - "public.leads"
Cohesion: 0.53
Nodes (5): leads_funnel_created_idx, leads_project_id_idx, leads_version_id_idx, public.leads, public.record_lead()

### Community 93 - "Asset"
Cohesion: 0.27
Nodes (3): isNotFound(), Asset, NewAsset

### Community 94 - "actions.ts"
Cohesion: 0.17
Nodes (20): accountClientKey(), authenticate(), AuthKeys, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK (+12 more)

### Community 95 - "Auth and access"
Cohesion: 0.50
Nodes (4): Auth and access, Flow, Related, What it does

### Community 96 - "guards.ts"
Cohesion: 0.13
Nodes (17): AiSessionResult, dailyBudgetMicroUsd(), imageEstimate(), ImageSession, ledger, LedgerEntry, Meter, notConfigured() (+9 more)

### Community 97 - "seed.ts"
Cohesion: 0.26
Nodes (12): RetypeResult, Step: Catalog, Edge, button(), createSeedFunnel(), createStarterFunnel(), heading(), options() (+4 more)

### Community 98 - "Analytics and consent"
Cohesion: 0.40
Nodes (5): Analytics and consent, Flow, Related, What is and is not sent, What it does

### Community 99 - "Deployment"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 101 - "next"
Cohesion: 0.09
Nodes (16): dynamic, metadata, viewport, dynamic, first(), StudioFunnelsPage(), dynamic, StudioPage() (+8 more)

### Community 102 - "isPaymentType"
Cohesion: 0.22
Nodes (13): ActionField(), DestinationField(), Data model, Step: Screen routing, Stage 1: Minimal vertical slice (in progress), matches(), nextScreen(), NextScreenOptions (+5 more)

### Community 104 - "Feature map"
Cohesion: 0.40
Nodes (5): Background jobs, Feature map, How a funnel lives, Keeping these pages current, Map

### Community 105 - "Custom domains"
Cohesion: 0.40
Nodes (5): Custom domains, Domain status, Flow, Related, What it does

### Community 106 - "react"
Cohesion: 0.39
Nodes (7): describe(), flatten(), isItem(), Item, Layer, LayersPanel(), usePuck

### Community 107 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @google/genai@2.30.0, mermaid@12.2.0, next@16.4.3, openai@7.41.0, @puckeditor/core@0.23.0, react@19.3.1, react-dom@19.3.1 (+7 more)

### Community 109 - "supabase-payment-store.ts"
Cohesion: 0.22
Nodes (10): @supabase/supabase-js@2.118.0, readSupabaseEnv(), requireSupabaseEnv(), SupabaseEnv, SESSION_COOKIE_OPTIONS, SessionResult, createSupabaseAnonClient(), MissingServiceKeyError (+2 more)

### Community 110 - "Steps"
Cohesion: 0.18
Nodes (10): Flow, Step: Create a funnel, Step: Load funnels, Step: Manage projects, Step: Move a funnel, Step: Render the funnel list, Step: Render the overview, Steps (+2 more)

### Community 111 - "payment-status.ts"
Cohesion: 0.40
Nodes (5): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult

### Community 112 - "Checkout"
Cohesion: 0.50
Nodes (4): Checkout, Flow, Related, What it does

### Community 113 - "public.funnel_groups"
Cohesion: 0.67
Nodes (3): funnel_groups_project_id_idx, funnels_group_id_idx, public.funnel_groups

### Community 114 - "Refunds and disputes"
Cohesion: 0.50
Nodes (4): Flow, Refunds and disputes, Related, What it does

### Community 118 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, typecheck

### Community 120 - "Steps"
Cohesion: 0.12
Nodes (15): AI assistant, Deviations from the first design, Flow, Security, What it does, AI generation, Flow, Step: Brief wizard (+7 more)

### Community 121 - "public.ai_usage"
Cohesion: 0.36
Nodes (6): ai_usage_project_created_idx, assets_project_created_idx, funnels_ai_draft_expires_idx, public.ai_spend_since(), public.ai_usage, public.assets

## Knowledge Gaps
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `ImageAssets.tsx`, `web/package.json`, `[id]/domains/route.ts`, `config.tsx`, `FunnelEditor.tsx`, `next`, `StudioShell.tsx`, `stripe-provider.ts`, `ref_zod`, `flow.tsx`, `verify.ts`, `react`, `[id]/leads/route.ts`, `repository.ts`, `guards.ts`, `api/leads/route.ts`, `ai/brief.ts`, `FunnelDefinition`, `assets/route.ts`, `src/brief.ts`, `getPaymentStore`, `src/proxy.ts`, `payments/types.ts`, `checkout/route.ts`, `login/page.tsx`, `resolveStorageMode`, `getStudioContext`, `FunnelRuntime`, `actions.ts`, `guards.ts`, `dependencies`, `supabase-payment-store.ts`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `ImageAssets.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11462450592885376 - nodes in this community are weakly interconnected._
- **Why does `react` connect `CheckoutPanel.tsx` to `ImageAssets.tsx`, `web/package.json`, `use-funnel-analytics.ts`, `config.tsx`, `FunnelEditor.tsx`, `catalog.tsx`, `index.ts`, `Funnel Schema and Theme`, `StudioShell.tsx`, `use-draft-saver.ts`, `elements/layout.tsx`, `flow.tsx`, `StyleFields.tsx`, `paywall.tsx`, `react`, `styles.ts`, `repository.ts`, `FunnelDefinition`, `inputs.tsx`, `src/brief.ts`, `DomainsPanel.tsx`, `FunnelRuntime.tsx`, `index.ts`, `AssistantPanel.tsx`, `Implementation Plan`, `login/page.tsx`, `getStudioContext`, `next`, `react`, `dependencies`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `withStudio()` (e.g. with `Storage, auth and public read path (Stage 3)` and `Component responsibilities`) actually correct?**
  _`withStudio()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `Root Tooling and Lint` be split into smaller, more focused modules?**
  _Cohesion score 0.07357357357357357 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `ref_zod` to `web/package.json`, `webhook.ts`, `[id]/domains/route.ts`, `switch-platform-domain.mjs`, `next`, `payments/types.ts`, `stripe-provider.ts`, `verify.ts`, `supabase-funnel-repository.ts`, `inline.ts`, `repository.ts`, `guards.ts`, `api/leads/route.ts`, `ai/brief.ts`, `studio-overview.ts`, `assets/route.ts`, `payments/registry.ts`, `solidgate-provider.ts`, `getPaymentStore`, `events.ts`, `chat.ts`, `payments/types.ts`, `checkout/route.ts`, `getStudioContext`, `guards.ts`, `next`, `dependencies`, `supabase-payment-store.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._