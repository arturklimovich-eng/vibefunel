# Graph Report - funnel-platform  (2026-11-11)

## Corpus Check
- 270 files · ~163,766 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 14, (none) 6, .example 1)

## Summary
- 2599 nodes · 6853 edges · 141 communities (115 shown, 26 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 141 edges (avg confidence: 0.85)
- Token cost: 392,747 input · 0 output

## Community Hubs (Navigation)
- API Route Helpers
- Studio Overview & Docs
- Custom Domain Management
- Funnel Repositories
- Funnel Editor UI
- Core DB Schema Migrations
- AI Provider Adapters
- File Repository Internals
- Supabase Repository Internals
- Payment Registry & Status
- AI Assistant Panel
- Screen Canvas
- Payment DB Tables
- Analytics Events
- Payment Store
- Funnel Runtime State
- Content Elements Rendering
- Root Tooling Config
- AI Route Guards
- Add Element Catalog
- Schema Animation Types
- Funnel Validation
- Lead Store
- Brief Compiler
- Stripe Provider & Plans
- Element Style Tokens
- File Payment Store
- Solidgate Provider
- AI Generation Runs
- Screen Editor Adapters
- Studio Funnel List
- Puck Element Config
- FunnelRepository Interface
- Studio Panels & API Routes
- AI Feature Docs
- Storage Mode & Supabase Env
- Host & Origin Resolution
- AI Chat Assistant
- Mock Payments & Checkout Target
- Login Auth Actions
- Checkout UI Components
- AI Model Registry
- Image Assets
- Runtime Gates & Element Schemas
- Brief Wizard Types
- Style Fields Editor
- Payment Provider Types
- Payment Feature Docs
- Edge Condition Picker
- Runtime Input Elements
- Layout Text Elements
- AI Brief Generation
- Web TS Config
- Inline AI Edit
- Paywall Plan Picker
- Text Edits
- Published Funnel Pages
- Draft Autosave & Validation
- Flow Elements
- Definition Migration & Reading
- Studio Shell
- Element Inspector & Theme Defaults
- Screen Style Controls
- Lead Capture API
- Docker Compose
- Implementation Stages
- Schema Package Manifest
- Checkout API & Run Token
- Patch Application
- Screen Templates
- Web Dev Dependencies
- Web Runtime Dependencies
- Rate Limiting & Instrumentation
- Color Controls
- Button & Timer Elements
- Proxy & CSP
- Authoring Feature Docs
- Runtime Feature Docs
- Element Frame Wrapper
- Domains & Cron Docs
- MCP Agent Access Docs
- Assistant Schemas
- Schema TS Config
- Payment Architecture Docs
- Payment Security Rules
- Project Docs Index
- Asset Storage
- MCP-Readiness Contract
- Deployment & Portability Docs
- Analytics Feature Docs
- Stage Plan: Analytics & Domains
- Seed Funnels
- Login Page
- Versions & Preview Panels
- Layers Panel
- Theme Editor
- Runtime Data Model Docs
- Repository Architecture Docs
- Draft Save & Rollback Docs
- Publish & RLS Docs
- Security Controls Docs
- Lead Capture Docs
- Auth Access Docs
- Definition Migrations
- Leads CSV Export
- Persistence Architecture Docs
- Custom Domain Architecture Docs
- ID & Slug Helpers
- Audit & Plan Docs
- Next Config
- Payment Status Client
- Screen Reference Cleanup
- Schema & Payments Plan Docs
- Root Scripts
- Lead Submission Client
- Analytics Architecture Docs
- Studio Layout Breakpoint
- Schema Workspace Dependency
- Lottie Dependency
- Marked Dependency
- Mermaid Dependency
- Motion Dependency
- PostHog JS Dependency
- PostHog Node Dependency
- React DOM Dependency
- Sharp Dependency
- Solidgate SDK Dependency
- Stripe Dependency
- Stripe React Dependency
- Supabase JS Dependency
- XYFlow Dependency
- Review & Status Log
- Puck Data Schema
- pnpm Workspace
- Animation Presets Doc
- Published Funnel RPC Doc
- Platform Routes Doc

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 88 edges
2. `next` - 66 edges
3. `react` - 60 edges
4. `FileFunnelRepository` - 53 edges
5. `withStudio()` - 52 edges
6. `server-only` - 49 edges
7. `FunnelDefinition` - 43 edges
8. `SupabaseFunnelRepository` - 42 edges
9. `Icon()` - 39 edges
10. `parse()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `Stripe payments (test mode, one-time only)` --semantically_similar_to--> `Payment flow (checkout, webhook, status polling)`  [INFERRED] [semantically similar]
  README.md → docs/ARCHITECTURE.md
- `InlineAi()` --indirect_call--> `screenTextFields()`  [INFERRED]
  apps/web/src/components/ai/InlineAi.tsx → packages/funnel-schema/src/text-edits.ts
- `EditorData` --references--> `ScreenType`  [EXTRACTED]
  apps/web/src/lib/puck/editor-context.tsx → packages/funnel-schema/src/schema.ts
- `DraftSaver` --references--> `FunnelDefinition`  [EXTRACTED]
  apps/web/src/lib/use-draft-saver.ts → packages/funnel-schema/src/schema.ts
- `Custom domains (TXT + CNAME, local testing)` --conceptually_related_to--> `Custom domains (Stage 6): verify, proxy.ts resolution, serve-check`  [INFERRED]
  README.md → docs/ARCHITECTURE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Server-confirmed payment flow (checkout, payer nonce, webhook record, status poll)** — docs_architecture_checkoutpanel, docs_data_flow_payer_nonce, docs_data_flow_record_payment_event, docs_architecture_paymentprovider, docs_architecture_paymentstore, docs_architecture_nextscreen [EXTRACTED 1.00]
- **Custom domain verification and TLS serving** — docs_architecture_custom_domains, docs_architecture_proxy_ts, docs_deployment_serve_check, docs_deployment_caddy_on_demand_tls, docs_architecture_domainmaintenance, docs_architecture_hostname_normalise [EXTRACTED 1.00]
- **MCP-readiness operations contract** — claude_patchop, claude_typed_errors, claude_thin_route_handlers, claude_portability, claude_agent_security, docs_architecture_funnel_schema [EXTRACTED 1.00]
- **Draft, publish and rollback authoring flow** — docs_features_10_authoring_usedraftsaver, docs_features_10_authoring_save_draft_route, docs_security_save_draft_rpc, docs_features_10_authoring_publish_version, docs_security_publish_funnel_rpc, docs_features_10_authoring_rollback, docs_security_rollback_funnel_rpc, docs_features_10_authoring_funnel_versions [EXTRACTED 1.00]
- **PaymentProvider implementations** — docs_implementation_plan_paymentprovider, docs_implementation_plan_stripeprovider, docs_implementation_plan_solidgateprovider, docs_implementation_plan_mockprovider [EXTRACTED 1.00]
- **Server-confirmed payment security controls** — docs_security_payment_rules, docs_security_record_payment_event, docs_security_payer_binding, docs_security_payment_plans_catalogue, docs_security_rate_limiting [INFERRED 0.85]
- **Server-verified payment pipeline (webhook to access)** — docs_features_30_checkout_stripe_webhook, docs_features_30_checkout_record_payment_event_rpc, docs_features_30_checkout_payments_table, docs_features_30_checkout_payment_status_endpoint, docs_features_40_refunds_disputes_revocationof, docs_features_40_refunds_disputes_apply_payment_adjustment_row, docs_features_40_refunds_disputes_apply_deferred_adjustments [EXTRACTED 1.00]
- **Shared AI infrastructure (adapters, guards, element guide, screen builder)** — docs_features_81_ai_generation_textmodel, docs_features_81_ai_generation_openaisession_guards, docs_features_81_ai_generation_elements_guide, docs_features_81_ai_generation_buildscreen, docs_features_80_ai_assistant_api_ai_chat, docs_features_81_ai_generation_generatefunnel, docs_features_81_ai_generation_inline_ai_copy [EXTRACTED 1.00]
- **One edit contract: PatchOp + applyPatch + validateFunnel for UI, assistant and MCP** — docs_features_90_mcp_patchop, docs_features_80_ai_assistant_applypatch, docs_features_81_ai_generation_validatefunnel, docs_features_80_ai_assistant_applyassistantpatch, docs_features_90_mcp_funnel_services, docs_features_90_mcp_validationissue [INFERRED 0.85]

## Communities (141 total, 26 thin omitted)

### Community 0 - "API Route Helpers"
Cohesion: 0.05
Nodes (60): bodySchema, dynamic, POST(), Context, DELETE(), dynamic, PATCH(), renameSchema (+52 more)

### Community 1 - "Studio Overview & Docs"
Cohesion: 0.05
Nodes (58): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, dynamic, first(), StudioFunnelsPage() (+50 more)

### Community 2 - "Custom Domain Management"
Cohesion: 0.05
Nodes (54): dynamic, NO_STORE, POST(), Summary, Context, dynamic, isDomainTaken(), POST() (+46 more)

### Community 3 - "Funnel Repositories"
Cohesion: 0.06
Nodes (41): DomainStatus, domainStatusSchema, MAX_DOMAINS_PER_FUNNEL, BriefResult, resultSchema, rowSchema, domainFileSchema, groupFileSchema (+33 more)

### Community 4 - "Funnel Editor UI"
Cohesion: 0.08
Nodes (61): AnimationSettings(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight(), CopyIcon(), DotsIcon(), DuplicateIcon() (+53 more)

### Community 5 - "Core DB Schema Migrations"
Cohesion: 0.06
Nodes (50): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+42 more)

### Community 6 - "AI Provider Adapters"
Cohesion: 0.10
Nodes (33): ImageSession, DROPPED_KEYS, Json, strictJsonSchema(), walk(), createAnthropicModel(), FALLBACK_MODELS, mapError() (+25 more)

### Community 7 - "File Repository Internals"
Cohesion: 0.14
Nodes (5): FileFunnelRepository, isRecord(), withRevision(), CustomDomain, DomainTakenError

### Community 8 - "Supabase Repository Internals"
Cohesion: 0.12
Nodes (9): DomainNotFoundError, ForbiddenError, FunnelGroup, GroupNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel() (+1 more)

### Community 9 - "Payment Registry & Status"
Cohesion: 0.11
Nodes (35): dynamic, NO_STORE, POST(), Context, dynamic, GET(), dynamic, POST() (+27 more)

### Community 10 - "AI Assistant Panel"
Cohesion: 0.08
Nodes (35): ERROR_TEXT, errorText(), Action, ACTIONS, chunk(), errorSchema, InlineAi(), LANGUAGES (+27 more)

### Community 11 - "Screen Canvas"
Cohesion: 0.11
Nodes (35): AssistantPanelProps, ProposalPreview, touchedScreens(), CanvasMode, ConnectionChrome(), EditOverlay(), Focus(), layoutColumns() (+27 more)

### Community 12 - "Payment DB Tables"
Cohesion: 0.10
Nodes (26): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+18 more)

### Community 13 - "Analytics Events"
Cohesion: 0.10
Nodes (31): isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent(), warn() (+23 more)

### Community 14 - "Payment Store"
Cohesion: 0.09
Nodes (22): AdjustmentResult, FunnelPayment, PaymentStore, RecordRejection, RecordResult, StaleDeferred, StatusDetail, StatusQuery (+14 more)

### Community 15 - "Funnel Runtime State"
Cohesion: 0.11
Nodes (32): ConsentBanner(), contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), loadUsableRun(), parseChannel(), parseHex() (+24 more)

### Community 16 - "Content Elements Rendering"
Cohesion: 0.10
Nodes (35): Badge(), badgeProps, Chart(), chartProps, contentComponents, Divider(), dividerProps, editorOnly() (+27 more)

### Community 17 - "Root Tooling Config"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 18 - "AI Route Guards"
Cohesion: 0.09
Nodes (29): bodySchema, dynamic, POST(), dynamic, POST(), bodySchema, dynamic, POST() (+21 more)

### Community 19 - "Add Element Catalog"
Cohesion: 0.09
Nodes (30): AddElementPanel(), isAttached(), NO_PREVIEW, presetProps(), Preview(), useApplyPresets(), usePuck, allowedTypesFor() (+22 more)

### Community 20 - "Schema Animation Types"
Cohesion: 0.06
Nodes (32): ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, DEV_HTTP_HOSTS, funnelSchema, funnelVersionSchema (+24 more)

### Community 21 - "Funnel Validation"
Cohesion: 0.10
Nodes (30): buttonEdges(), useEditorData(), ActionField(), DestinationField(), matches(), nextScreen(), NextScreenOptions, own() (+22 more)

### Community 22 - "Lead Store"
Cohesion: 0.12
Nodes (15): createSupabaseServiceClient(), MissingServiceKeyError, FileLeadStore, fileSchema, isNotFound(), LeadFile, recordSchema, getLeadStore() (+7 more)

### Community 23 - "Brief Compiler"
Cohesion: 0.10
Nodes (31): imageJobs(), AI_ELEMENT_TYPES, AiElement, aiElementSchema, AUTO_ADVANCING, BRIEF_GOALS, briefImageTargets, buildScreen() (+23 more)

### Community 24 - "Stripe Provider & Plans"
Cohesion: 0.11
Nodes (17): getPlan(), loadPlans(), parsePlans(), Plan, PlanCatalogue, planSchema, PlansResult, plansSchema (+9 more)

### Community 25 - "Element Style Tokens"
Cohesion: 0.09
Nodes (28): animationSchema, builtinTokens(), BUTTON_TYPES, ElementAnimation, elementMetaSchema, elementStyleSchema, FONT_STACKS, inheritedStyle() (+20 more)

### Community 26 - "File Payment Store"
Cohesion: 0.14
Nodes (16): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+8 more)

### Community 27 - "Solidgate Provider"
Cohesion: 0.13
Nodes (18): apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot, safeEqual() (+10 more)

### Community 28 - "AI Generation Runs"
Cohesion: 0.12
Nodes (22): bodySchema, dynamic, POST(), StreamEvent, dynamic, GET(), POST(), companionImageSession() (+14 more)

### Community 29 - "Screen Editor Adapters"
Cohesion: 0.12
Nodes (20): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditor, ScreenEditorProps, ScreenEditorSlots, usePuck (+12 more)

### Community 30 - "Studio Funnel List"
Cohesion: 0.16
Nodes (24): DeleteFunnelButton(), FlowIcon(), FolderIcon(), PenIcon(), PlusIcon(), NavLink(), PendingMark(), syncAttribute() (+16 more)

### Community 31 - "Puck Element Config"
Cohesion: 0.13
Nodes (24): emailKey(), checkoutBlockProps, Heading(), headingProps, ImageBlock(), imageProps, OptionListBlock(), OptionPopup() (+16 more)

### Community 33 - "Studio Panels & API Routes"
Cohesion: 0.13
Nodes (21): formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm(), slugify() (+13 more)

### Community 34 - "AI Feature Docs"
Cohesion: 0.15
Nodes (26): AI assistant (feature page), POST /api/ai/chat (runChat), applyAssistantPatch (saver.mutate), applyPatch (patch.ts, pure, server and browser), assistantAnswerSchema (flat ops, small card union), AssistantPanel chat panel (cards, proposal), Chat context (system prompt + cached draft snapshot prefix), loadFunnelMetrics (metrics card) (+18 more)

### Community 35 - "Storage Mode & Supabase Env"
Cohesion: 0.16
Nodes (17): @supabase/ssr@0.12.7, dynamic, GET(), readSupabaseEnv(), requireSupabaseEnv(), resolveStorageMode(), StorageMode, SupabaseEnv (+9 more)

### Community 36 - "Host & Origin Resolution"
Cohesion: 0.20
Nodes (19): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), POST(), normalizeHostname(), stripPort() (+11 more)

### Community 37 - "AI Chat Assistant"
Cohesion: 0.15
Nodes (24): allowedElement(), pool(), ChatProposal, ChatRequest, chatRequestSchema, ChatResult, check(), elementPrompt() (+16 more)

### Community 38 - "Mock Payments & Checkout Target"
Cohesion: 0.14
Nodes (19): unknownPlanKeys(), dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic (+11 more)

### Community 39 - "Login Auth Actions"
Cohesion: 0.16
Nodes (16): accountClientKey(), authenticate(), credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK, releaseSignInFailure() (+8 more)

### Community 40 - "Checkout UI Components"
Cohesion: 0.14
Nodes (15): metadata, viewport, CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View (+7 more)

### Community 41 - "AI Model Registry"
Cohesion: 0.17
Nodes (21): dynamic, EditFunnelPage(), BUILTIN, ModelPrice, overrides(), priceFor(), priceSchema, aiChatEnabled() (+13 more)

### Community 42 - "Image Assets"
Cohesion: 0.11
Nodes (17): AssetError, assetSchema, errorSchema, IMAGE_ASPECTS, ImageAspect, ImageAssetsContext, ImageAssetsProvider(), ImageAssetsValue (+9 more)

### Community 43 - "Runtime Gates & Element Schemas"
Cohesion: 0.13
Nodes (20): RuntimeInner(), toPuckData(), blockId(), checkboxProps, datePickerProps, defaultPickerPlan(), pickerPlanKeys(), PlanItem (+12 more)

### Community 44 - "Brief Wizard Types"
Cohesion: 0.09
Nodes (20): CLOSING_KINDS, errorResponse, FIXED_KINDS, GOALS, KIND_LABELS, LOCKED_KINDS, outlineResponse, Plan (+12 more)

### Community 45 - "Style Fields Editor"
Cohesion: 0.10
Nodes (21): ALIGN_OPTIONS, DECORATION_OPTIONS, EFFECT_OPTIONS, FONT_OPTIONS, POSITION_LABELS, POSITION_OPTIONS, SHADOW_OPTIONS, StyleFieldsProps (+13 more)

### Community 46 - "Payment Provider Types"
Cohesion: 0.16
Nodes (11): MockProvider, ACCESS_SUSPENDING_DISPUTES, CheckoutInput, CheckoutResult, MockForbiddenError, PaymentEvent, PaymentProvider, ProviderStatus (+3 more)

### Community 47 - "Payment Feature Docs"
Cohesion: 0.19
Nodes (20): Checkout (feature page), CheckoutPanel (POST /api/payments/checkout), confirmPayment / advance funnel, getPaymentProvider registry, MockProvider (dev payments), PAYMENT_PLANS_JSON plan catalogue (resolveCheckoutTarget), GET /api/payments/status (poll), payments / payment_events tables (+12 more)

### Community 48 - "Edge Condition Picker"
Cohesion: 0.17
Nodes (18): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+10 more)

### Community 49 - "Runtime Input Elements"
Cohesion: 0.16
Nodes (19): CheckoutBlockView(), Checkbox(), DatePicker(), emailOAuthProps, EMOJI_SCALE, fieldCss(), inputComponents, oauthButtonProps (+11 more)

### Community 50 - "Layout Text Elements"
Cohesion: 0.14
Nodes (17): carouselProps, columnsProps, layoutComponents, popupProps, rowsProps, slot, Components, number() (+9 more)

### Community 51 - "AI Brief Generation"
Cohesion: 0.14
Nodes (18): BriefEvent, briefPlans(), briefText(), ELEMENTS_GUIDE, generateFunnel(), generateOutline(), ImageJob, MakeImage (+10 more)

### Community 52 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 53 - "Inline AI Edit"
Cohesion: 0.12
Nodes (16): dynamic, POST(), AiSession, answerSchema, INLINE_ACTIONS, InlineAction, InlineRequest, inlineRequestSchema (+8 more)

### Community 54 - "Paywall Plan Picker"
Cohesion: 0.14
Nodes (17): SELECTED_PLAN_KEY, BillingPlanPicker(), paywallComponents, pickerDefaults, pickerFields, planItemsField, planKeyField, PlanPicker() (+9 more)

### Community 55 - "Text Edits"
Cohesion: 0.16
Nodes (18): ID_PATTERN, MAX_TITLE_LENGTH, applyPropsTextEdits(), collect(), editable(), elementTextFields(), flatten(), HEADER_ELEMENT_ID (+10 more)

### Community 56 - "Published Funnel Pages"
Cohesion: 0.20
Nodes (14): CustomDomainFunnelPage(), dynamic, dynamic, PublishedFunnelPage(), dynamic, PreviewPage(), FunnelRuntime(), parseDefinition() (+6 more)

### Community 57 - "Draft Autosave & Validation"
Cohesion: 0.16
Nodes (16): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+8 more)

### Community 58 - "Flow Elements"
Cohesion: 0.16
Nodes (17): autoNext, cookieProps, customerProps, flowComponents, Loader(), loaderProps, Processing(), processingProps (+9 more)

### Community 59 - "Definition Migration & Reading"
Cohesion: 0.16
Nodes (11): PublishedFunnel, parseStoredDefinition(), SupabasePublishedReader, toVersion(), checkDefinition(), DefinitionCheck, isOlderDefinition(), parseInput() (+3 more)

### Community 60 - "Studio Shell"
Cohesion: 0.20
Nodes (16): blocksOf(), BriefWizard(), confirmStopGeneration(), freeKey(), BookIcon(), CloseIcon(), HomeIcon(), LogoMark() (+8 more)

### Community 61 - "Element Inspector & Theme Defaults"
Cohesion: 0.13
Nodes (14): ANIMATION_OPTIONS, EFFECT_TYPES, InspectedElement, Tab, VISIBILITY_OPTIONS, Group, KIND, BUILTIN_SCREEN (+6 more)

### Community 62 - "Screen Style Controls"
Cohesion: 0.31
Nodes (16): ImageRow(), Label(), NumberInput(), NumberRow(), Row(), Section(), Segmented(), SelectRow() (+8 more)

### Community 63 - "Lead Capture API"
Cohesion: 0.20
Nodes (13): bodySchema, dynamic, POST(), rateLimited(), emailBlocks(), EMAIL_BLOCK_TYPES, EmailBlock, emailBlocksOf() (+5 more)

### Community 64 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 65 - "Implementation Stages"
Cohesion: 0.15
Nodes (15): Add Element panel, Element catalog (CATALOG, PRESETS), FileFunnelRepository, Solidgate open questions, SolidgateProvider, Stage 1: Minimal vertical slice, Stage 2: Components and logic, Stage 3: Database and publishing (+7 more)

### Community 66 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 67 - "Checkout API & Run Token"
Cohesion: 0.30
Nodes (13): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+5 more)

### Community 68 - "Patch Application"
Cohesion: 0.16
Nodes (14): applyOne(), funnelPatchSchema, isAttached(), mainTarget(), MAX_PATCH_OPS, PatchOp, patchOpSchema, screenId (+6 more)

### Community 69 - "Screen Templates"
Cohesion: 0.36
Nodes (13): attached(), checkoutBlock(), createQuizContent(), createScreenContent(), heading(), nextButton(), optionList(), paragraph() (+5 more)

### Community 70 - "Web Dev Dependencies"
Cohesion: 0.21
Nodes (12): devDependencies, @types/node@22.19.1, @types/react@19.3.0, @types/react-dom@19.3.0, typescript@5.9.3, typescript, name, private (+4 more)

### Community 71 - "Web Runtime Dependencies"
Cohesion: 0.15
Nodes (13): dependencies, @anthropic-ai/sdk@0.137.0, @google/genai@2.30.0, next@16.4.3, openai@7.41.0, @puckeditor/core@0.23.0, react@19.3.1, server-only@0.0.1 (+5 more)

### Community 72 - "Rate Limiting & Instrumentation"
Cohesion: 0.23
Nodes (10): AuthKeys, register(), requireAppUrlInProduction(), Bucket, clientIpHeader(), clientKeyFromHeaders(), defaultLimiter, DIRECT_KEY (+2 more)

### Community 73 - "Color Controls"
Cohesion: 0.26
Nodes (11): ColorInput(), Props, channel(), ColorRow(), hexOf(), hslToRgb(), joinColor(), NumberInputProps (+3 more)

### Community 74 - "Button & Timer Elements"
Cohesion: 0.21
Nodes (11): ACTION_LABELS, BUTTON_ACTIONS, buttonComponents, buttonProps, ButtonView(), TargetField(), usePuck, formatCountdown() (+3 more)

### Community 75 - "Proxy & CSP"
Cohesion: 0.28
Nodes (11): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+3 more)

### Community 76 - "Authoring Feature Docs"
Cohesion: 0.19
Nodes (13): Feature map, Background jobs (cron domains, cron payments), How a funnel lives, Studio authoring, FunnelEditor (edit graph), Screen types (schema v3), Screen elements, Studio overview (+5 more)

### Community 77 - "Runtime Feature Docs"
Cohesion: 0.24
Nodes (13): FunnelRuntime client component, get_published_funnel / get_published_funnel_by_host RPCs, nextScreen edge/condition routing, parseStoredDefinition, proxy.ts host routing (route, customHost), Public runtime (feature page), Restore progress (loadUsableRun, payment re-check), Run id and run state in sessionStorage (getOrCreateRunId, saveRun) (+5 more)

### Community 78 - "Element Frame Wrapper"
Cohesion: 0.33
Nodes (11): Frame(), framed(), FramedBlock(), hiddenBlockIds(), useFunnelTheme(), containerStyle(), isElementVisible(), isItemShown() (+3 more)

### Community 79 - "Domains & Cron Docs"
Cohesion: 0.27
Nodes (12): rate-limit.ts (checkRateLimit, clientKey, ipLimit), POST /api/cron/payments daily report, cronAuthorized (CRON_SECRET bearer), checkDomainDns TXT + routing verification, POST /api/cron/domains hourly re-verification, Custom domains (feature page), domains table (status, verification_token, recheck_failures), DomainsPanel + POST /api/funnels/id/domains (+4 more)

### Community 80 - "MCP Agent Access Docs"
Cohesion: 0.33
Nodes (10): getStudioContext, text-edits.ts (elementTextFields, screenTextFields, applyTextEdits, textEditSchema), Agent access (MCP) (feature page), API tokens (api_tokens, scopes, hashed), Funnel services (ctx, input) (planned services/funnels.ts), get_capabilities (capabilities.ts, planned), /api/mcp streamable HTTP transport (planned), PatchOp / funnelPatchSchema patch operations (+2 more)

### Community 81 - "Assistant Schemas"
Cohesion: 0.17
Nodes (11): ASSISTANT_OPS, AssistantAnswer, assistantAnswerSchema, assistantCardSchema, AssistantOp, assistantOpSchema, AssistantQuestion, assistantQuestionSchema (+3 more)

### Community 82 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 83 - "Payment Architecture Docs"
Cohesion: 0.22
Nodes (10): CheckoutPanel / CheckoutBlock, Payment flow (checkout, webhook, status polling), PaymentProvider interface (Stripe, Solidgate, Mock, registry), PaymentStore (FilePaymentStore / SupabasePaymentStore), Checkout, webhook, status sequence, Data inventory, Payer nonce cookie and payer_hash HMAC, Mock payment mode (PAYMENTS_MOCK) (+2 more)

### Community 84 - "Payment Security Rules"
Cohesion: 0.22
Nodes (7): MockProvider (PAYMENTS_MOCK), PaymentProvider interface, StripeProvider, react-stripe-js, In-memory rate limiting (TRUST_PROXY_HOPS), record_payment_adjustment and payment_orphans, Response headers and nonce CSP

### Community 85 - "Project Docs Index"
Cohesion: 0.24
Nodes (8): graphify skill trigger (/graphify), Architecture document, C4 model document, Import-graph edges table, C4 Level 1: System context, C4 Level 3: Web app components, Data flow document, Funnel Platform (pnpm workspace)

### Community 86 - "Asset Storage"
Cohesion: 0.27
Nodes (3): isNotFound(), Asset, NewAsset

### Community 87 - "MCP-Readiness Contract"
Cohesion: 0.27
Nodes (7): docs/features/90-mcp.md (MCP design and tool table), PatchOp / applyPatch, packages/funnel-schema (@funnel/schema), Puck content and ScreenEditor, validateFunnel (graph validation), Runtime UI (FunnelRuntime), Studio UI (FunnelEditor, use-draft-saver)

### Community 88 - "Deployment & Portability Docs"
Cohesion: 0.24
Nodes (9): proxy.ts (Next 16 request proxy), Storage, auth and public read path (Stage 3), RateLimiter (server/rate-limit.ts), Authentication flow (rate limits, Supabase Auth, session cookies), Coolify deployment runbook, Deployment document, Environment variable table (build vs run), Docker image build and compose (+1 more)

### Community 89 - "Analytics Feature Docs"
Cohesion: 0.29
Nodes (8): Per-request nonce CSP (csp.ts), Analytics and consent (feature page), Browser analytics events (AnalyticsEvent, toProperties), ConsentBanner + useFunnelAnalytics, PostHog, serverAnalytics / posthog-node payment events, startBrowserAnalytics (posthog-js, memory persistence), Nonce CSP and security headers (contentSecurityPolicy)

### Community 90 - "Stage Plan: Analytics & Domains"
Cohesion: 0.24
Nodes (8): Dockerfile and Coolify deployment, Domain re-verification cron (POST /api/cron/domains), Stage 5: Analytics and publishing operations, Stage 6: Custom domains, coolify, posthog, Custom domains security (TXT challenge, serve-check), Operational security

### Community 91 - "Seed Funnels"
Cohesion: 0.40
Nodes (9): button(), createSeedFunnel(), createStarterFunnel(), heading(), options(), paragraph(), puck(), PuckItem (+1 more)

### Community 92 - "Login Page"
Cohesion: 0.33
Nodes (6): AuthFormState, initialState, LoginForm(), dynamic, firstValue(), LoginPage()

### Community 93 - "Versions & Preview Panels"
Cohesion: 0.25
Nodes (6): Device, PreviewPane(), formatDate(), VersionsPanel(), VersionsResponse, versionsResponseSchema

### Community 94 - "Layers Panel"
Cohesion: 0.33
Nodes (8): describe(), flatten(), isItem(), Item, Layer, LayersPanel(), usePuck, CATALOG_BY_TYPE

### Community 95 - "Theme Editor"
Cohesion: 0.28
Nodes (8): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE

### Community 96 - "Runtime Data Model Docs"
Cohesion: 0.22
Nodes (6): Data model (Funnel, FunnelVersion, FunnelDefinition, Screen, Edge, Lead), Lead capture (EmailInput, POST /api/leads), nextScreen evaluator, Button skip action (fallbackOnly), Leads flow (record_lead RPC), Public runtime flow

### Community 97 - "Repository Architecture Docs"
Cohesion: 0.28
Nodes (9): DomainMaintenance (cron re-verification), FileFunnelRepository, FunnelRepository / PublishedReader, Domains core (server/domains), Payments core (server/payments), Supabase clients (server, anon, service), record_payment_event RPC (idempotent webhooks), Refunds and disputes (record_payment_adjustment, payment_orphans, revocationOf) (+1 more)

### Community 98 - "Draft Save & Rollback Docs"
Cohesion: 0.22
Nodes (8): checkDefinition (validate definition), Rollback (POST /rollback), PUT /api/funnels/[id]/draft, useDraftSaver autosave, funnels_guard_write trigger (app.rpc), publish_funnel RPC, rollback_funnel RPC, save_draft RPC

### Community 99 - "Publish & RLS Docs"
Cohesion: 0.22
Nodes (8): funnel_versions (immutable versions), Publish version (POST /publish), Plan pickers (values.plan, resolveCheckoutTarget), funnel_groups (Projects folders), Move a funnel (PATCH /api/funnels/ID), StudioFunnels (funnel list), PAYMENT_PLANS_JSON plan catalogue, RLS policies (projects, members, funnels, versions)

### Community 100 - "Security Controls Docs"
Cohesion: 0.22
Nodes (8): Continue gates (screenGate), Frame wrapper (framed), Loaders (auto-advance), OAuth buttons (not connected), Theme and style overrides, Leads (personal data, record_lead), record_payment_event (idempotency, state machine), Service role usage (lib/supabase/service.ts)

### Community 101 - "Lead Capture Docs"
Cohesion: 0.39
Nodes (9): EmailInputBlock (email + optional consent), Lead capture (feature page), Lead store (SupabaseLeadStore record_lead RPC / FileLeadStore), Studio Leads panel (GET /api/funnels/ID/leads), leads table, leadsToCsv CSV export with formula-injection guard, POST /api/leads route, resolveLeadTarget (+1 more)

### Community 102 - "Auth Access Docs"
Cohesion: 0.36
Nodes (8): Auth and access (feature page), Sign-in/sign-up rate limits (RateLimiter, failure slots), authenticate / signOut server actions, Login page and safe next redirect (safeNext), Projects and RLS (project_members, is_project_member), Proxy gate (isProtected, updateSession), Session cookies (SESSION_COOKIE_OPTIONS, @supabase/ssr), Supabase Auth

### Community 103 - "Definition Migrations"
Cohesion: 0.36
Nodes (8): clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition, retypeScreen(), textScreen(), toTextItem(), LEGACY_SCREEN_TYPES

### Community 104 - "Leads CSV Export"
Cohesion: 0.36
Nodes (6): Context, dynamic, GET(), csvCell(), HEADER, leadsToCsv()

### Community 105 - "Persistence Architecture Docs"
Cohesion: 0.32
Nodes (7): get_published_funnel RPC (anon public read), migrate(json) by schemaVersion, Optimistic concurrency (save_draft / publish_funnel RPCs, draftRevision), SupabaseFunnelRepository / SupabasePublishedReader, Versioning: draft, immutable versions, publish, rollback, withStudio / getStudioContext, Authoring flow: draft, publish, rollback

### Community 106 - "Custom Domain Architecture Docs"
Cohesion: 0.32
Nodes (8): Custom domains (Stage 6): verify, proxy.ts resolution, serve-check, lib/hostname.ts normalisation, C4 Level 2: Containers, Custom domains sequence (verify, serve-check, cron recheck), Caddy on-demand TLS for tenant domains, Alternative: Coolify API per domain, GET /api/domains/serve-check, Custom domains (TXT + CNAME, local testing)

### Community 107 - "ID & Slug Helpers"
Cohesion: 0.33
Nodes (5): slugFrom(), randomId(), newOptionId(), insertTracker, PendingPreset

### Community 108 - "Audit & Plan Docs"
Cohesion: 0.33
Nodes (6): Implementation Plan, Stage 0: Repository audit, Repository Audit (Stage 0), License table, Security, Threat model and trust boundaries

### Community 109 - "Next Config"
Cohesion: 0.33
Nodes (4): devOrigins, nextConfig, privateHeaders, securityHeaders

### Community 110 - "Payment Status Client"
Cohesion: 0.40
Nodes (5): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult

### Community 111 - "Screen Reference Cleanup"
Cohesion: 0.53
Nodes (5): cleanItem(), cleanItems(), isItem(), Item, stripScreenRefs()

### Community 112 - "Schema & Payments Plan Docs"
Cohesion: 0.40
Nodes (4): Button actions, @funnel/schema package (validateFunnel, migrate, nextScreen), PaymentStore (file and Supabase), Stage 4: Payments

### Community 113 - "Root Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, typecheck

### Community 114 - "Lead Submission Client"
Cohesion: 0.50
Nodes (4): LEADS_ROUTE, LeadSubmission, sendLead(), warn()

### Community 115 - "Analytics Architecture Docs"
Cohesion: 0.40
Nodes (5): Typed analytics events (Stage 5), Browser analytics (consent, buffering, posthog-js), Server analytics (posthog-node emitter), Analytics and consent (one owner per event), PostHog analytics with consent banner

## Knowledge Gaps
- **40 isolated node(s):** `graphify skill trigger (/graphify)`, `docs/features/90-mcp.md (MCP design and tool table)`, `Mock payment mode (PAYMENTS_MOCK)`, `PostHog analytics with consent banner`, `Docker image build and compose` (+35 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 744 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `API Route Helpers` to `Studio Overview & Docs`, `Custom Domain Management`, `Funnel Editor UI`, `Payment Registry & Status`, `Screen Canvas`, `AI Route Guards`, `AI Generation Runs`, `Studio Funnel List`, `Puck Element Config`, `Studio Panels & API Routes`, `Storage Mode & Supabase Env`, `Host & Origin Resolution`, `Mock Payments & Checkout Target`, `Login Auth Actions`, `Checkout UI Components`, `AI Model Registry`, `Image Assets`, `Brief Wizard Types`, `Inline AI Edit`, `Published Funnel Pages`, `Flow Elements`, `Lead Capture API`, `Checkout API & Run Token`, `Web Dev Dependencies`, `Web Runtime Dependencies`, `Proxy & CSP`, `Login Page`, `Leads CSV Export`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **What connects `graphify skill trigger (/graphify)`, `docs/features/90-mcp.md (MCP design and tool table)`, `Mock payment mode (PAYMENTS_MOCK)` to the rest of the system?**
  _40 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Route Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.0461357625624449 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Checkout UI Components` to `Studio Overview & Docs`, `Custom Domain Management`, `Funnel Editor UI`, `AI Assistant Panel`, `Screen Canvas`, `Analytics Events`, `Funnel Runtime State`, `Content Elements Rendering`, `Add Element Catalog`, `Element Style Tokens`, `Screen Editor Adapters`, `Studio Funnel List`, `Puck Element Config`, `Studio Panels & API Routes`, `Storage Mode & Supabase Env`, `Image Assets`, `Brief Wizard Types`, `Style Fields Editor`, `Runtime Input Elements`, `Layout Text Elements`, `Paywall Plan Picker`, `Draft Autosave & Validation`, `Flow Elements`, `Studio Shell`, `Element Inspector & Theme Defaults`, `Web Dev Dependencies`, `Web Runtime Dependencies`, `Color Controls`, `Button & Timer Elements`, `Element Frame Wrapper`, `Login Page`, `Versions & Preview Panels`, `Layers Panel`, `Theme Editor`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `Studio Overview & Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.05403508771929825 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `AI Provider Adapters` to `API Route Helpers`, `Studio Overview & Docs`, `Custom Domain Management`, `Funnel Repositories`, `Payment Registry & Status`, `Analytics Events`, `Payment Store`, `AI Route Guards`, `Lead Store`, `Stripe Provider & Plans`, `File Payment Store`, `Solidgate Provider`, `AI Generation Runs`, `Storage Mode & Supabase Env`, `Host & Origin Resolution`, `AI Chat Assistant`, `AI Model Registry`, `Runtime Gates & Element Schemas`, `Payment Provider Types`, `AI Brief Generation`, `Inline AI Edit`, `Lead Capture API`, `Checkout API & Run Token`, `Web Dev Dependencies`, `Web Runtime Dependencies`, `Rate Limiting & Instrumentation`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `Custom Domain Management` be split into smaller, more focused modules?**
  _Cohesion score 0.05268065268065268 - nodes in this community are weakly interconnected._