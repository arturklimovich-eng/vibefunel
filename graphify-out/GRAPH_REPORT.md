# Graph Report - funnel-platform  (2026-11-05)

## Corpus Check
- 266 files · ~157,634 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 14, (none) 6, .example 1)

## Summary
- 2528 nodes · 6896 edges · 134 communities (109 shown, 25 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 439 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `78e57c62`
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
- api/leads/route.ts
- FunnelEditor.tsx
- index.ts
- Core DB Schema Migrations
- next
- ScreenCanvas.tsx
- Funnel Schema and Theme
- switch-platform-domain.mjs
- validate.ts
- Supabase Funnel Repository
- verify.ts
- StudioFunnels.tsx
- Payments DB Migrations
- stripe-provider.ts
- Web TS Config
- inline.ts
- use-draft-saver.ts
- templates.ts
- content.tsx
- migrate.ts
- ScreenStyles.tsx
- Docker Compose
- Schema Package Manifest
- studio-overview.ts
- paywall.tsx
- Funnel Repository Interface
- react
- Steps
- styles.ts
- supabase-funnel-repository.ts
- ElementInspector.tsx
- Schema TS Config
- README
- createSupabaseServiceClient
- guards.ts
- email.ts
- ai/brief.ts
- StyleFields.tsx
- flow.tsx
- DomainsPanel.tsx
- server-only
- leads.ts
- public.domains
- randomId
- inputs.tsx
- solidgate-provider.ts
- ConditionPicker.tsx
- src/brief.ts
- payments/registry.ts
- supabase-payment-store.ts
- Next.js Agent Notes
- runChat
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- button.tsx
- src/proxy.ts
- seed.ts
- CheckoutPanel.tsx
- public.payment_orphans
- FunnelRuntime.tsx
- chat.ts
- adapters.ts
- AssistantPanel.tsx
- RuntimeInner
- screen-refs.ts
- ref_zod
- text-edits.ts
- checkout/route.ts
- Implementation Plan
- Asset
- return-params.ts
- validate-definition.ts
- docs.ts
- getStudioContext
- AnimationSettings.tsx
- migrate
- ParamControls.tsx
- Studio authoring
- public.leads
- isPaymentType
- actions.ts
- Data flow
- guards.ts
- seed.ts
- ThemeEditor.tsx
- Steps
- Security
- Deployment
- Architecture
- Lead capture
- supabase/proxy.ts
- next
- dependencies
- Feature map
- repository.ts
- Steps
- payment-status.ts
- Custom domains
- public.funnel_groups
- Checkout
- @anthropic-ai/sdk
- Refunds and disputes
- Screen elements
- scripts
- @funnel/schema@workspace:*
- public.ai_usage
- lottie-web
- marked
- mermaid
- posthog-js
- stripe
- posthog-node
- react-dom
- motion
- sharp
- @xyflow/react
- zod@4.6.7
- hasOversizedString

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 91 edges
2. `next` - 66 edges
3. `withStudio()` - 59 edges
4. `react` - 58 edges
5. `FileFunnelRepository` - 56 edges
6. `server-only` - 48 edges
7. `SupabaseFunnelRepository` - 44 edges
8. `FunnelDefinition` - 42 edges
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
- `Step: Brief wizard` --references--> `StudioShell()`  [INFERRED]
  docs/features/81-ai-generation.md → apps/web/src/components/StudioShell.tsx

## Import Cycles
- None detected.

## Communities (134 total, 25 thin omitted)

### Community 0 - "ImageAssets.tsx"
Cohesion: 0.11
Nodes (17): AssetError, assetSchema, errorSchema, IMAGE_ASPECTS, ImageAspect, ImageAssetsContext, ImageAssetsValue, LibraryAsset (+9 more)

### Community 1 - "web/package.json"
Cohesion: 0.21
Nodes (12): devDependencies, @types/node@22.19.1, @types/react@19.3.0, @types/react-dom@19.3.0, typescript@5.9.3, typescript, name, private (+4 more)

### Community 2 - "use-funnel-analytics.ts"
Cohesion: 0.07
Nodes (44): ConsentBanner(), isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent() (+36 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "webhook.ts"
Cohesion: 0.10
Nodes (19): PaymentStore, isAdjustment(), emitAdjustment(), eventUuid(), processAdjustment(), recordVerifiedEvent(), uuidFrom(), WebhookOutcome (+11 more)

### Community 5 - "[id]/domains/route.ts"
Cohesion: 0.18
Nodes (19): Context, dynamic, isDomainTaken(), POST(), bodySchema, Context, dynamic, GET() (+11 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.14
Nodes (6): FileFunnelRepository, isRecord(), withRevision(), CustomDomain, FunnelDraft, FunnelVersion

### Community 7 - "config.tsx"
Cohesion: 0.13
Nodes (22): checkoutBlockProps, Heading(), headingProps, ImageBlock(), imageProps, OptionListBlock(), OptionPopup(), Paragraph() (+14 more)

### Community 8 - "switch-platform-domain.mjs"
Cohesion: 0.11
Nodes (20): Context, dynamic, GET(), csvCell(), HEADER, leadsToCsv(), FileLeadStore, fileSchema (+12 more)

### Community 9 - "api/leads/route.ts"
Cohesion: 0.13
Nodes (26): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, dynamic, POST() (+18 more)

### Community 10 - "FunnelEditor.tsx"
Cohesion: 0.08
Nodes (60): ImageAssetsProvider(), AnimationSettings(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight(), CloseIcon(), CopyIcon() (+52 more)

### Community 11 - "index.ts"
Cohesion: 0.05
Nodes (53): AddElementPanel(), isAttached(), NO_PREVIEW, presetProps(), Preview(), useApplyPresets(), usePuck, SearchIcon() (+45 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.15
Nodes (23): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+15 more)

### Community 13 - "next"
Cohesion: 0.06
Nodes (52): bodySchema, dynamic, POST(), Context, DELETE(), dynamic, PATCH(), renameSchema (+44 more)

### Community 14 - "ScreenCanvas.tsx"
Cohesion: 0.14
Nodes (24): AssistantPanelProps, CardContext, buttonEdges(), CanvasMode, EditOverlay(), Focus(), layoutColumns(), NODE_TYPES (+16 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (34): animationPresetSchema, animationSchema, conditionSchema, DEV_HTTP_HOSTS, edgeSchema, FontFamily, fontFamilySchema, fontWeightSchema (+26 more)

### Community 16 - "switch-platform-domain.mjs"
Cohesion: 0.13
Nodes (15): Step: Chat panel, APPLY, call(), COOLIFY_URL, coolifyHeaders, coolifyToken, local, plan() (+7 more)

### Community 17 - "validate.ts"
Cohesion: 0.14
Nodes (20): PuckData, getOptionLists(), isFallbackEdge(), isPaymentScreen(), isQuiz(), IssueCode, IssueSeverity, OptionListInfo (+12 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.11
Nodes (10): ForbiddenError, FunnelGroup, FunnelNotFoundError, GroupNotFoundError, RevisionConflictError, fail(), SupabaseFunnelRepository, toDomain() (+2 more)

### Community 19 - "verify.ts"
Cohesion: 0.22
Nodes (16): RoutingStatus, txtRecordName(), txtRecordValue(), checkDomainDns(), checkDomainOwnership(), checkOwnership(), checkRouting(), configuredDnsServers() (+8 more)

### Community 20 - "StudioFunnels.tsx"
Cohesion: 0.09
Nodes (48): confirmStopGeneration(), BookIcon(), FlowIcon(), FolderIcon(), HomeIcon(), LogoMark(), LogoutIcon(), PenIcon() (+40 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.12
Nodes (18): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+10 more)

### Community 22 - "stripe-provider.ts"
Cohesion: 0.11
Nodes (26): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, formSchema (+18 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "inline.ts"
Cohesion: 0.14
Nodes (14): dynamic, POST(), AiSession, answerSchema, INLINE_ACTIONS, InlineAction, InlineRequest, inlineRequestSchema (+6 more)

### Community 25 - "use-draft-saver.ts"
Cohesion: 0.15
Nodes (17): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+9 more)

### Community 26 - "templates.ts"
Cohesion: 0.19
Nodes (20): slugFrom(), newScreen(), shortId(), randomId(), newOptionId(), insertTracker, PendingPreset, attached() (+12 more)

### Community 27 - "content.tsx"
Cohesion: 0.07
Nodes (49): Badge(), badgeProps, Chart(), chartProps, contentComponents, Divider(), dividerProps, Faq() (+41 more)

### Community 28 - "migrate.ts"
Cohesion: 0.36
Nodes (8): clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition, retypeScreen(), textScreen(), toTextItem(), LEGACY_SCREEN_TYPES

### Community 29 - "ScreenStyles.tsx"
Cohesion: 0.31
Nodes (16): ImageRow(), Label(), NumberInput(), NumberRow(), Row(), Section(), Segmented(), SelectRow() (+8 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "studio-overview.ts"
Cohesion: 0.16
Nodes (20): revocationOf(), bucketIndex(), buildWindow(), DAY_FORMAT, FunnelRow, isPaid(), loadStudioOverview(), MONTH_FORMAT (+12 more)

### Community 33 - "paywall.tsx"
Cohesion: 0.12
Nodes (23): checkboxProps, datePickerProps, PLAN_PICKER_TYPES, PlanItem, planPickerProps, ratingProps, SELECTED_PLAN_KEY, sliderProps (+15 more)

### Community 35 - "react"
Cohesion: 0.09
Nodes (28): DeleteFunnelButton(), formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm() (+20 more)

### Community 37 - "Steps"
Cohesion: 0.20
Nodes (10): screenGate(), valueOf(), Step: Add Element panel, Step: Authentication, Step: Button actions, Step: Continue gates, Step: Frame, Step: Loaders (+2 more)

### Community 38 - "styles.ts"
Cohesion: 0.08
Nodes (39): Frame(), framed(), FramedBlock(), useFunnelTheme(), animationSchema, builtinTokens(), BUTTON_TYPES, containerStyle() (+31 more)

### Community 39 - "supabase-funnel-repository.ts"
Cohesion: 0.07
Nodes (32): DomainStatus, BriefResult, domainFileSchema, groupFileSchema, versionSummarySchema, AiUsageRecord, AssetSource, DefinitionInvalidError (+24 more)

### Community 41 - "ElementInspector.tsx"
Cohesion: 0.12
Nodes (16): ANIMATION_OPTIONS, EFFECT_TYPES, InspectedElement, Tab, VISIBILITY_OPTIONS, ScreenEditorProps, Group, KIND (+8 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "createSupabaseServiceClient"
Cohesion: 0.17
Nodes (10): domainStatusSchema, createSupabaseServiceClient(), resultSchema, rowSchema, SupabaseDomainMaintenance, toDomain(), DomainMaintenance, RecheckOutcome (+2 more)

### Community 45 - "guards.ts"
Cohesion: 0.17
Nodes (21): dynamic, EditFunnelPage(), BUILTIN, ModelPrice, overrides(), priceFor(), priceSchema, aiChatEnabled() (+13 more)

### Community 46 - "email.ts"
Cohesion: 0.17
Nodes (15): emailBlocks(), EMAIL_BLOCK_TYPES, EmailBlock, emailBlocksOf(), EmailInputProps, emailKey(), isValidEmail(), LeadTarget (+7 more)

### Community 47 - "ai/brief.ts"
Cohesion: 0.14
Nodes (26): allowedElement(), BriefEvent, briefPlans(), briefText(), ELEMENTS_GUIDE, generateFunnel(), generateOutline(), outlineText() (+18 more)

### Community 48 - "StyleFields.tsx"
Cohesion: 0.10
Nodes (21): ALIGN_OPTIONS, DECORATION_OPTIONS, EFFECT_OPTIONS, FONT_OPTIONS, POSITION_LABELS, POSITION_OPTIONS, SHADOW_OPTIONS, StyleFieldsProps (+13 more)

### Community 49 - "flow.tsx"
Cohesion: 0.17
Nodes (15): autoNext, cookieProps, customerProps, flowComponents, Loader(), loaderProps, Processing(), processingProps (+7 more)

### Community 50 - "DomainsPanel.tsx"
Cohesion: 0.18
Nodes (16): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+8 more)

### Community 51 - "server-only"
Cohesion: 0.17
Nodes (15): bodySchema, dynamic, POST(), dynamic, GET(), POST(), openImageSession(), IMAGE_ASPECTS (+7 more)

### Community 52 - "leads.ts"
Cohesion: 0.50
Nodes (4): LEADS_ROUTE, LeadSubmission, sendLead(), warn()

### Community 53 - "public.domains"
Cohesion: 0.21
Nodes (11): domains_funnel_id_idx, domains_guard, domains_project_id_idx, domains_verified_hostname_idx, public.domains, public.domains_guard(), public.get_published_funnel_by_host(), public.is_host_servable() (+3 more)

### Community 54 - "randomId"
Cohesion: 0.27
Nodes (15): loadUsableRun(), adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN, runIdKey() (+7 more)

### Community 55 - "inputs.tsx"
Cohesion: 0.14
Nodes (25): editorOnly(), Checkbox(), DatePicker(), EmailOAuth(), emailOAuthProps, EMOJI_SCALE, fieldCss(), inputComponents (+17 more)

### Community 56 - "solidgate-provider.ts"
Cohesion: 0.06
Nodes (37): isMockEnabled(), MockProvider, PAYER_HASH_PATTERN, apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema (+29 more)

### Community 57 - "ConditionPicker.tsx"
Cohesion: 0.16
Nodes (19): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+11 more)

### Community 58 - "src/brief.ts"
Cohesion: 0.05
Nodes (41): errorResponse, GOALS, KIND_LABELS, LOCKED_KINDS, outlineResponse, Plan, ScreenStatus, Step (+33 more)

### Community 59 - "payments/registry.ts"
Cohesion: 0.10
Nodes (31): dynamic, NO_STORE, POST(), Context, dynamic, GET(), dynamic, POST() (+23 more)

### Community 60 - "supabase-payment-store.ts"
Cohesion: 0.07
Nodes (40): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+32 more)

### Community 64 - "runChat"
Cohesion: 0.17
Nodes (16): optionsOf(), resolveOps(), runChat(), snapshot(), AI assistant, Deviations from the first design, Flow, Security (+8 more)

### Community 68 - "button.tsx"
Cohesion: 0.15
Nodes (16): ACTION_LABELS, BUTTON_ACTIONS, buttonComponents, buttonProps, ButtonView(), css(), TargetField(), usePuck (+8 more)

### Community 69 - "src/proxy.ts"
Cohesion: 0.15
Nodes (24): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+16 more)

### Community 70 - "seed.ts"
Cohesion: 0.14
Nodes (14): coolify, License table, Method, motion, Not integrated / rejected, posthog, puck, react-sdk (Solidgate) (+6 more)

### Community 71 - "CheckoutPanel.tsx"
Cohesion: 0.20
Nodes (13): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, CheckoutBlockView(), REF_KEY() (+5 more)

### Community 72 - "public.payment_orphans"
Cohesion: 0.24
Nodes (6): public.payment_orphans, public.record_payment_adjustment(), public.record_payment_adjustment(), payment_orphans_payment_idx, payment_orphans_run_idx, public.apply_deferred_adjustments()

### Community 73 - "FunnelRuntime.tsx"
Cohesion: 0.17
Nodes (20): contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS, RuntimeProps (+12 more)

### Community 74 - "chat.ts"
Cohesion: 0.10
Nodes (26): Message, SCREEN_SYSTEM, ChatProposal, ChatRequest, chatRequestSchema, ChatResult, check(), issueKey() (+18 more)

### Community 75 - "adapters.ts"
Cohesion: 0.21
Nodes (10): phoneVars(), ScreenNode, StaticScreen, OptionRef, splitAttached(), toPuckData(), blockId(), PuckItem (+2 more)

### Community 76 - "AssistantPanel.tsx"
Cohesion: 0.09
Nodes (31): BriefWizard(), ERROR_TEXT, errorText(), Action, ACTIONS, chunk(), errorSchema, InlineAi() (+23 more)

### Community 77 - "RuntimeInner"
Cohesion: 0.27
Nodes (10): dynamic, PreviewPage(), FunnelRuntime(), parseDefinition(), RuntimeInner(), ScreenHeaderBar(), longestPathFrom(), defaultPickerPlan() (+2 more)

### Community 78 - "screen-refs.ts"
Cohesion: 0.53
Nodes (5): cleanItem(), cleanItems(), isItem(), Item, stripScreenRefs()

### Community 79 - "ref_zod"
Cohesion: 0.10
Nodes (32): ImageSession, DROPPED_KEYS, Json, strictJsonSchema(), walk(), createAnthropicModel(), FALLBACK_MODELS, mapError() (+24 more)

### Community 80 - "text-edits.ts"
Cohesion: 0.14
Nodes (23): Step: Inline copy, applyOne(), ThemePatch, touches(), UNCONDITIONAL, MAX_TITLE_LENGTH, applyPropsTextEdits(), applyTextEdits() (+15 more)

### Community 81 - "checkout/route.ts"
Cohesion: 0.17
Nodes (26): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), POST(), resolveCheckoutTarget(), getPaymentProvider() (+18 more)

### Community 82 - "Implementation Plan"
Cohesion: 0.20
Nodes (10): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 1: Minimal vertical slice (in progress), Stage 2: Components and logic, Stage 3: Database and publishing, Stage 5: Analytics and publishing operations, Stage 6: Custom domains (+2 more)

### Community 83 - "Asset"
Cohesion: 0.27
Nodes (3): isNotFound(), Asset, NewAsset

### Community 84 - "return-params.ts"
Cohesion: 0.39
Nodes (6): dynamic, PublishedFunnelPage(), ReturnParams, parseReturnParams(), SearchParams, single()

### Community 85 - "validate-definition.ts"
Cohesion: 0.40
Nodes (5): DefinitionCheck, isOlderDefinition(), parseInput(), CURRENT_SCHEMA_VERSION, funnelDefinitionSchema

### Community 86 - "docs.ts"
Cohesion: 0.13
Nodes (10): devOrigins, nextConfig, privateHeaders, securityHeaders, DocEntry, DocGroup, listFeatures(), readOptional() (+2 more)

### Community 87 - "getStudioContext"
Cohesion: 0.14
Nodes (23): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, dynamic, first(), StudioFunnelsPage() (+15 more)

### Community 88 - "AnimationSettings.tsx"
Cohesion: 0.40
Nodes (4): ANIMATION_PRESETS, AnimationPreset, MAX_ANIMATION_MS, ScreenAnimation

### Community 89 - "migrate"
Cohesion: 0.11
Nodes (14): PublishedFunnel, PublishedReader, parseStoredDefinition(), SupabasePublishedReader, toVersion(), Module boundaries, Step: Autosave draft, Step: Funnel versions (+6 more)

### Community 90 - "ParamControls.tsx"
Cohesion: 0.26
Nodes (11): ColorInput(), Props, channel(), ColorRow(), hexOf(), hslToRgb(), joinColor(), NumberInputProps (+3 more)

### Community 91 - "Studio authoring"
Cohesion: 0.50
Nodes (4): Flow, Related, Studio authoring, What it does

### Community 92 - "public.leads"
Cohesion: 0.53
Nodes (5): leads_funnel_created_idx, leads_project_id_idx, leads_version_id_idx, public.leads, public.record_lead()

### Community 93 - "isPaymentType"
Cohesion: 0.20
Nodes (14): ActionField(), MissingServiceKeyError, Flow, Public runtime, Related, Step: Screen routing, What it does, Status log (+6 more)

### Community 94 - "actions.ts"
Cohesion: 0.09
Nodes (30): accountClientKey(), authenticate(), AuthFormState, AuthKeys, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError() (+22 more)

### Community 95 - "Data flow"
Cohesion: 0.18
Nodes (11): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 4. Checkout, webhook, status, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication (+3 more)

### Community 96 - "guards.ts"
Cohesion: 0.11
Nodes (25): bodySchema, dynamic, POST(), StreamEvent, bodySchema, dynamic, POST(), dynamic (+17 more)

### Community 97 - "seed.ts"
Cohesion: 0.36
Nodes (10): Step: Catalog, button(), createSeedFunnel(), createStarterFunnel(), heading(), options(), paragraph(), puck() (+2 more)

### Community 98 - "ThemeEditor.tsx"
Cohesion: 0.28
Nodes (8): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE

### Community 99 - "Steps"
Cohesion: 0.67
Nodes (3): Step: Hourly re-verification, Step: Warn, revoke, restore, Steps

### Community 100 - "Security"
Cohesion: 0.20
Nodes (10): slug(), Custom domains, Operational, Response headers, Runtime safety, Secrets policy, Security, Stage 3 implementation: auth, RLS, public read (+2 more)

### Community 101 - "Deployment"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 102 - "Architecture"
Cohesion: 0.20
Nodes (10): Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Known risks and open questions, Repository layout, Stack (+2 more)

### Community 103 - "Lead capture"
Cohesion: 0.50
Nodes (4): Flow, Lead capture, Related, What it does

### Community 104 - "supabase/proxy.ts"
Cohesion: 0.47
Nodes (4): @supabase/ssr@0.12.7, SESSION_COOKIE_OPTIONS, SessionResult, @supabase/ssr

### Community 106 - "next"
Cohesion: 0.09
Nodes (12): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), dynamic, metadata, viewport (+4 more)

### Community 107 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @google/genai@2.30.0, next@16.4.3, openai@7.41.0, @puckeditor/core@0.23.0, react@19.3.1, server-only@0.0.1, @solidgate/client-sdk-loader@1.39.0 (+6 more)

### Community 108 - "Feature map"
Cohesion: 0.40
Nodes (5): Background jobs, Feature map, How a funnel lives, Keeping these pages current, Map

### Community 109 - "repository.ts"
Cohesion: 0.13
Nodes (23): dynamic, GET(), dynamic, NO_STORE, POST(), Summary, signOut(), readSupabaseEnv() (+15 more)

### Community 110 - "Steps"
Cohesion: 0.18
Nodes (10): Flow, Step: Create a funnel, Step: Load funnels, Step: Manage projects, Step: Move a funnel, Step: Render the funnel list, Step: Render the overview, Steps (+2 more)

### Community 111 - "payment-status.ts"
Cohesion: 0.40
Nodes (5): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult

### Community 112 - "Custom domains"
Cohesion: 0.40
Nodes (5): Custom domains, Domain status, Flow, Related, What it does

### Community 113 - "public.funnel_groups"
Cohesion: 0.67
Nodes (3): funnel_groups_project_id_idx, funnels_group_id_idx, public.funnel_groups

### Community 114 - "Checkout"
Cohesion: 0.50
Nodes (4): Checkout, Flow, Related, What it does

### Community 116 - "Refunds and disputes"
Cohesion: 0.50
Nodes (4): Flow, Refunds and disputes, Related, What it does

### Community 117 - "Screen elements"
Cohesion: 0.67
Nodes (3): Flow, Screen elements, What it does

### Community 118 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, typecheck

### Community 121 - "public.ai_usage"
Cohesion: 0.36
Nodes (6): ai_usage_project_created_idx, assets_project_created_idx, funnels_ai_draft_expires_idx, public.ai_spend_since(), public.ai_usage, public.assets

## Knowledge Gaps
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `ImageAssets.tsx`, `web/package.json`, `[id]/domains/route.ts`, `config.tsx`, `switch-platform-domain.mjs`, `api/leads/route.ts`, `FunnelEditor.tsx`, `next`, `ScreenCanvas.tsx`, `StudioFunnels.tsx`, `stripe-provider.ts`, `inline.ts`, `react`, `guards.ts`, `flow.tsx`, `server-only`, `src/brief.ts`, `payments/registry.ts`, `src/proxy.ts`, `RuntimeInner`, `checkout/route.ts`, `return-params.ts`, `getStudioContext`, `actions.ts`, `guards.ts`, `supabase/proxy.ts`, `dependencies`, `repository.ts`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `ImageAssets.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11462450592885376 - nodes in this community are weakly interconnected._
- **Why does `react` connect `CheckoutPanel.tsx` to `ImageAssets.tsx`, `web/package.json`, `use-funnel-analytics.ts`, `config.tsx`, `FunnelEditor.tsx`, `index.ts`, `ScreenCanvas.tsx`, `StudioFunnels.tsx`, `use-draft-saver.ts`, `content.tsx`, `paywall.tsx`, `react`, `styles.ts`, `ElementInspector.tsx`, `StyleFields.tsx`, `flow.tsx`, `DomainsPanel.tsx`, `inputs.tsx`, `src/brief.ts`, `button.tsx`, `FunnelRuntime.tsx`, `AssistantPanel.tsx`, `getStudioContext`, `ParamControls.tsx`, `actions.ts`, `ThemeEditor.tsx`, `next`, `dependencies`, `repository.ts`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `withStudio()` (e.g. with `Storage, auth and public read path (Stage 3)` and `Component responsibilities`) actually correct?**
  _`withStudio()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `use-funnel-analytics.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07402031930333818 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `repository.ts` to `web/package.json`, `use-funnel-analytics.ts`, `webhook.ts`, `[id]/domains/route.ts`, `switch-platform-domain.mjs`, `api/leads/route.ts`, `next`, `verify.ts`, `stripe-provider.ts`, `inline.ts`, `studio-overview.ts`, `supabase-funnel-repository.ts`, `createSupabaseServiceClient`, `guards.ts`, `email.ts`, `ai/brief.ts`, `DomainsPanel.tsx`, `server-only`, `solidgate-provider.ts`, `payments/registry.ts`, `supabase-payment-store.ts`, `chat.ts`, `ref_zod`, `checkout/route.ts`, `docs.ts`, `getStudioContext`, `guards.ts`, `dependencies`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._