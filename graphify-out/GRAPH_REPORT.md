# Graph Report - funnel-platform  (2026-11-05)

## Corpus Check
- 267 files · ~159,397 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 14, (none) 6, .example 1)

## Summary
- 2545 nodes · 6961 edges · 124 communities (102 shown, 22 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 446 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3a783559`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- InlineAi.tsx
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
- file-payment-store.ts
- StudioFunnels.tsx
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
- studio-overview.ts
- paywall.tsx
- Funnel Repository Interface
- react
- parse
- Steps
- styles.ts
- supabase-funnel-repository.ts
- BriefWizard.tsx
- Schema TS Config
- README
- CustomDomain
- guards.ts
- runtime-context.tsx
- ai/brief.ts
- StyleFields.tsx
- flow.tsx
- generate/route.ts
- server-only
- PaymentEvent
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
- Repository Audit (Stage 0)
- CheckoutPanel.tsx
- public.payment_orphans
- FunnelRuntime.tsx
- chat.ts
- index.ts
- AssistantPanel.tsx
- api/leads/route.ts
- screen-refs.ts
- ref_zod
- text-edits.ts
- checkout/route.ts
- Implementation Plan
- login/page.tsx
- posthog.ts
- RateLimiter
- docs.ts
- repository.ts
- patch.ts
- migrate
- Analytics and consent
- Steps
- public.leads
- isPaymentType
- actions.ts
- Auth and access
- guards.ts
- seed.ts
- ThemeEditor.tsx
- @solidgate/client-sdk-loader
- Security
- @stripe/react-stripe-js
- FunnelRuntime
- @stripe/stripe-js
- react
- dependencies
- resolveStorageMode
- Steps
- payment-status.ts
- public.funnel_groups
- @anthropic-ai/sdk
- scripts
- @funnel/schema@workspace:*
- AI assistant
- public.ai_usage
- lottie-web
- marked
- mermaid
- posthog-js
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
- `Step: Autosave draft` --references--> `useDraftSaver()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/lib/use-draft-saver.ts

## Import Cycles
- None detected.

## Communities (124 total, 22 thin omitted)

### Community 0 - "InlineAi.tsx"
Cohesion: 0.07
Nodes (34): AssetError, assetSchema, errorSchema, IMAGE_ASPECTS, ImageAssetsContext, ImageAssetsProvider(), ImageAssetsValue, LibraryAsset (+26 more)

### Community 1 - "web/package.json"
Cohesion: 0.21
Nodes (12): devDependencies, @types/node@22.19.1, @types/react@19.3.0, @types/react-dom@19.3.0, typescript@5.9.3, typescript, name, private (+4 more)

### Community 2 - "use-funnel-analytics.ts"
Cohesion: 0.11
Nodes (33): ConsentBanner(), isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent() (+25 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "webhook.ts"
Cohesion: 0.07
Nodes (29): PaymentStore, PaymentAdjustment, toPublicPaymentStatus(), emitAdjustment(), processAdjustment(), recordVerifiedEvent(), 4. Checkout, webhook, status, Step: Advance funnel (+21 more)

### Community 5 - "DomainsPanel.tsx"
Cohesion: 0.05
Nodes (72): dynamic, NO_STORE, POST(), Summary, askSecretMatches(), dynamic, GET(), NO_STORE (+64 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.15
Nodes (3): FileFunnelRepository, isNotFound(), RevisionConflictError

### Community 7 - "config.tsx"
Cohesion: 0.12
Nodes (23): checkoutBlockProps, Heading(), headingProps, ImageBlock(), imageProps, newOptionId(), OptionListBlock(), optionListProps (+15 more)

### Community 8 - "switch-platform-domain.mjs"
Cohesion: 0.11
Nodes (19): Context, dynamic, GET(), csvCell(), HEADER, leadsToCsv(), FileLeadStore, fileSchema (+11 more)

### Community 9 - "rate-limit.ts"
Cohesion: 0.15
Nodes (16): AuthKeys, register(), requireAppUrlInProduction(), Bucket, clientIpHeader(), clientKeyFromHeaders(), defaultLimiter, DIRECT_KEY (+8 more)

### Community 10 - "FunnelEditor.tsx"
Cohesion: 0.08
Nodes (60): AnimationSettings(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight(), CopyIcon(), DotsIcon(), DuplicateIcon() (+52 more)

### Community 11 - "catalog.tsx"
Cohesion: 0.09
Nodes (27): AddElementPanel(), isAttached(), NO_PREVIEW, presetProps(), Preview(), useApplyPresets(), usePuck, ASK (+19 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.15
Nodes (23): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+15 more)

### Community 13 - "next"
Cohesion: 0.06
Nodes (47): Context, DELETE(), dynamic, PATCH(), renameSchema, createSchema, dynamic, GET() (+39 more)

### Community 14 - "ScreenCanvas.tsx"
Cohesion: 0.12
Nodes (31): RuntimeInner(), buttonEdges(), CanvasMode, EditOverlay(), Focus(), layoutColumns(), NODE_TYPES, PHONE_H (+23 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.05
Nodes (46): clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition, retypeScreen(), textScreen(), toTextItem(), ANIMATION_PRESETS (+38 more)

### Community 16 - "switch-platform-domain.mjs"
Cohesion: 0.13
Nodes (15): Step: Chat panel, APPLY, call(), COOLIFY_URL, coolifyHeaders, coolifyToken, local, plan() (+7 more)

### Community 17 - "validate.ts"
Cohesion: 0.10
Nodes (27): DefinitionCheck, isOlderDefinition(), parseInput(), Step: Validate definition, Stage 1: Minimal vertical slice (in progress), migrate(), MigrationError, CURRENT_SCHEMA_VERSION (+19 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.14
Nodes (9): FunnelGroup, FunnelNotFoundError, GroupNotFoundError, SlugTakenError, fail(), SupabaseFunnelRepository, toFunnel(), toGroup() (+1 more)

### Community 19 - "file-payment-store.ts"
Cohesion: 0.13
Nodes (15): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+7 more)

### Community 20 - "StudioFunnels.tsx"
Cohesion: 0.09
Nodes (48): confirmStopGeneration(), BookIcon(), CloseIcon(), FlowIcon(), FolderIcon(), HomeIcon(), LogoMark(), LogoutIcon() (+40 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.12
Nodes (18): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+10 more)

### Community 22 - "stripe-provider.ts"
Cohesion: 0.09
Nodes (37): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), dynamic, escapeHtml(), GET() (+29 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "inline.ts"
Cohesion: 0.12
Nodes (14): dynamic, POST(), AiSession, answerSchema, INLINE_ACTIONS, InlineAction, InlineRequest, inlineRequestSchema (+6 more)

### Community 25 - "use-draft-saver.ts"
Cohesion: 0.15
Nodes (16): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+8 more)

### Community 26 - "templates.ts"
Cohesion: 0.36
Nodes (13): attached(), checkoutBlock(), createQuizContent(), createScreenContent(), heading(), nextButton(), optionList(), paragraph() (+5 more)

### Community 27 - "elements/layout.tsx"
Cohesion: 0.12
Nodes (20): carouselProps, columnsProps, layoutComponents, popupProps, rowsProps, slot, Components, number() (+12 more)

### Community 28 - "content.tsx"
Cohesion: 0.10
Nodes (22): ImageAspect, useImageAssets(), ImageField(), Panel, useEditorData(), badgeProps, chartProps, contentComponents (+14 more)

### Community 29 - "ScreenStyles.tsx"
Cohesion: 0.18
Nodes (25): ColorInput(), Props, channel(), ColorRow(), hexOf(), hslToRgb(), ImageRow(), joinColor() (+17 more)

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
Nodes (16): PlanItem, planPickerProps, SELECTED_PLAN_KEY, totalsProps, trialPickerProps, walletProps, BillingPlanPicker(), pickerDefaults (+8 more)

### Community 34 - "Funnel Repository Interface"
Cohesion: 0.08
Nodes (3): FunnelRepository, Funnel, FunnelDefinition

### Community 35 - "react"
Cohesion: 0.13
Nodes (19): DeleteFunnelButton(), formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, describe(), formatDate() (+11 more)

### Community 36 - "parse"
Cohesion: 0.22
Nodes (22): Badge(), Chart(), Faq(), CookieConsent(), Processing(), Checkbox(), DatePicker(), fieldCss() (+14 more)

### Community 37 - "Steps"
Cohesion: 0.18
Nodes (13): blockId(), defaultPickerPlan(), hiddenBlockIds(), screenGate(), valueOf(), Step: Add Element panel, Step: Authentication, Step: Button actions (+5 more)

### Community 38 - "styles.ts"
Cohesion: 0.06
Nodes (54): ANIMATION_OPTIONS, EFFECT_TYPES, ElementInspector(), InspectedElement, Tab, VISIBILITY_OPTIONS, cleanObject(), Group (+46 more)

### Community 39 - "supabase-funnel-repository.ts"
Cohesion: 0.06
Nodes (34): DomainStatus, BriefResult, domainFileSchema, groupFileSchema, isRecord(), versionSummarySchema, withRevision(), AiUsageRecord (+26 more)

### Community 41 - "BriefWizard.tsx"
Cohesion: 0.11
Nodes (17): CLOSING_KINDS, errorResponse, FIXED_KINDS, GOALS, KIND_LABELS, LOCKED_KINDS, outlineResponse, Plan (+9 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "CustomDomain"
Cohesion: 0.11
Nodes (15): domainStatusSchema, createSupabaseServiceClient(), resultSchema, rowSchema, SupabaseDomainMaintenance, toDomain(), CustomDomain, DomainCheck (+7 more)

### Community 45 - "guards.ts"
Cohesion: 0.13
Nodes (24): EditFunnelPage(), ImageSession, BUILTIN, ModelPrice, overrides(), priceFor(), priceSchema, aiChatEnabled() (+16 more)

### Community 46 - "runtime-context.tsx"
Cohesion: 0.21
Nodes (12): EMAIL_BLOCK_TYPES, EmailBlock, EmailInputProps, emailKey(), isValidEmail(), EmailInputBlock(), EmailOAuth(), BlockProps (+4 more)

### Community 47 - "ai/brief.ts"
Cohesion: 0.14
Nodes (20): BriefEvent, briefPlans(), briefText(), ELEMENTS_GUIDE, generateFunnel(), generateOutline(), ImageJob, MakeImage (+12 more)

### Community 48 - "StyleFields.tsx"
Cohesion: 0.09
Nodes (22): ALIGN_OPTIONS, DECORATION_OPTIONS, EFFECT_OPTIONS, FONT_OPTIONS, POSITION_LABELS, POSITION_OPTIONS, SHADOW_OPTIONS, StyleFieldsProps (+14 more)

### Community 49 - "flow.tsx"
Cohesion: 0.15
Nodes (16): autoNext, cookieProps, customerProps, flowComponents, Loader(), loaderProps, processingProps, Reviews() (+8 more)

### Community 50 - "generate/route.ts"
Cohesion: 0.16
Nodes (14): bodySchema, dynamic, POST(), bodySchema, dynamic, POST(), StreamEvent, companionImageSession() (+6 more)

### Community 51 - "server-only"
Cohesion: 0.13
Nodes (20): bodySchema, dynamic, POST(), dynamic, GET(), POST(), IMAGE_ASPECTS, generateAsset() (+12 more)

### Community 52 - "PaymentEvent"
Cohesion: 0.18
Nodes (8): MockProvider, MockForbiddenError, PaymentEvent, PaymentProvider, ProviderStatus, UnsupportedError, Step: Mock provider, Stage 4: Payments

### Community 53 - "public.domains"
Cohesion: 0.21
Nodes (11): domains_funnel_id_idx, domains_guard, domains_project_id_idx, domains_verified_hostname_idx, public.domains, public.domains_guard(), public.get_published_funnel_by_host(), public.is_host_servable() (+3 more)

### Community 54 - "randomId"
Cohesion: 0.18
Nodes (20): slugFrom(), loadUsableRun(), randomId(), MAX_RUN_HISTORY, retreat(), adoptRunId(), answersSchema, getOrCreateRunId() (+12 more)

### Community 55 - "inputs.tsx"
Cohesion: 0.12
Nodes (20): checkboxProps, datePickerProps, ratingProps, sliderProps, textInputProps, editorOnly(), emailOAuthProps, EMOJI_SCALE (+12 more)

### Community 56 - "solidgate-provider.ts"
Cohesion: 0.07
Nodes (30): Plan, PAYER_HASH_PATTERN, apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema (+22 more)

### Community 57 - "ConditionPicker.tsx"
Cohesion: 0.16
Nodes (19): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+11 more)

### Community 58 - "src/brief.ts"
Cohesion: 0.10
Nodes (28): imageJobs(), Step: Brief wizard, AI_ELEMENT_TYPES, AiElement, aiElementSchema, AUTO_ADVANCING, BRIEF_GOALS, briefImageTargets (+20 more)

### Community 59 - "payments/registry.ts"
Cohesion: 0.12
Nodes (31): dynamic, NO_STORE, POST(), Context, dynamic, GET(), dynamic, POST() (+23 more)

### Community 60 - "supabase-payment-store.ts"
Cohesion: 0.11
Nodes (24): AdjustmentResult, FunnelPayment, RecordRejection, RecordResult, StaleDeferred, StatusDetail, StatusQuery, accessRowSchema (+16 more)

### Community 64 - "runChat"
Cohesion: 0.20
Nodes (14): allowedTypesFor(), allowedElement(), pool(), optionsOf(), resolveOps(), runChat(), snapshot(), Step: Chat route (+6 more)

### Community 68 - "button.tsx"
Cohesion: 0.13
Nodes (17): @puckeditor/core@0.23.0, ACTION_LABELS, BUTTON_ACTIONS, buttonComponents, buttonProps, ButtonView(), DestinationField(), TargetField() (+9 more)

### Community 69 - "src/proxy.ts"
Cohesion: 0.22
Nodes (18): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+10 more)

### Community 70 - "Repository Audit (Stage 0)"
Cohesion: 0.05
Nodes (53): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+45 more)

### Community 71 - "CheckoutPanel.tsx"
Cohesion: 0.26
Nodes (12): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, CheckoutBlockView(), REF_KEY() (+4 more)

### Community 72 - "public.payment_orphans"
Cohesion: 0.24
Nodes (6): public.payment_orphans, public.record_payment_adjustment(), public.record_payment_adjustment(), payment_orphans_payment_idx, payment_orphans_run_idx, public.apply_deferred_adjustments()

### Community 73 - "FunnelRuntime.tsx"
Cohesion: 0.14
Nodes (22): contrastingForeground(), EmailBlock, emailBlocks(), foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS (+14 more)

### Community 74 - "chat.ts"
Cohesion: 0.10
Nodes (24): Message, SCREEN_SYSTEM, ChatRequest, chatRequestSchema, ChatResult, check(), issueKey(), MAX_HISTORY_TURNS (+16 more)

### Community 75 - "index.ts"
Cohesion: 0.11
Nodes (23): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditor, ScreenEditorProps, ScreenEditorSlots, usePuck (+15 more)

### Community 76 - "AssistantPanel.tsx"
Cohesion: 0.11
Nodes (25): blocksOf(), BriefWizard(), freeKey(), ERROR_TEXT, errorText(), AssistantPanel(), AssistantPanelProps, errorSchema (+17 more)

### Community 77 - "api/leads/route.ts"
Cohesion: 0.22
Nodes (11): bodySchema, dynamic, POST(), rateLimited(), normalizeEmail(), LeadTarget, resolveLeadTarget(), Step: List leads (+3 more)

### Community 78 - "screen-refs.ts"
Cohesion: 0.53
Nodes (5): cleanItem(), cleanItems(), isItem(), Item, stripScreenRefs()

### Community 79 - "ref_zod"
Cohesion: 0.10
Nodes (30): DROPPED_KEYS, Json, strictJsonSchema(), walk(), createAnthropicModel(), FALLBACK_MODELS, mapError(), createGoogleModel() (+22 more)

### Community 80 - "text-edits.ts"
Cohesion: 0.17
Nodes (19): text(), Step: Inline copy, MAX_TITLE_LENGTH, applyPropsTextEdits(), collect(), editable(), elementTextFields(), flatten() (+11 more)

### Community 81 - "checkout/route.ts"
Cohesion: 0.12
Nodes (31): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), CustomDomainFunnelPage(), dynamic, dynamic (+23 more)

### Community 82 - "Implementation Plan"
Cohesion: 0.22
Nodes (9): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 2: Components and logic, Stage 3: Database and publishing, Stage 5: Analytics and publishing operations, Stage 6: Custom domains, Stage overview (+1 more)

### Community 83 - "login/page.tsx"
Cohesion: 0.33
Nodes (6): AuthFormState, initialState, LoginForm(), dynamic, firstValue(), LoginPage()

### Community 84 - "posthog.ts"
Cohesion: 0.36
Nodes (5): AnalyticsEmitter, getClient(), posthogServerAnalytics, warn(), serverAnalytics

### Community 86 - "docs.ts"
Cohesion: 0.10
Nodes (18): devOrigins, nextConfig, privateHeaders, securityHeaders, DocsSearch(), DocsIndexPage(), dynamic, DocPage() (+10 more)

### Community 87 - "repository.ts"
Cohesion: 0.18
Nodes (17): dynamic, PreviewPage(), dynamic, dynamic, first(), StudioFunnelsPage(), dynamic, StudioPage() (+9 more)

### Community 88 - "patch.ts"
Cohesion: 0.39
Nodes (7): Step: Working copy, applyOne(), applyPatch(), summarizePatch(), touches(), UNCONDITIONAL, applyTextEdits()

### Community 89 - "migrate"
Cohesion: 0.17
Nodes (6): PublishedFunnel, PublishedReader, parseStoredDefinition(), SupabasePublishedReader, Module boundaries, Step: Load live version

### Community 90 - "Analytics and consent"
Cohesion: 0.40
Nodes (5): Analytics and consent, Flow, Related, What is and is not sent, What it does

### Community 91 - "Steps"
Cohesion: 0.25
Nodes (8): Flow, Related, Step: Autosave draft, Step: Publish version, Step: Rollback, Steps, Studio authoring, What it does

### Community 92 - "public.leads"
Cohesion: 0.53
Nodes (5): leads_funnel_created_idx, leads_project_id_idx, leads_version_id_idx, public.leads, public.record_lead()

### Community 93 - "isPaymentType"
Cohesion: 0.30
Nodes (10): ActionField(), MissingServiceKeyError, Step: Screen routing, Status log, matches(), nextScreen(), NextScreenOptions, own() (+2 more)

### Community 94 - "actions.ts"
Cohesion: 0.20
Nodes (18): accountClientKey(), authenticate(), credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK, releaseSignInFailure() (+10 more)

### Community 95 - "Auth and access"
Cohesion: 0.50
Nodes (4): Auth and access, Flow, Related, What it does

### Community 96 - "guards.ts"
Cohesion: 0.16
Nodes (19): bodySchema, dynamic, POST(), dynamic, POST(), aiErrorResponse(), AiSessionResult, dailyBudgetMicroUsd() (+11 more)

### Community 97 - "seed.ts"
Cohesion: 0.36
Nodes (10): Step: Catalog, button(), createSeedFunnel(), createStarterFunnel(), heading(), options(), paragraph(), puck() (+2 more)

### Community 98 - "ThemeEditor.tsx"
Cohesion: 0.28
Nodes (8): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE

### Community 100 - "Security"
Cohesion: 0.15
Nodes (13): slug(), Custom domains, Leads (personal data), Operational, Payment rules, Privacy and analytics, Response headers, Runtime safety (+5 more)

### Community 102 - "FunnelRuntime"
Cohesion: 0.11
Nodes (19): FunnelRuntime(), parseDefinition(), Device, PreviewPane(), Animation, Architecture, Custom domains (Stage 6), Data model (+11 more)

### Community 106 - "react"
Cohesion: 0.15
Nodes (11): metadata, viewport, describe(), flatten(), isItem(), Item, Layer, LayersPanel() (+3 more)

### Community 107 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, @google/genai@2.30.0, next@16.4.3, openai@7.41.0, react@19.3.1, server-only@0.0.1, stripe@23.0.1, @supabase/ssr@0.12.7 (+5 more)

### Community 109 - "resolveStorageMode"
Cohesion: 0.26
Nodes (10): dynamic, GET(), readSupabaseEnv(), requireSupabaseEnv(), resolveStorageMode(), SupabaseEnv, SESSION_COOKIE_OPTIONS, SessionResult (+2 more)

### Community 110 - "Steps"
Cohesion: 0.18
Nodes (10): Flow, Step: Create a funnel, Step: Load funnels, Step: Manage projects, Step: Move a funnel, Step: Render the funnel list, Step: Render the overview, Steps (+2 more)

### Community 111 - "payment-status.ts"
Cohesion: 0.40
Nodes (5): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult

### Community 113 - "public.funnel_groups"
Cohesion: 0.67
Nodes (3): funnel_groups_project_id_idx, funnels_group_id_idx, public.funnel_groups

### Community 118 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, typecheck

### Community 120 - "AI assistant"
Cohesion: 0.20
Nodes (8): AI assistant, Deviations from the first design, Flow, Security, What it does, AI generation, Flow, What it does

### Community 121 - "public.ai_usage"
Cohesion: 0.36
Nodes (6): ai_usage_project_created_idx, assets_project_created_idx, funnels_ai_draft_expires_idx, public.ai_spend_since(), public.ai_usage, public.assets

## Knowledge Gaps
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `InlineAi.tsx`, `web/package.json`, `DomainsPanel.tsx`, `config.tsx`, `switch-platform-domain.mjs`, `FunnelEditor.tsx`, `ScreenCanvas.tsx`, `StudioFunnels.tsx`, `stripe-provider.ts`, `inline.ts`, `content.tsx`, `react`, `BriefWizard.tsx`, `flow.tsx`, `generate/route.ts`, `server-only`, `payments/registry.ts`, `src/proxy.ts`, `api/leads/route.ts`, `checkout/route.ts`, `login/page.tsx`, `docs.ts`, `repository.ts`, `actions.ts`, `guards.ts`, `react`, `dependencies`, `resolveStorageMode`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `InlineAi.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06755260243632337 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `InlineAi.tsx`, `web/package.json`, `use-funnel-analytics.ts`, `DomainsPanel.tsx`, `config.tsx`, `FunnelEditor.tsx`, `catalog.tsx`, `ScreenCanvas.tsx`, `StudioFunnels.tsx`, `use-draft-saver.ts`, `elements/layout.tsx`, `content.tsx`, `ScreenStyles.tsx`, `paywall.tsx`, `react`, `styles.ts`, `BriefWizard.tsx`, `runtime-context.tsx`, `StyleFields.tsx`, `flow.tsx`, `inputs.tsx`, `button.tsx`, `CheckoutPanel.tsx`, `FunnelRuntime.tsx`, `index.ts`, `AssistantPanel.tsx`, `login/page.tsx`, `docs.ts`, `repository.ts`, `ThemeEditor.tsx`, `FunnelRuntime`, `dependencies`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `withStudio()` (e.g. with `Storage, auth and public read path (Stage 3)` and `Component responsibilities`) actually correct?**
  _`withStudio()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `use-funnel-analytics.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11379800853485064 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `server-only` to `web/package.json`, `DomainsPanel.tsx`, `switch-platform-domain.mjs`, `rate-limit.ts`, `next`, `file-payment-store.ts`, `stripe-provider.ts`, `inline.ts`, `studio-overview.ts`, `supabase-funnel-repository.ts`, `CustomDomain`, `guards.ts`, `ai/brief.ts`, `generate/route.ts`, `PaymentEvent`, `solidgate-provider.ts`, `payments/registry.ts`, `supabase-payment-store.ts`, `chat.ts`, `api/leads/route.ts`, `ref_zod`, `checkout/route.ts`, `posthog.ts`, `docs.ts`, `repository.ts`, `guards.ts`, `dependencies`, `resolveStorageMode`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._