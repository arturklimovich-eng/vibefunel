# Graph Report - funnel-platform  (2026-11-05)

## Corpus Check
- 268 files · ~160,435 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 14, (none) 6, .example 1)

## Summary
- 2557 nodes · 6983 edges · 133 communities (107 shown, 26 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 445 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `615085fe`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ImageAssets.tsx
- web/package.json
- use-funnel-analytics.ts
- Root Tooling and Lint
- webhook.ts
- DomainsPanel.tsx
- File Funnel Repository
- config.tsx
- switch-platform-domain.mjs
- rate-limit.ts
- FunnelEditor.tsx
- catalog.tsx
- Core DB Schema Migrations
- next
- ScreenCanvas.tsx
- Funnel Schema and Theme
- switch-platform-domain.mjs
- validate.ts
- Supabase Funnel Repository
- payments/types.ts
- StudioShell.tsx
- Payments DB Migrations
- stripe-provider.ts
- Web TS Config
- inline.ts
- use-draft-saver.ts
- templates.ts
- elements/layout.tsx
- content.tsx
- ScreenStyles.tsx
- Docker Compose
- Schema Package Manifest
- StudioFunnels.tsx
- paywall.tsx
- Funnel Repository Interface
- react
- [id]/leads/route.ts
- Steps
- styles.ts
- supabase-funnel-repository.ts
- BriefWizard.tsx
- Schema TS Config
- README
- repository.ts
- guards.ts
- runtime-context.tsx
- ai/brief.ts
- StyleFields.tsx
- flow.tsx
- catalog.tsx
- server-only
- payments/registry.ts
- public.domains
- migrate.ts
- inputs.tsx
- solidgate-provider.ts
- ConditionPicker.tsx
- src/brief.ts
- getPaymentStore
- ParamControls.tsx
- Next.js Agent Notes
- ThemeDefaults.tsx
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- button.tsx
- src/proxy.ts
- Repository Audit (Stage 0)
- CheckoutPanel.tsx
- public.payment_orphans
- FunnelRuntime.tsx
- chat.ts
- index.ts
- AssistantPanel.tsx
- status/route.ts
- index.ts
- ref_zod
- text-edits.ts
- checkout/route.ts
- Implementation Plan
- login/page.tsx
- frame.tsx
- studio-overview.ts
- FunnelRuntime
- validateFunnel
- migrate
- Data flow
- Studio authoring
- public.leads
- Asset
- actions.ts
- Auth and access
- guards.ts
- seed.ts
- ThemeEditor.tsx
- Deployment
- app/layout.tsx
- Architecture
- VersionsPanel.tsx
- Feature map
- Custom domains
- react
- dependencies
- Lead capture
- supabase-payment-store.ts
- Studio overview
- payment-status.ts
- Checkout
- public.funnel_groups
- Refunds and disputes
- @anthropic-ai/sdk
- layout.ts
- stripe
- scripts
- @funnel/schema@workspace:*
- AI assistant
- public.ai_usage
- lottie-web
- marked
- mermaid
- posthog-js
- @xyflow/react
- posthog-node
- react-dom
- motion
- sharp
- zod@4.6.7

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 91 edges
2. `next` - 66 edges
3. `withStudio()` - 59 edges
4. `react` - 58 edges
5. `FileFunnelRepository` - 56 edges
6. `server-only` - 49 edges
7. `SupabaseFunnelRepository` - 45 edges
8. `FunnelDefinition` - 43 edges
9. `Icon()` - 39 edges
10. `parse()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `Stage 5: Analytics and publishing operations` --references--> `ConsentBanner()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → apps/web/src/components/ConsentBanner.tsx
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Step: Frame` --references--> `FunnelRuntime()`  [INFERRED]
  docs/features/12-elements.md → apps/web/src/components/FunnelRuntime.tsx
- `Step: Render the funnel list` --references--> `StudioFunnels()`  [INFERRED]
  docs/features/15-studio-overview.md → apps/web/src/components/StudioFunnels.tsx
- `Step: Autosave draft` --references--> `useDraftSaver()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/lib/use-draft-saver.ts

## Import Cycles
- None detected.

## Communities (133 total, 26 thin omitted)

### Community 0 - "ImageAssets.tsx"
Cohesion: 0.11
Nodes (18): AssetError, assetSchema, errorSchema, IMAGE_ASPECTS, ImageAspect, ImageAssetsContext, ImageAssetsValue, LibraryAsset (+10 more)

### Community 1 - "web/package.json"
Cohesion: 0.21
Nodes (12): devDependencies, @types/node@22.19.1, @types/react@19.3.0, @types/react-dom@19.3.0, typescript@5.9.3, typescript, name, private (+4 more)

### Community 2 - "use-funnel-analytics.ts"
Cohesion: 0.06
Nodes (54): ConsentBanner(), isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent() (+46 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "webhook.ts"
Cohesion: 0.08
Nodes (25): PaymentStore, isAdjustment(), emitAdjustment(), eventUuid(), isNamed(), processAdjustment(), processWebhook(), recordVerifiedEvent() (+17 more)

### Community 5 - "DomainsPanel.tsx"
Cohesion: 0.05
Nodes (68): dynamic, NO_STORE, POST(), Summary, askSecretMatches(), dynamic, GET(), NO_STORE (+60 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.15
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "config.tsx"
Cohesion: 0.13
Nodes (21): checkoutBlockProps, Heading(), headingProps, ImageBlock(), imageProps, OptionListBlock(), OptionPopup(), Paragraph() (+13 more)

### Community 8 - "switch-platform-domain.mjs"
Cohesion: 0.16
Nodes (12): FileLeadStore, fileSchema, isNotFound(), LeadFile, recordSchema, globalForLeads, FunnelLead, LeadInput (+4 more)

### Community 9 - "rate-limit.ts"
Cohesion: 0.24
Nodes (9): register(), requireAppUrlInProduction(), trustedHops(), C4 model, Component responsibilities, Import-graph edges (value imports, grouped), Level 1: System context, Level 2: Containers (+1 more)

### Community 10 - "FunnelEditor.tsx"
Cohesion: 0.08
Nodes (62): ImageAssetsProvider(), AnimationSettings(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight(), CopyIcon(), DotsIcon() (+54 more)

### Community 11 - "catalog.tsx"
Cohesion: 0.20
Nodes (15): AddElementPanel(), isAttached(), NO_PREVIEW, presetProps(), Preview(), useApplyPresets(), usePuck, CATEGORIES (+7 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.15
Nodes (23): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+15 more)

### Community 13 - "next"
Cohesion: 0.05
Nodes (54): bodySchema, dynamic, POST(), Context, DELETE(), dynamic, PATCH(), renameSchema (+46 more)

### Community 14 - "ScreenCanvas.tsx"
Cohesion: 0.10
Nodes (36): AssistantPanelProps, Proposal, CardContext, KIND_TYPE, ProposalView, CanvasMode, EditOverlay(), Focus() (+28 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (37): ANIMATION_PRESETS, AnimationPreset, animationPresetSchema, animationSchema, conditionSchema, DEV_HTTP_HOSTS, edgeSchema, funnelSchema (+29 more)

### Community 16 - "switch-platform-domain.mjs"
Cohesion: 0.13
Nodes (15): Step: Chat panel, APPLY, call(), COOLIFY_URL, coolifyHeaders, coolifyToken, local, plan() (+7 more)

### Community 17 - "validate.ts"
Cohesion: 0.10
Nodes (26): ActionField(), BriefResult, Step: Screen routing, matches(), nextScreen(), NextScreenOptions, own(), Condition (+18 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.11
Nodes (10): ForbiddenError, FunnelGroup, FunnelNotFoundError, GroupNotFoundError, RevisionConflictError, fail(), SupabaseFunnelRepository, toDomain() (+2 more)

### Community 19 - "payments/types.ts"
Cohesion: 0.07
Nodes (35): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+27 more)

### Community 20 - "StudioShell.tsx"
Cohesion: 0.10
Nodes (30): blocksOf(), BriefWizard(), confirmStopGeneration(), freeKey(), BookIcon(), HomeIcon(), LogoMark(), LogoutIcon() (+22 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.12
Nodes (18): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+10 more)

### Community 22 - "stripe-provider.ts"
Cohesion: 0.11
Nodes (30): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), dynamic, escapeHtml(), GET() (+22 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "inline.ts"
Cohesion: 0.11
Nodes (23): bodySchema, dynamic, POST(), dynamic, POST(), dynamic, POST(), aiErrorResponse() (+15 more)

### Community 25 - "use-draft-saver.ts"
Cohesion: 0.12
Nodes (18): Device, PreviewPane(), IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS (+10 more)

### Community 26 - "templates.ts"
Cohesion: 0.36
Nodes (13): attached(), checkoutBlock(), createQuizContent(), createScreenContent(), heading(), nextButton(), optionList(), paragraph() (+5 more)

### Community 27 - "elements/layout.tsx"
Cohesion: 0.10
Nodes (23): allowedTypesFor(), configForScreenType(), carouselProps, columnsProps, layoutComponents, popupProps, rowsProps, slot (+15 more)

### Community 28 - "content.tsx"
Cohesion: 0.12
Nodes (29): Badge(), badgeProps, Chart(), chartProps, contentComponents, Divider(), dividerProps, Faq() (+21 more)

### Community 29 - "ScreenStyles.tsx"
Cohesion: 0.22
Nodes (18): ImageRow(), Label(), NumberInput(), NumberRow(), Row(), Section(), Segmented(), SelectRow() (+10 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "StudioFunnels.tsx"
Cohesion: 0.16
Nodes (24): DeleteFunnelButton(), FlowIcon(), FolderIcon(), PenIcon(), PlusIcon(), NavLink(), PendingMark(), syncAttribute() (+16 more)

### Community 33 - "paywall.tsx"
Cohesion: 0.11
Nodes (27): blockId(), checkboxProps, datePickerProps, defaultPickerPlan(), PLAN_PICKER_TYPES, PlanItem, planPickerProps, ratingProps (+19 more)

### Community 35 - "react"
Cohesion: 0.14
Nodes (21): formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm(), slugify() (+13 more)

### Community 36 - "[id]/leads/route.ts"
Cohesion: 0.21
Nodes (12): Context, dynamic, GET(), csvCell(), HEADER, leadsToCsv(), getLeadStore(), Step: Export CSV (+4 more)

### Community 37 - "Steps"
Cohesion: 0.20
Nodes (10): Flow, Screen elements, Step: Add Element panel, Step: Authentication, Step: Button actions, Step: Frame, Step: Loaders, Step: Plan pickers (+2 more)

### Community 38 - "styles.ts"
Cohesion: 0.07
Nodes (34): ANIMATION_OPTIONS, EFFECT_TYPES, InspectedElement, Tab, VISIBILITY_OPTIONS, animationSchema, BUTTON_TYPES, ELEMENT_ANIMATIONS (+26 more)

### Community 39 - "supabase-funnel-repository.ts"
Cohesion: 0.07
Nodes (32): domainStatusSchema, domainFileSchema, groupFileSchema, versionSummarySchema, AiUsageRecord, AssetSource, DefinitionInvalidError, DomainCheck (+24 more)

### Community 41 - "BriefWizard.tsx"
Cohesion: 0.10
Nodes (19): CLOSING_KINDS, errorResponse, FIXED_KINDS, GOALS, KIND_LABELS, LOCKED_KINDS, outlineResponse, Plan (+11 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "repository.ts"
Cohesion: 0.09
Nodes (19): devOrigins, nextConfig, privateHeaders, securityHeaders, dynamic, GET(), resultSchema, rowSchema (+11 more)

### Community 45 - "guards.ts"
Cohesion: 0.17
Nodes (21): dynamic, EditFunnelPage(), BUILTIN, ModelPrice, overrides(), priceFor(), priceSchema, aiChatEnabled() (+13 more)

### Community 46 - "runtime-context.tsx"
Cohesion: 0.29
Nodes (10): EMAIL_BLOCK_TYPES, EmailBlock, emailBlocksOf(), EmailInputProps, emailKey(), isValidEmail(), EmailInputBlock(), LeadTarget (+2 more)

### Community 47 - "ai/brief.ts"
Cohesion: 0.13
Nodes (21): allowedElement(), BriefEvent, briefPlans(), briefText(), ELEMENTS_GUIDE, generateFunnel(), generateOutline(), MakeImage (+13 more)

### Community 48 - "StyleFields.tsx"
Cohesion: 0.11
Nodes (18): ALIGN_OPTIONS, DECORATION_OPTIONS, EFFECT_OPTIONS, POSITION_LABELS, POSITION_OPTIONS, SHADOW_OPTIONS, StyleFieldsProps, StyleKind (+10 more)

### Community 49 - "flow.tsx"
Cohesion: 0.17
Nodes (15): autoNext, cookieProps, customerProps, flowComponents, Loader(), loaderProps, Processing(), processingProps (+7 more)

### Community 50 - "catalog.tsx"
Cohesion: 0.14
Nodes (11): ASK, Base, CATALOG, ENTRY, LOAD, PAY, PRESETS_BY_ID, pulse (+3 more)

### Community 51 - "server-only"
Cohesion: 0.13
Nodes (21): bodySchema, dynamic, POST(), StreamEvent, bodySchema, dynamic, POST(), dynamic (+13 more)

### Community 52 - "payments/registry.ts"
Cohesion: 0.08
Nodes (28): dynamic, POST(), isMockEnabled(), MockProvider, getPaymentProvider(), getStripeProvider(), globalForPayments, PAYER_HASH_PATTERN (+20 more)

### Community 53 - "public.domains"
Cohesion: 0.21
Nodes (11): domains_funnel_id_idx, domains_guard, domains_project_id_idx, domains_verified_hostname_idx, public.domains, public.domains_guard(), public.get_published_funnel_by_host(), public.is_host_servable() (+3 more)

### Community 54 - "migrate.ts"
Cohesion: 0.21
Nodes (12): DefinitionCheck, isOlderDefinition(), parseInput(), clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition, retypeScreen() (+4 more)

### Community 55 - "inputs.tsx"
Cohesion: 0.13
Nodes (27): sliderProps, editorOnly(), CookieConsent(), Checkbox(), DatePicker(), EmailOAuth(), emailOAuthProps, EMOJI_SCALE (+19 more)

### Community 56 - "solidgate-provider.ts"
Cohesion: 0.14
Nodes (17): apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot, safeEqual() (+9 more)

### Community 57 - "ConditionPicker.tsx"
Cohesion: 0.20
Nodes (16): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+8 more)

### Community 58 - "src/brief.ts"
Cohesion: 0.08
Nodes (40): imageJobs(), AI generation, Flow, Step: Brief wizard, Step: Generation, Step: Outline, Step: Providers, Steps (+32 more)

### Community 59 - "getPaymentStore"
Cohesion: 0.19
Nodes (17): dynamic, NO_STORE, POST(), Context, dynamic, GET(), POST(), dynamic (+9 more)

### Community 60 - "ParamControls.tsx"
Cohesion: 0.26
Nodes (11): ColorInput(), Props, channel(), ColorRow(), hexOf(), hslToRgb(), joinColor(), NumberInputProps (+3 more)

### Community 64 - "ThemeDefaults.tsx"
Cohesion: 0.23
Nodes (11): cleanObject(), Group, KIND, ThemeDefaults(), BUILTIN_SCREEN, builtinTokens(), readStyleRecord(), safe() (+3 more)

### Community 68 - "button.tsx"
Cohesion: 0.17
Nodes (14): ACTION_LABELS, BUTTON_ACTIONS, buttonComponents, buttonProps, ButtonView(), TargetField(), usePuck, formatCountdown() (+6 more)

### Community 69 - "src/proxy.ts"
Cohesion: 0.22
Nodes (18): resolveStorageMode(), updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy() (+10 more)

### Community 70 - "Repository Audit (Stage 0)"
Cohesion: 0.14
Nodes (14): coolify, License table, Method, motion, Not integrated / rejected, posthog, puck, react-sdk (Solidgate) (+6 more)

### Community 71 - "CheckoutPanel.tsx"
Cohesion: 0.16
Nodes (16): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, CheckoutBlockView(), WalletButton() (+8 more)

### Community 72 - "public.payment_orphans"
Cohesion: 0.24
Nodes (6): public.payment_orphans, public.record_payment_adjustment(), public.record_payment_adjustment(), payment_orphans_payment_idx, payment_orphans_run_idx, public.apply_deferred_adjustments()

### Community 73 - "FunnelRuntime.tsx"
Cohesion: 0.09
Nodes (43): contrastingForeground(), EmailBlock, emailBlocks(), foregroundForLuminance(), linearize(), loadUsableRun(), parseChannel(), parseHex() (+35 more)

### Community 74 - "chat.ts"
Cohesion: 0.08
Nodes (30): slugFrom(), Message, randomId(), newOptionId(), SCREEN_SYSTEM, ChatProposal, ChatRequest, chatRequestSchema (+22 more)

### Community 75 - "index.ts"
Cohesion: 0.13
Nodes (15): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditorSlots, usePuck, CatalogEntry, EditorData (+7 more)

### Community 76 - "AssistantPanel.tsx"
Cohesion: 0.10
Nodes (27): ERROR_TEXT, errorText(), Action, ACTIONS, chunk(), errorSchema, InlineAi(), LANGUAGES (+19 more)

### Community 77 - "status/route.ts"
Cohesion: 0.12
Nodes (26): bodySchema, dynamic, POST(), rateLimited(), dynamic, formSchema, dynamic, NO_STORE (+18 more)

### Community 78 - "index.ts"
Cohesion: 0.14
Nodes (15): buttonEdges(), fromPuckData(), OptionRef, splitAttached(), PuckItem, optionListProps, cleanItem(), cleanItems() (+7 more)

### Community 79 - "ref_zod"
Cohesion: 0.09
Nodes (35): ImageJob, DROPPED_KEYS, Json, strictJsonSchema(), walk(), createAnthropicModel(), FALLBACK_MODELS, mapError() (+27 more)

### Community 80 - "text-edits.ts"
Cohesion: 0.18
Nodes (18): Step: Inline copy, MAX_TITLE_LENGTH, applyPropsTextEdits(), collect(), editable(), elementTextFields(), flatten(), HEADER_ELEMENT_ID (+10 more)

### Community 81 - "checkout/route.ts"
Cohesion: 0.22
Nodes (20): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+12 more)

### Community 82 - "Implementation Plan"
Cohesion: 0.20
Nodes (10): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 1: Minimal vertical slice (in progress), Stage 2: Components and logic, Stage 3: Database and publishing, Stage 5: Analytics and publishing operations, Stage 6: Custom domains (+2 more)

### Community 83 - "login/page.tsx"
Cohesion: 0.33
Nodes (6): AuthFormState, initialState, LoginForm(), dynamic, firstValue(), LoginPage()

### Community 84 - "frame.tsx"
Cohesion: 0.40
Nodes (9): Frame(), framed(), FramedBlock(), useFunnelTheme(), containerStyle(), isItemShown(), readElementMeta(), readElementStyle() (+1 more)

### Community 86 - "studio-overview.ts"
Cohesion: 0.06
Nodes (55): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, dynamic, first(), StudioFunnelsPage() (+47 more)

### Community 87 - "FunnelRuntime"
Cohesion: 0.22
Nodes (10): dynamic, PreviewPage(), FunnelRuntime(), parseDefinition(), longestPathFrom(), Flow, Public runtime, Related (+2 more)

### Community 88 - "validateFunnel"
Cohesion: 0.17
Nodes (18): check(), issueKey(), runChat(), snapshot(), Step: Chat route, Step: Context, Step: Operations, Step: Working copy (+10 more)

### Community 89 - "migrate"
Cohesion: 0.11
Nodes (14): PublishedFunnel, PublishedReader, parseStoredDefinition(), SupabasePublishedReader, toVersion(), Module boundaries, Step: Autosave draft, Step: Funnel versions (+6 more)

### Community 90 - "Data flow"
Cohesion: 0.18
Nodes (11): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 4. Checkout, webhook, status, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication (+3 more)

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
Cohesion: 0.11
Nodes (26): accountClientKey(), authenticate(), AuthKeys, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK (+18 more)

### Community 95 - "Auth and access"
Cohesion: 0.50
Nodes (4): Auth and access, Flow, Related, What it does

### Community 96 - "guards.ts"
Cohesion: 0.16
Nodes (14): AiSessionResult, dailyBudgetMicroUsd(), imageEstimate(), ImageSession, ledger, LedgerEntry, Meter, Opened (+6 more)

### Community 97 - "seed.ts"
Cohesion: 0.28
Nodes (11): RetypeResult, Edge, button(), createSeedFunnel(), createStarterFunnel(), heading(), options(), paragraph() (+3 more)

### Community 98 - "ThemeEditor.tsx"
Cohesion: 0.22
Nodes (10): ScreenEditorProps, COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE (+2 more)

### Community 99 - "Deployment"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 102 - "Architecture"
Cohesion: 0.20
Nodes (10): Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Known risks and open questions, Repository layout, Stack (+2 more)

### Community 103 - "VersionsPanel.tsx"
Cohesion: 0.50
Nodes (4): formatDate(), VersionsPanel(), VersionsResponse, versionsResponseSchema

### Community 104 - "Feature map"
Cohesion: 0.40
Nodes (5): Background jobs, Feature map, How a funnel lives, Keeping these pages current, Map

### Community 105 - "Custom domains"
Cohesion: 0.40
Nodes (5): Custom domains, Domain status, Flow, Related, What it does

### Community 106 - "react"
Cohesion: 0.33
Nodes (8): describe(), flatten(), isItem(), Item, Layer, LayersPanel(), usePuck, CATALOG_BY_TYPE

### Community 107 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @google/genai@2.30.0, next@16.4.3, openai@7.41.0, @puckeditor/core@0.23.0, react@19.3.1, server-only@0.0.1, @solidgate/client-sdk-loader@1.39.0 (+6 more)

### Community 108 - "Lead capture"
Cohesion: 0.50
Nodes (4): Flow, Lead capture, Related, What it does

### Community 109 - "supabase-payment-store.ts"
Cohesion: 0.14
Nodes (18): @supabase/ssr@0.12.7, readSupabaseEnv(), requireSupabaseEnv(), StorageMode, SupabaseEnv, SESSION_COOKIE_OPTIONS, SessionResult, createSupabaseAnonClient() (+10 more)

### Community 110 - "Studio overview"
Cohesion: 0.50
Nodes (3): Flow, Studio overview, What it does

### Community 111 - "payment-status.ts"
Cohesion: 0.33
Nodes (6): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult, Step: Poll status

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

### Community 120 - "AI assistant"
Cohesion: 0.29
Nodes (5): AI assistant, Deviations from the first design, Flow, Security, What it does

### Community 121 - "public.ai_usage"
Cohesion: 0.36
Nodes (6): ai_usage_project_created_idx, assets_project_created_idx, funnels_ai_draft_expires_idx, public.ai_spend_since(), public.ai_usage, public.assets

## Knowledge Gaps
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `ImageAssets.tsx`, `web/package.json`, `DomainsPanel.tsx`, `config.tsx`, `FunnelEditor.tsx`, `ScreenCanvas.tsx`, `stripe-provider.ts`, `inline.ts`, `StudioFunnels.tsx`, `react`, `[id]/leads/route.ts`, `BriefWizard.tsx`, `repository.ts`, `guards.ts`, `flow.tsx`, `server-only`, `payments/registry.ts`, `getPaymentStore`, `src/proxy.ts`, `status/route.ts`, `checkout/route.ts`, `login/page.tsx`, `studio-overview.ts`, `FunnelRuntime`, `actions.ts`, `guards.ts`, `app/layout.tsx`, `dependencies`, `supabase-payment-store.ts`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `ImageAssets.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10869565217391304 - nodes in this community are weakly interconnected._
- **Why does `react` connect `CheckoutPanel.tsx` to `ImageAssets.tsx`, `web/package.json`, `use-funnel-analytics.ts`, `DomainsPanel.tsx`, `config.tsx`, `FunnelEditor.tsx`, `catalog.tsx`, `ScreenCanvas.tsx`, `StudioShell.tsx`, `use-draft-saver.ts`, `elements/layout.tsx`, `content.tsx`, `StudioFunnels.tsx`, `paywall.tsx`, `react`, `styles.ts`, `BriefWizard.tsx`, `repository.ts`, `runtime-context.tsx`, `StyleFields.tsx`, `flow.tsx`, `catalog.tsx`, `inputs.tsx`, `ParamControls.tsx`, `ThemeDefaults.tsx`, `button.tsx`, `FunnelRuntime.tsx`, `index.ts`, `AssistantPanel.tsx`, `login/page.tsx`, `frame.tsx`, `studio-overview.ts`, `ThemeEditor.tsx`, `app/layout.tsx`, `VersionsPanel.tsx`, `react`, `dependencies`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `withStudio()` (e.g. with `Storage, auth and public read path (Stage 3)` and `Component responsibilities`) actually correct?**
  _`withStudio()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `use-funnel-analytics.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.058699101004759384 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `switch-platform-domain.mjs` to `web/package.json`, `use-funnel-analytics.ts`, `webhook.ts`, `DomainsPanel.tsx`, `next`, `payments/types.ts`, `stripe-provider.ts`, `inline.ts`, `supabase-funnel-repository.ts`, `repository.ts`, `guards.ts`, `runtime-context.tsx`, `ai/brief.ts`, `server-only`, `payments/registry.ts`, `solidgate-provider.ts`, `getPaymentStore`, `chat.ts`, `ref_zod`, `checkout/route.ts`, `studio-overview.ts`, `actions.ts`, `guards.ts`, `dependencies`, `supabase-payment-store.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._