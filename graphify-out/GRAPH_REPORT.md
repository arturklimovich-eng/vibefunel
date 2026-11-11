# Graph Report - funnel-platform  (2026-11-11)

## Corpus Check
- 270 files · ~163,980 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 14, (none) 6, .example 1)

## Summary
- 2600 nodes · 6895 edges · 146 communities (120 shown, 26 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 141 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6ea5b022`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- API Route Helpers
- studio-overview.ts
- verify.ts
- Funnel Repositories
- Funnel Editor UI
- Core DB Schema Migrations
- AI Provider Adapters
- File Repository Internals
- Supabase Repository Internals
- webhook.ts
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
- leads/registry.ts
- Brief Compiler
- plans.ts
- Element Style Tokens
- File Payment Store
- Solidgate Provider
- AI Generation Runs
- switch-platform-domain.mjs
- Studio Funnel List
- Puck Element Config
- FunnelRepository Interface
- Studio Panels & API Routes
- AI Feature Docs
- repository.ts
- Host & Origin Resolution
- AI Chat Assistant
- confirm/route.ts
- Login Auth Actions
- Checkout UI Components
- AI Model Registry
- Image Assets
- isMissingServiceKey
- Brief Wizard Types
- Style Fields Editor
- payments/registry.ts
- Payment Feature Docs
- Edge Condition Picker
- Runtime Input Elements
- Layout Text Elements
- AI Brief Generation
- Web TS Config
- Inline AI Edit
- paywall.tsx
- Text Edits
- status/route.ts
- Draft Autosave & Validation
- Flow Elements
- DomainsPanel.tsx
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
- storage-mode.ts
- Overview aggregation (paid orders, revenue, opt-in)
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
- proxy.ts (Next 16 request proxy)
- InlineAi.tsx
- Stage Plan: Analytics & Domains
- Seed Funnels
- Login Page
- events.ts
- next
- Theme Editor
- Runtime Data Model Docs
- FunnelRepository / PublishedReader
- Draft Save & Rollback Docs
- Publish & RLS Docs
- Security Controls Docs
- Lead Capture Docs
- Auth Access Docs
- Definition Migrations
- Leads CSV Export
- Persistence Architecture Docs
- Custom Domain Architecture Docs
- run-storage.ts
- StudioDashboard.tsx
- Next Config
- Payment Status Client
- maintenance.ts
- docs.ts
- Root Scripts
- Lead Submission Client
- next-screen.ts
- docs/[slug]/page.tsx
- FileLeadStore
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
- createSupabaseServiceClient
- Review & Status Log
- Decisions to review (autonomous loop)
- pnpm Workspace
- Animation Presets Doc
- Published Funnel RPC Doc
- Platform Routes Doc
- CustomDomain
- Unverified items (checks to run)
- @anthropic-ai/sdk
- @stripe/stripe-js
- zod@4.6.7

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 88 edges
2. `next` - 66 edges
3. `react` - 60 edges
4. `FileFunnelRepository` - 53 edges
5. `withStudio()` - 52 edges
6. `server-only` - 49 edges
7. `SupabaseFunnelRepository` - 42 edges
8. `FunnelDefinition` - 42 edges
9. `Icon()` - 39 edges
10. `parse()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `Stripe payments (test mode, one-time only)` --semantically_similar_to--> `Payment flow (checkout, webhook, status polling)`  [INFERRED] [semantically similar]
  README.md → docs/ARCHITECTURE.md
- `RuntimeInner()` --indirect_call--> `pickerPlanKeys()`  [INFERRED]
  apps/web/src/components/FunnelRuntime.tsx → packages/funnel-schema/src/element-props.ts
- `InlineAi()` --indirect_call--> `screenTextFields()`  [INFERRED]
  apps/web/src/components/ai/InlineAi.tsx → packages/funnel-schema/src/text-edits.ts
- `DraftSaver` --references--> `FunnelDefinition`  [EXTRACTED]
  apps/web/src/lib/use-draft-saver.ts → packages/funnel-schema/src/schema.ts
- `Custom domains (TXT + CNAME, local testing)` --conceptually_related_to--> `Custom domains (Stage 6): verify, proxy.ts resolution, serve-check`  [INFERRED]
  README.md → docs/ARCHITECTURE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Custom domain verification and TLS serving** — docs_architecture_custom_domains, docs_architecture_proxy_ts, docs_deployment_serve_check, docs_deployment_caddy_on_demand_tls, docs_architecture_domainmaintenance, docs_architecture_hostname_normalise [EXTRACTED 1.00]
- **Draft, publish and rollback authoring flow** — docs_features_10_authoring_usedraftsaver, docs_features_10_authoring_save_draft_route, docs_security_save_draft_rpc, docs_features_10_authoring_publish_version, docs_security_publish_funnel_rpc, docs_features_10_authoring_rollback, docs_security_rollback_funnel_rpc, docs_features_10_authoring_funnel_versions [EXTRACTED 1.00]
- **MCP-readiness operations contract** — claude_patchop, claude_typed_errors, claude_thin_route_handlers, claude_portability, claude_agent_security, docs_architecture_funnel_schema [EXTRACTED 1.00]
- **Server-confirmed payment flow (checkout, payer nonce, webhook record, status poll)** — docs_architecture_checkoutpanel, docs_data_flow_payer_nonce, docs_data_flow_record_payment_event, docs_architecture_paymentprovider, docs_architecture_paymentstore, docs_architecture_nextscreen [EXTRACTED 1.00]
- **PaymentProvider implementations** — docs_implementation_plan_paymentprovider, docs_implementation_plan_stripeprovider, docs_implementation_plan_solidgateprovider, docs_implementation_plan_mockprovider [EXTRACTED 1.00]
- **Server-verified payment pipeline (webhook to access)** — docs_features_30_checkout_stripe_webhook, docs_features_30_checkout_record_payment_event_rpc, docs_features_30_checkout_payments_table, docs_features_30_checkout_payment_status_endpoint, docs_features_40_refunds_disputes_revocationof, docs_features_40_refunds_disputes_apply_payment_adjustment_row, docs_features_40_refunds_disputes_apply_deferred_adjustments [EXTRACTED 1.00]
- **Shared AI infrastructure (adapters, guards, element guide, screen builder)** — docs_features_81_ai_generation_textmodel, docs_features_81_ai_generation_openaisession_guards, docs_features_81_ai_generation_elements_guide, docs_features_81_ai_generation_buildscreen, docs_features_80_ai_assistant_api_ai_chat, docs_features_81_ai_generation_generatefunnel, docs_features_81_ai_generation_inline_ai_copy [EXTRACTED 1.00]
- **Server-confirmed payment security controls** — docs_security_payment_rules, docs_security_record_payment_event, docs_security_payer_binding, docs_security_payment_plans_catalogue, docs_security_rate_limiting [INFERRED 0.85]
- **One edit contract: PatchOp + applyPatch + validateFunnel for UI, assistant and MCP** — docs_features_90_mcp_patchop, docs_features_80_ai_assistant_applypatch, docs_features_81_ai_generation_validatefunnel, docs_features_80_ai_assistant_applyassistantpatch, docs_features_90_mcp_funnel_services, docs_features_90_mcp_validationissue [INFERRED 0.85]

## Communities (146 total, 26 thin omitted)

### Community 0 - "API Route Helpers"
Cohesion: 0.06
Nodes (48): bodySchema, dynamic, POST(), Context, DELETE(), dynamic, PATCH(), renameSchema (+40 more)

### Community 1 - "studio-overview.ts"
Cohesion: 0.14
Nodes (20): bucketIndex(), buildWindow(), DAY_FORMAT, FunnelMetrics, FunnelRow, isPaid(), loadFunnelMetrics(), loadStudioOverview() (+12 more)

### Community 2 - "verify.ts"
Cohesion: 0.15
Nodes (22): Context, dynamic, isDomainTaken(), POST(), DomainView, RoutingStatus, txtRecordName(), txtRecordValue() (+14 more)

### Community 3 - "Funnel Repositories"
Cohesion: 0.06
Nodes (39): BriefResult, domainFileSchema, groupFileSchema, versionSummarySchema, AiUsageRecord, AssetSource, DefinitionInvalidError, DomainCheck (+31 more)

### Community 4 - "Funnel Editor UI"
Cohesion: 0.08
Nodes (62): AnimationSettings(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight(), CloseIcon(), CopyIcon(), DotsIcon() (+54 more)

### Community 5 - "Core DB Schema Migrations"
Cohesion: 0.06
Nodes (50): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+42 more)

### Community 6 - "AI Provider Adapters"
Cohesion: 0.10
Nodes (31): DROPPED_KEYS, Json, strictJsonSchema(), walk(), createAnthropicModel(), FALLBACK_MODELS, mapError(), BLOCKED (+23 more)

### Community 7 - "File Repository Internals"
Cohesion: 0.15
Nodes (3): FileFunnelRepository, isRecord(), withRevision()

### Community 8 - "Supabase Repository Internals"
Cohesion: 0.13
Nodes (8): ForbiddenError, FunnelGroup, FunnelNotFoundError, GroupNotFoundError, fail(), SupabaseFunnelRepository, toFunnel(), toGroup()

### Community 9 - "webhook.ts"
Cohesion: 0.12
Nodes (16): dynamic, POST(), isSolidgateConfigured(), PaymentStore, isAdjustment(), PaymentProvider, emitAdjustment(), eventUuid() (+8 more)

### Community 10 - "AI Assistant Panel"
Cohesion: 0.09
Nodes (37): ERROR_TEXT, errorText(), AssistantPanel(), AssistantPanelProps, errorSchema, historyText(), isStale(), Message (+29 more)

### Community 11 - "Screen Canvas"
Cohesion: 0.11
Nodes (27): ProposalPreview, touchedScreens(), buttonEdges(), CanvasMode, ConnectionChrome(), EditOverlay(), Focus(), layoutColumns() (+19 more)

### Community 12 - "Payment DB Tables"
Cohesion: 0.10
Nodes (26): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+18 more)

### Community 13 - "Analytics Events"
Cohesion: 0.22
Nodes (18): isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent(), warn() (+10 more)

### Community 14 - "Payment Store"
Cohesion: 0.11
Nodes (23): AdjustmentResult, FunnelPayment, RecordRejection, RecordResult, StaleDeferred, StatusDetail, StatusQuery, accessRowSchema (+15 more)

### Community 15 - "Funnel Runtime State"
Cohesion: 0.16
Nodes (19): ConsentBanner(), contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS (+11 more)

### Community 16 - "Content Elements Rendering"
Cohesion: 0.12
Nodes (30): Badge(), badgeProps, Chart(), chartProps, Divider(), dividerProps, Faq(), faqProps (+22 more)

### Community 17 - "Root Tooling Config"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 18 - "AI Route Guards"
Cohesion: 0.12
Nodes (23): bodySchema, dynamic, POST(), dynamic, POST(), aiErrorResponse(), AiSessionResult, dailyBudgetMicroUsd() (+15 more)

### Community 19 - "Add Element Catalog"
Cohesion: 0.05
Nodes (51): AddElementPanel(), isAttached(), NO_PREVIEW, presetProps(), Preview(), useApplyPresets(), usePuck, describe() (+43 more)

### Community 20 - "Schema Animation Types"
Cohesion: 0.05
Nodes (39): ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, DEV_HTTP_HOSTS, FontFamily, fontFamilySchema (+31 more)

### Community 21 - "Funnel Validation"
Cohesion: 0.14
Nodes (20): ELEMENT_PROP_SCHEMAS, getOptionLists(), isFallbackEdge(), isPaymentScreen(), isQuiz(), IssueCode, IssueSeverity, OptionListInfo (+12 more)

### Community 22 - "leads/registry.ts"
Cohesion: 0.22
Nodes (8): fileSchema, LeadFile, recordSchema, globalForLeads, FunnelLead, LeadInput, LeadStore, leadRowSchema

### Community 23 - "Brief Compiler"
Cohesion: 0.10
Nodes (32): imageJobs(), AI_ELEMENT_TYPES, AiElement, aiElementSchema, AUTO_ADVANCING, BRIEF_GOALS, briefImageTargets, buildElements() (+24 more)

### Community 24 - "plans.ts"
Cohesion: 0.16
Nodes (14): Context, dynamic, POST(), publishSchema, dynamic, GET(), listPublicPlans(), loadPlans() (+6 more)

### Community 25 - "Element Style Tokens"
Cohesion: 0.09
Nodes (29): animationSchema, builtinTokens(), BUTTON_TYPES, cssUrl(), ElementAnimation, elementMetaSchema, elementStyleSchema, FONT_STACKS (+21 more)

### Community 26 - "File Payment Store"
Cohesion: 0.14
Nodes (16): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+8 more)

### Community 27 - "Solidgate Provider"
Cohesion: 0.10
Nodes (21): apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot, safeEqual() (+13 more)

### Community 28 - "AI Generation Runs"
Cohesion: 0.09
Nodes (31): bodySchema, dynamic, POST(), StreamEvent, bodySchema, dynamic, POST(), dynamic (+23 more)

### Community 29 - "switch-platform-domain.mjs"
Cohesion: 0.13
Nodes (14): APPLY, call(), COOLIFY_URL, coolifyHeaders, coolifyToken, local, plan(), ROOT (+6 more)

### Community 30 - "Studio Funnel List"
Cohesion: 0.15
Nodes (22): DeleteFunnelButton(), FolderIcon(), PenIcon(), NavLink(), PendingMark(), syncAttribute(), useMarkPending(), usePendingPush() (+14 more)

### Community 31 - "Puck Element Config"
Cohesion: 0.11
Nodes (25): allowedTypesFor(), checkoutBlockProps, configForScreenType(), Heading(), headingProps, ImageBlock(), imageProps, OptionListBlock() (+17 more)

### Community 33 - "Studio Panels & API Routes"
Cohesion: 0.08
Nodes (33): formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm(), slugify() (+25 more)

### Community 34 - "AI Feature Docs"
Cohesion: 0.15
Nodes (26): AI assistant (feature page), POST /api/ai/chat (runChat), applyAssistantPatch (saver.mutate), applyPatch (patch.ts, pure, server and browser), assistantAnswerSchema (flat ops, small card union), AssistantPanel chat panel (cards, proposal), Chat context (system prompt + cached draft snapshot prefix), loadFunnelMetrics (metrics card) (+18 more)

### Community 35 - "repository.ts"
Cohesion: 0.18
Nodes (18): dynamic, PreviewPage(), DocsIndexPage(), dynamic, dynamic, first(), StudioFunnelsPage(), dynamic (+10 more)

### Community 36 - "Host & Origin Resolution"
Cohesion: 0.16
Nodes (22): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, Context, dynamic (+14 more)

### Community 37 - "AI Chat Assistant"
Cohesion: 0.16
Nodes (21): allowedElement(), SCREEN_SYSTEM, ChatRequest, chatRequestSchema, ChatResult, check(), elementPrompt(), issueKey() (+13 more)

### Community 38 - "confirm/route.ts"
Cohesion: 0.21
Nodes (15): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, CheckoutTarget, resolveCheckoutTarget() (+7 more)

### Community 39 - "Login Auth Actions"
Cohesion: 0.17
Nodes (14): accountClientKey(), authenticate(), credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK, releaseSignInFailure() (+6 more)

### Community 40 - "Checkout UI Components"
Cohesion: 0.26
Nodes (12): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, CheckoutBlockView(), REF_KEY() (+4 more)

### Community 41 - "AI Model Registry"
Cohesion: 0.17
Nodes (21): dynamic, EditFunnelPage(), BUILTIN, ModelPrice, overrides(), priceFor(), priceSchema, aiChatEnabled() (+13 more)

### Community 42 - "Image Assets"
Cohesion: 0.11
Nodes (17): AssetError, assetSchema, errorSchema, IMAGE_ASPECTS, ImageAspect, ImageAssetsContext, ImageAssetsProvider(), ImageAssetsValue (+9 more)

### Community 43 - "isMissingServiceKey"
Cohesion: 0.19
Nodes (13): dynamic, NO_STORE, POST(), Summary, dynamic, NO_STORE, POST(), Context (+5 more)

### Community 44 - "Brief Wizard Types"
Cohesion: 0.10
Nodes (20): blocksOf(), BriefWizard(), CLOSING_KINDS, errorResponse, FIXED_KINDS, freeKey(), GOALS, KIND_LABELS (+12 more)

### Community 45 - "Style Fields Editor"
Cohesion: 0.11
Nodes (18): ALIGN_OPTIONS, DECORATION_OPTIONS, EFFECT_OPTIONS, POSITION_LABELS, POSITION_OPTIONS, SHADOW_OPTIONS, StyleFieldsProps, StyleKind (+10 more)

### Community 46 - "payments/registry.ts"
Cohesion: 0.13
Nodes (21): dynamic, GET(), dynamic, formSchema, POST(), dynamic, POST(), resolveStorageMode() (+13 more)

### Community 47 - "Payment Feature Docs"
Cohesion: 0.19
Nodes (21): Restore progress (loadUsableRun, payment re-check), Checkout (feature page), CheckoutPanel (POST /api/payments/checkout), confirmPayment / advance funnel, getPaymentProvider registry, MockProvider (dev payments), GET /api/payments/status (poll), payments / payment_events tables (+13 more)

### Community 48 - "Edge Condition Picker"
Cohesion: 0.17
Nodes (19): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+11 more)

### Community 49 - "Runtime Input Elements"
Cohesion: 0.13
Nodes (26): editorOnly(), Checkbox(), DatePicker(), EmailOAuth(), emailOAuthProps, EMOJI_SCALE, fieldCss(), inputComponents (+18 more)

### Community 50 - "Layout Text Elements"
Cohesion: 0.11
Nodes (21): carouselProps, columnsProps, popupProps, rowsProps, slot, Components, number(), radio() (+13 more)

### Community 51 - "AI Brief Generation"
Cohesion: 0.13
Nodes (17): briefPlans(), briefText(), ELEMENTS_GUIDE, generateFunnel(), generateOutline(), ImageJob, outlineText(), pool() (+9 more)

### Community 52 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 53 - "Inline AI Edit"
Cohesion: 0.14
Nodes (15): dynamic, POST(), answerSchema, INLINE_ACTIONS, InlineAction, InlineRequest, inlineRequestSchema, InlineVariant (+7 more)

### Community 54 - "paywall.tsx"
Cohesion: 0.10
Nodes (28): blockId(), PuckItem, BillingPlanPicker(), pickerDefaults, pickerFields, planItemsField, planKeyField, PlanPicker() (+20 more)

### Community 55 - "Text Edits"
Cohesion: 0.17
Nodes (17): ID_PATTERN, MAX_TITLE_LENGTH, applyPropsTextEdits(), collect(), editable(), elementTextFields(), flatten(), HEADER_ELEMENT_ID (+9 more)

### Community 56 - "status/route.ts"
Cohesion: 0.12
Nodes (28): bodySchema, dynamic, POST(), rateLimited(), dynamic, GET(), NO_STORE, querySchema (+20 more)

### Community 57 - "Draft Autosave & Validation"
Cohesion: 0.21
Nodes (12): ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure(), draftResponseSchema, DraftSaver, issueSchema (+4 more)

### Community 58 - "Flow Elements"
Cohesion: 0.17
Nodes (15): autoNext, cookieProps, customerProps, flowComponents, Loader(), loaderProps, Processing(), processingProps (+7 more)

### Community 59 - "DomainsPanel.tsx"
Cohesion: 0.18
Nodes (16): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+8 more)

### Community 60 - "Studio Shell"
Cohesion: 0.27
Nodes (12): confirmStopGeneration(), BookIcon(), FlowIcon(), HomeIcon(), LogoutIcon(), PlusIcon(), SparkIcon(), NavOverlay() (+4 more)

### Community 61 - "Element Inspector & Theme Defaults"
Cohesion: 0.13
Nodes (14): ANIMATION_OPTIONS, EFFECT_TYPES, InspectedElement, Tab, VISIBILITY_OPTIONS, Group, KIND, BUILTIN_SCREEN (+6 more)

### Community 62 - "Screen Style Controls"
Cohesion: 0.26
Nodes (16): ElementInspector(), NumberInput(), NumberRow(), Row(), Section(), SelectRow(), SpacingRow(), Key (+8 more)

### Community 63 - "Lead Capture API"
Cohesion: 0.22
Nodes (10): emailBlocks(), EMAIL_BLOCK_TYPES, EmailBlock, emailBlocksOf(), EmailInputProps, emailKey(), isValidEmail(), EmailInputBlock() (+2 more)

### Community 64 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 65 - "Implementation Stages"
Cohesion: 0.22
Nodes (9): FileFunnelRepository, Stage 0: Repository audit, Stage 1: Minimal vertical slice, Stage 2: Components and logic, Stage 3: Database and publishing, SupabaseFunnelRepository, motion, supabase (+1 more)

### Community 66 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 67 - "Checkout API & Run Token"
Cohesion: 0.14
Nodes (21): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+13 more)

### Community 68 - "Patch Application"
Cohesion: 0.16
Nodes (15): applyOne(), funnelPatchSchema, isAttached(), mainTarget(), MAX_PATCH_OPS, PatchOp, patchOpSchema, screenId (+7 more)

### Community 69 - "Screen Templates"
Cohesion: 0.25
Nodes (16): slugFrom(), randomId(), newOptionId(), attached(), checkoutBlock(), createQuizContent(), createScreenContent(), heading() (+8 more)

### Community 70 - "Web Dev Dependencies"
Cohesion: 0.21
Nodes (12): devDependencies, @types/node@22.19.1, @types/react@19.3.0, @types/react-dom@19.3.0, typescript@5.9.3, typescript, name, private (+4 more)

### Community 71 - "Web Runtime Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, @funnel/schema@workspace:*, @google/genai@2.30.0, next@16.4.3, openai@7.41.0, @puckeditor/core@0.23.0, react@19.3.1, server-only@0.0.1 (+4 more)

### Community 72 - "Rate Limiting & Instrumentation"
Cohesion: 0.23
Nodes (10): AuthKeys, register(), requireAppUrlInProduction(), Bucket, clientIpHeader(), clientKeyFromHeaders(), defaultLimiter, DIRECT_KEY (+2 more)

### Community 73 - "Color Controls"
Cohesion: 0.21
Nodes (15): ColorInput(), Props, channel(), ColorRow(), hexOf(), hslToRgb(), ImageRow(), joinColor() (+7 more)

### Community 74 - "Button & Timer Elements"
Cohesion: 0.15
Nodes (14): ACTION_LABELS, BUTTON_ACTIONS, buttonComponents, buttonProps, ButtonView(), TargetField(), usePuck, formatCountdown() (+6 more)

### Community 75 - "storage-mode.ts"
Cohesion: 0.14
Nodes (21): signOut(), readSupabaseEnv(), requireSupabaseEnv(), SupabaseEnv, SESSION_COOKIE_OPTIONS, SessionResult, updateSession(), withSessionCookies() (+13 more)

### Community 76 - "Overview aggregation (paid orders, revenue, opt-in)"
Cohesion: 0.25
Nodes (8): Overview aggregation (paid orders, revenue, opt-in), Create a funnel (NewFunnelForm, POST /api/funnels), funnel_groups (Projects folders), Move a funnel (PATCH /api/funnels/ID), StudioDashboard, StudioFunnels (funnel list), StudioShell, record_payment_adjustment and payment_orphans

### Community 77 - "Runtime Feature Docs"
Cohesion: 0.16
Nodes (20): FunnelRuntime client component, get_published_funnel / get_published_funnel_by_host RPCs, nextScreen edge/condition routing, Per-request nonce CSP (csp.ts), parseStoredDefinition, proxy.ts host routing (route, customHost), Public runtime (feature page), Run id and run state in sessionStorage (getOrCreateRunId, saveRun) (+12 more)

### Community 78 - "Element Frame Wrapper"
Cohesion: 0.35
Nodes (10): Frame(), framed(), FramedBlock(), SLOT_CLASS, useFunnelTheme(), containerStyle(), isItemShown(), readElementMeta() (+2 more)

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
Cohesion: 0.40
Nodes (4): MockProvider (PAYMENTS_MOCK), PaymentProvider interface, StripeProvider, react-stripe-js

### Community 85 - "Project Docs Index"
Cohesion: 0.18
Nodes (15): graphify skill trigger (/graphify), Architecture document, C4 model document, Import-graph edges table, C4 Level 1: System context, C4 Level 3: Web app components, Data flow document, Deployment document (+7 more)

### Community 86 - "Asset Storage"
Cohesion: 0.27
Nodes (3): isNotFound(), Asset, NewAsset

### Community 87 - "MCP-Readiness Contract"
Cohesion: 0.27
Nodes (7): docs/features/90-mcp.md (MCP design and tool table), PatchOp / applyPatch, packages/funnel-schema (@funnel/schema), Puck content and ScreenEditor, validateFunnel (graph validation), Runtime UI (FunnelRuntime), Studio UI (FunnelEditor, use-draft-saver)

### Community 88 - "proxy.ts (Next 16 request proxy)"
Cohesion: 0.40
Nodes (5): proxy.ts (Next 16 request proxy), RateLimiter (server/rate-limit.ts), Authentication flow (rate limits, Supabase Auth, session cookies), Public runtime flow, Coolify deployment runbook

### Community 89 - "InlineAi.tsx"
Cohesion: 0.14
Nodes (15): Action, ACTIONS, chunk(), errorSchema, InlineAi(), LANGUAGES, Outcome, Proposal (+7 more)

### Community 90 - "Stage Plan: Analytics & Domains"
Cohesion: 0.29
Nodes (6): Dockerfile and Coolify deployment, Stage 4: Payments, Stage 5: Analytics and publishing operations, coolify, posthog, Operational security

### Community 91 - "Seed Funnels"
Cohesion: 0.40
Nodes (9): button(), createSeedFunnel(), createStarterFunnel(), heading(), options(), paragraph(), puck(), PuckItem (+1 more)

### Community 92 - "Login Page"
Cohesion: 0.33
Nodes (6): AuthFormState, initialState, LoginForm(), dynamic, firstValue(), LoginPage()

### Community 93 - "events.ts"
Cohesion: 0.15
Nodes (13): AnalyticsEmitter, AnalyticsEvent, AnalyticsEventName, AnalyticsProperties, AnalyticsPropertyValue, AnalyticsSource, EmitOptions, PropertyOptions (+5 more)

### Community 94 - "next"
Cohesion: 0.13
Nodes (4): dynamic, metadata, viewport, next

### Community 95 - "Theme Editor"
Cohesion: 0.24
Nodes (9): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE (+1 more)

### Community 96 - "Runtime Data Model Docs"
Cohesion: 0.25
Nodes (5): Data model (Funnel, FunnelVersion, FunnelDefinition, Screen, Edge, Lead), Lead capture (EmailInput, POST /api/leads), nextScreen evaluator, Button skip action (fallbackOnly), Leads flow (record_lead RPC)

### Community 97 - "FunnelRepository / PublishedReader"
Cohesion: 0.24
Nodes (10): Typed analytics events (Stage 5), FileFunnelRepository, FunnelRepository / PublishedReader, Browser analytics (consent, buffering, posthog-js), Domains core (server/domains), Payments core (server/payments), Server analytics (posthog-node emitter), Supabase clients (server, anon, service) (+2 more)

### Community 98 - "Draft Save & Rollback Docs"
Cohesion: 0.25
Nodes (6): checkDefinition (validate definition), PUT /api/funnels/[id]/draft, useDraftSaver autosave, Button actions, @funnel/schema package (validateFunnel, migrate, nextScreen), save_draft RPC

### Community 99 - "Publish & RLS Docs"
Cohesion: 0.20
Nodes (9): funnel_versions (immutable versions), Publish version (POST /publish), Rollback (POST /rollback), Plan pickers (values.plan, resolveCheckoutTarget), funnels_guard_write trigger (app.rpc), PAYMENT_PLANS_JSON plan catalogue, publish_funnel RPC, RLS policies (projects, members, funnels, versions) (+1 more)

### Community 100 - "Security Controls Docs"
Cohesion: 0.17
Nodes (11): Continue gates (screenGate), Frame wrapper (framed), Loaders (auto-advance), OAuth buttons (not connected), Theme and style overrides, Studio overview, loadStudioOverview (per-funnel data), PaymentStore (file and Supabase) (+3 more)

### Community 101 - "Lead Capture Docs"
Cohesion: 0.22
Nodes (15): Feature map, How a funnel lives, Studio authoring, FunnelEditor (edit graph), Screen types (schema v3), Screen elements, EmailInputBlock (email + optional consent), Lead capture (feature page) (+7 more)

### Community 102 - "Auth Access Docs"
Cohesion: 0.36
Nodes (8): Auth and access (feature page), Sign-in/sign-up rate limits (RateLimiter, failure slots), authenticate / signOut server actions, Login page and safe next redirect (safeNext), Projects and RLS (project_members, is_project_member), Proxy gate (isProtected, updateSession), Session cookies (SESSION_COOKIE_OPTIONS, @supabase/ssr), Supabase Auth

### Community 103 - "Definition Migrations"
Cohesion: 0.20
Nodes (13): DefinitionCheck, isOlderDefinition(), parseInput(), clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition, retypeScreen() (+5 more)

### Community 104 - "Leads CSV Export"
Cohesion: 0.33
Nodes (7): Context, dynamic, GET(), csvCell(), HEADER, leadsToCsv(), getLeadStore()

### Community 105 - "Persistence Architecture Docs"
Cohesion: 0.23
Nodes (10): get_published_funnel RPC (anon public read), migrate(json) by schemaVersion, Optimistic concurrency (save_draft / publish_funnel RPCs, draftRevision), Storage, auth and public read path (Stage 3), SupabaseFunnelRepository / SupabasePublishedReader, Versioning: draft, immutable versions, publish, rollback, withStudio / getStudioContext, Authoring flow: draft, publish, rollback (+2 more)

### Community 106 - "Custom Domain Architecture Docs"
Cohesion: 0.20
Nodes (12): Custom domains (Stage 6): verify, proxy.ts resolution, serve-check, DomainMaintenance (cron re-verification), lib/hostname.ts normalisation, C4 Level 2: Containers, Custom domains sequence (verify, serve-check, cron recheck), record_payment_event RPC (idempotent webhooks), Refunds and disputes (record_payment_adjustment, payment_orphans, revocationOf), Caddy on-demand TLS for tenant domains (+4 more)

### Community 107 - "run-storage.ts"
Cohesion: 0.25
Nodes (13): loadUsableRun(), MAX_RUN_HISTORY, adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN (+5 more)

### Community 108 - "StudioDashboard.tsx"
Cohesion: 0.25
Nodes (13): compress(), formatMoney(), formatPercent(), greetingFor(), KpiCard(), PerformanceChart(), PREVIOUS_LABEL, RANGE_LABEL (+5 more)

### Community 109 - "Next Config"
Cohesion: 0.33
Nodes (4): devOrigins, nextConfig, privateHeaders, securityHeaders

### Community 110 - "Payment Status Client"
Cohesion: 0.40
Nodes (5): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult

### Community 111 - "maintenance.ts"
Cohesion: 0.19
Nodes (8): domainStatusSchema, resultSchema, rowSchema, SupabaseDomainMaintenance, toDomain(), DomainMaintenance, RecheckOutcome, RecheckResult

### Community 112 - "docs.ts"
Cohesion: 0.23
Nodes (8): DocEntry, DocGroup, listDocs(), listFeatures(), loadDoc(), readOptional(), REFERENCE, RenderedDoc

### Community 113 - "Root Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, typecheck

### Community 114 - "Lead Submission Client"
Cohesion: 0.50
Nodes (4): LEADS_ROUTE, LeadSubmission, sendLead(), warn()

### Community 115 - "next-screen.ts"
Cohesion: 0.29
Nodes (10): useEditorData(), ActionField(), DestinationField(), matches(), nextScreen(), NextScreenOptions, own(), Condition (+2 more)

### Community 116 - "docs/[slug]/page.tsx"
Cohesion: 0.31
Nodes (5): DocsSearch(), DocPage(), dynamic, SearchIcon(), MermaidDiagrams()

### Community 131 - "createSupabaseServiceClient"
Cohesion: 0.32
Nodes (3): createSupabaseServiceClient(), MissingServiceKeyError, SupabaseLeadStore

### Community 135 - "Decisions to review (autonomous loop)"
Cohesion: 0.29
Nodes (6): Background jobs (cron domains, cron payments), Domain re-verification cron (POST /api/cron/domains), Stage 6: Custom domains, Custom domains security (TXT challenge, serve-check), In-memory rate limiting (TRUST_PROXY_HOPS), Response headers and nonce CSP

### Community 141 - "CustomDomain"
Cohesion: 0.48
Nodes (3): CustomDomain, DomainTakenError, toDomain()

### Community 142 - "Unverified items (checks to run)"
Cohesion: 0.33
Nodes (7): Add Element panel, Element catalog (CATALOG, PRESETS), Solidgate open questions, SolidgateProvider, puck (@puckeditor/core), react-sdk (Solidgate), Unverified items (checks to run)

## Knowledge Gaps
- **40 isolated node(s):** `Loaders (auto-advance)`, `OAuth buttons (not connected)`, `Theme and style overrides`, `lib/hostname.ts normalisation`, `Alternative: Coolify API per domain` (+35 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 744 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `API Route Helpers`, `verify.ts`, `Funnel Editor UI`, `webhook.ts`, `AI Assistant Panel`, `AI Route Guards`, `plans.ts`, `AI Generation Runs`, `Studio Funnel List`, `Puck Element Config`, `Studio Panels & API Routes`, `repository.ts`, `Host & Origin Resolution`, `Login Auth Actions`, `AI Model Registry`, `Image Assets`, `isMissingServiceKey`, `Brief Wizard Types`, `payments/registry.ts`, `Inline AI Edit`, `status/route.ts`, `Flow Elements`, `Checkout API & Run Token`, `Web Dev Dependencies`, `Web Runtime Dependencies`, `storage-mode.ts`, `Login Page`, `Leads CSV Export`, `docs/[slug]/page.tsx`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **What connects `Loaders (auto-advance)`, `OAuth buttons (not connected)`, `Theme and style overrides` to the rest of the system?**
  _40 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Route Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.06271186440677966 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Layout Text Elements` to `Funnel Editor UI`, `AI Assistant Panel`, `Screen Canvas`, `Analytics Events`, `Funnel Runtime State`, `Content Elements Rendering`, `Add Element Catalog`, `Element Style Tokens`, `Studio Funnel List`, `Puck Element Config`, `Studio Panels & API Routes`, `repository.ts`, `Checkout UI Components`, `Image Assets`, `Brief Wizard Types`, `Style Fields Editor`, `Runtime Input Elements`, `paywall.tsx`, `Draft Autosave & Validation`, `Flow Elements`, `DomainsPanel.tsx`, `Studio Shell`, `Element Inspector & Theme Defaults`, `Lead Capture API`, `Web Dev Dependencies`, `Web Runtime Dependencies`, `Color Controls`, `Button & Timer Elements`, `Element Frame Wrapper`, `InlineAi.tsx`, `Login Page`, `next`, `Theme Editor`, `StudioDashboard.tsx`, `docs/[slug]/page.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `studio-overview.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13852813852813853 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `AI Generation Runs` to `API Route Helpers`, `studio-overview.ts`, `verify.ts`, `Funnel Repositories`, `AI Provider Adapters`, `webhook.ts`, `Payment Store`, `AI Route Guards`, `leads/registry.ts`, `plans.ts`, `File Payment Store`, `Solidgate Provider`, `repository.ts`, `Host & Origin Resolution`, `AI Chat Assistant`, `confirm/route.ts`, `AI Model Registry`, `isMissingServiceKey`, `payments/registry.ts`, `AI Brief Generation`, `Inline AI Edit`, `Lead Capture API`, `Checkout API & Run Token`, `Web Dev Dependencies`, `Web Runtime Dependencies`, `Rate Limiting & Instrumentation`, `storage-mode.ts`, `events.ts`, `maintenance.ts`, `docs.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `Funnel Repositories` be split into smaller, more focused modules?**
  _Cohesion score 0.061367621274108705 - nodes in this community are weakly interconnected._