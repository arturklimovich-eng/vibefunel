# Graph Report - funnel-platform  (2026-11-05)

## Corpus Check
- 269 files · ~161,979 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 14, (none) 6, .example 1)

## Summary
- 2573 nodes · 7049 edges · 134 communities (108 shown, 26 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 449 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `39ba9140`
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
- BriefWizard.tsx
- FunnelEditor.tsx
- AddElementPanel.tsx
- Core DB Schema Migrations
- next
- index.ts
- Funnel Schema and Theme
- ai/types.ts
- validate.ts
- Supabase Funnel Repository
- payments/types.ts
- StudioShell.tsx
- Payments DB Migrations
- stripe-provider.ts
- Web TS Config
- parseJsonBody
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
- Lead capture
- Steps
- styles.ts
- supabase-funnel-repository.ts
- inline.ts
- Schema TS Config
- README
- catalog.tsx
- guards.ts
- api/leads/route.ts
- ai/brief.ts
- studio-overview.ts
- RuntimeInner
- images/route.ts
- generate/route.ts
- solidgate-provider.ts
- public.domains
- migrate.ts
- inputs.tsx
- ref_zod
- ConditionPicker.tsx
- src/brief.ts
- next
- DomainsPanel.tsx
- Next.js Agent Notes
- events.ts
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- Security
- CheckoutPanel.tsx
- Repository Audit (Stage 0)
- CheckoutPanel.tsx
- public.payment_orphans
- FunnelRuntime.tsx
- chat.ts
- index.ts
- AssistantPanel.tsx
- payments/types.ts
- screen-refs.ts
- google.ts
- text-edits.ts
- checkout/route.ts
- Implementation Plan
- patch.ts
- migrate
- getStudioContext
- FunnelRuntime
- ThemeEditor.tsx
- parseStoredDefinition
- Data flow
- Steps
- public.leads
- Asset
- actions.ts
- draft/route.ts
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
- repository.ts
- Steps
- payment-status.ts
- Checkout
- public.funnel_groups
- leads.ts
- @anthropic-ai/sdk
- AnimationSettings.tsx
- stripe
- scripts
- mermaid
- Steps
- public.ai_usage
- lottie-web
- marked
- react-dom
- posthog-js
- @solidgate/client-sdk-loader
- posthog-node
- @supabase/supabase-js
- motion
- sharp
- zod@4.6.7
- hasOversizedString

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
- `Stage 5: Analytics and publishing operations` --references--> `ConsentBanner()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → apps/web/src/components/ConsentBanner.tsx
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Step: Frame` --references--> `FunnelRuntime()`  [INFERRED]
  docs/features/12-elements.md → apps/web/src/components/FunnelRuntime.tsx
- `Step: Render the funnel list` --references--> `StudioFunnels()`  [INFERRED]
  docs/features/15-studio-overview.md → apps/web/src/components/StudioFunnels.tsx
- `Step: Browser events` --references--> `AnalyticsEvent`  [INFERRED]
  docs/features/60-analytics-consent.md → apps/web/src/lib/analytics/events.ts

## Import Cycles
- None detected.

## Communities (134 total, 26 thin omitted)

### Community 0 - "ImageAssets.tsx"
Cohesion: 0.12
Nodes (15): AssetError, assetSchema, errorSchema, IMAGE_ASPECTS, ImageAspect, ImageAssetsContext, ImageAssetsValue, LibraryAsset (+7 more)

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
Cohesion: 0.07
Nodes (34): dynamic, POST(), isSolidgateConfigured(), PaymentStore, isAdjustment(), emitAdjustment(), eventUuid(), isNamed() (+26 more)

### Community 5 - "[id]/domains/route.ts"
Cohesion: 0.18
Nodes (21): bodySchema, Context, dynamic, GET(), POST(), HOSTNAME_MAX_LENGTH, normalizeHostname(), stripPort() (+13 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.15
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "config.tsx"
Cohesion: 0.13
Nodes (21): OptionRef, checkoutBlockProps, Heading(), headingProps, ImageBlock(), imageProps, OptionListBlock(), optionListProps (+13 more)

### Community 8 - "switch-platform-domain.mjs"
Cohesion: 0.05
Nodes (32): devOrigins, nextConfig, privateHeaders, securityHeaders, createSupabaseServiceClient(), MissingServiceKeyError, HEADER, FileLeadStore (+24 more)

### Community 9 - "BriefWizard.tsx"
Cohesion: 0.09
Nodes (19): CLOSING_KINDS, errorResponse, FIXED_KINDS, GOALS, KIND_LABELS, LOCKED_KINDS, outlineResponse, Plan (+11 more)

### Community 10 - "FunnelEditor.tsx"
Cohesion: 0.08
Nodes (61): ImageAssetsProvider(), AnimationSettings(), ChatIcon(), ChevronDown(), ChevronLeft(), ChevronRight(), CopyIcon(), DuplicateIcon() (+53 more)

### Community 11 - "AddElementPanel.tsx"
Cohesion: 0.22
Nodes (14): AddElementPanel(), isAttached(), NO_PREVIEW, presetProps(), Preview(), useApplyPresets(), usePuck, CATEGORIES (+6 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.15
Nodes (23): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+15 more)

### Community 13 - "next"
Cohesion: 0.10
Nodes (25): Context, DELETE(), dynamic, PATCH(), renameSchema, createSchema, dynamic, GET() (+17 more)

### Community 14 - "index.ts"
Cohesion: 0.10
Nodes (36): AssistantPanelProps, CardContext, ProposalPreview, touchedScreens(), buttonEdges(), CanvasMode, EditOverlay(), Focus() (+28 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (30): animationPresetSchema, animationSchema, conditionSchema, DEV_HTTP_HOSTS, edgeSchema, funnelSchema, funnelVersionSchema, idSchema (+22 more)

### Community 16 - "ai/types.ts"
Cohesion: 0.14
Nodes (13): mapError(), mapError(), SIZES, mapError(), AiEffort, AiError, AiErrorCode, AiFeature (+5 more)

### Community 17 - "validate.ts"
Cohesion: 0.16
Nodes (18): slug(), Status log, isSkipType(), getOptionLists(), isFallbackEdge(), isQuiz(), IssueCode, IssueSeverity (+10 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.13
Nodes (8): FunnelGroup, FunnelNotFoundError, GroupNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel(), toGroup()

### Community 19 - "payments/types.ts"
Cohesion: 0.07
Nodes (35): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), FilePaymentStore, fileSchema, findAdjustmentTarget() (+27 more)

### Community 20 - "StudioShell.tsx"
Cohesion: 0.08
Nodes (52): blocksOf(), BriefWizard(), confirmStopGeneration(), freeKey(), BookIcon(), CloseIcon(), DotsIcon(), FlowIcon() (+44 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.12
Nodes (18): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+10 more)

### Community 22 - "stripe-provider.ts"
Cohesion: 0.15
Nodes (22): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), pickerPlanKeys(), CheckoutTarget, ContentItem (+14 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "parseJsonBody"
Cohesion: 0.12
Nodes (20): bodySchema, dynamic, POST(), Context, dynamic, POST(), rollbackSchema, Context (+12 more)

### Community 25 - "use-draft-saver.ts"
Cohesion: 0.15
Nodes (17): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+9 more)

### Community 26 - "templates.ts"
Cohesion: 0.36
Nodes (13): attached(), checkoutBlock(), createQuizContent(), createScreenContent(), heading(), nextButton(), optionList(), paragraph() (+5 more)

### Community 27 - "elements/layout.tsx"
Cohesion: 0.09
Nodes (29): badgeProps, chartProps, contentComponents, Divider(), dividerProps, faqProps, List(), listProps (+21 more)

### Community 28 - "flow.tsx"
Cohesion: 0.11
Nodes (43): ButtonView(), Badge(), Chart(), Faq(), autoNext, CookieConsent(), cookieProps, CustomerCarousel() (+35 more)

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
Nodes (18): Context, dynamic, isDomainTaken(), POST(), RoutingStatus, checkDomainDns(), checkDomainOwnership(), checkOwnership() (+10 more)

### Community 33 - "paywall.tsx"
Cohesion: 0.12
Nodes (24): checkboxProps, datePickerProps, PLAN_PICKER_TYPES, PlanItem, planPickerProps, ratingProps, SELECTED_PLAN_KEY, textInputProps (+16 more)

### Community 34 - "Funnel Repository Interface"
Cohesion: 0.08
Nodes (3): FunnelRepository, StudioContext, Funnel

### Community 35 - "react"
Cohesion: 0.10
Nodes (29): DeleteFunnelButton(), formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm() (+21 more)

### Community 36 - "Lead capture"
Cohesion: 0.50
Nodes (4): Flow, Lead capture, Related, What it does

### Community 37 - "Steps"
Cohesion: 0.20
Nodes (10): Flow, Screen elements, Step: Add Element panel, Step: Authentication, Step: Button actions, Step: Frame, Step: Loaders, Step: Plan pickers (+2 more)

### Community 38 - "styles.ts"
Cohesion: 0.07
Nodes (39): Frame(), animationSchema, builtinTokens(), BUTTON_TYPES, containerStyle(), cssUrl(), ElementAnimation, elementMetaSchema (+31 more)

### Community 39 - "supabase-funnel-repository.ts"
Cohesion: 0.05
Nodes (43): domainStatusSchema, BriefResult, resultSchema, rowSchema, domainFileSchema, groupFileSchema, versionSummarySchema, AiUsageRecord (+35 more)

### Community 41 - "inline.ts"
Cohesion: 0.14
Nodes (15): dynamic, POST(), answerSchema, INLINE_ACTIONS, InlineAction, InlineRequest, inlineRequestSchema, InlineVariant (+7 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "catalog.tsx"
Cohesion: 0.10
Nodes (17): ASK, Base, CATALOG, CatalogEntry, ENTRY, LOAD, PAY, PRESETS_BY_ID (+9 more)

### Community 45 - "guards.ts"
Cohesion: 0.25
Nodes (15): dynamic, EditFunnelPage(), aiChatEnabled(), aiImagesEnabled(), aiInlineEnabled(), envFor(), getImageModel(), getTextModel() (+7 more)

### Community 46 - "api/leads/route.ts"
Cohesion: 0.11
Nodes (33): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, dynamic, POST() (+25 more)

### Community 47 - "ai/brief.ts"
Cohesion: 0.13
Nodes (19): randomId(), newOptionId(), briefPlans(), briefText(), ELEMENTS_GUIDE, generateFunnel(), generateOutline(), outlineText() (+11 more)

### Community 48 - "studio-overview.ts"
Cohesion: 0.14
Nodes (24): revocationOf(), bucketIndex(), buildWindow(), DAY_FORMAT, FunnelMetrics, FunnelRow, isPaid(), loadFunnelMetrics() (+16 more)

### Community 49 - "RuntimeInner"
Cohesion: 0.27
Nodes (15): loadUsableRun(), adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN, runIdKey() (+7 more)

### Community 50 - "images/route.ts"
Cohesion: 0.15
Nodes (17): bodySchema, dynamic, POST(), dynamic, POST(), bodySchema, dynamic, POST() (+9 more)

### Community 51 - "generate/route.ts"
Cohesion: 0.11
Nodes (23): bodySchema, dynamic, POST(), slugFrom(), StreamEvent, dynamic, GET(), POST() (+15 more)

### Community 52 - "solidgate-provider.ts"
Cohesion: 0.06
Nodes (43): isMockEnabled(), MockProvider, getPaymentProvider(), getSolidgateProvider(), globalForPayments, PAYER_HASH_PATTERN, apiKeys(), encryptIntent() (+35 more)

### Community 53 - "public.domains"
Cohesion: 0.21
Nodes (11): domains_funnel_id_idx, domains_guard, domains_project_id_idx, domains_verified_hostname_idx, public.domains, public.domains_guard(), public.get_published_funnel_by_host(), public.is_host_servable() (+3 more)

### Community 54 - "migrate.ts"
Cohesion: 0.36
Nodes (8): clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition, retypeScreen(), textScreen(), toTextItem(), LEGACY_SCREEN_TYPES

### Community 55 - "inputs.tsx"
Cohesion: 0.15
Nodes (17): sliderProps, editorOnly(), emailOAuthProps, EMOJI_SCALE, inputComponents, OAuthButton(), oauthButtonProps, OAuthButtons() (+9 more)

### Community 56 - "ref_zod"
Cohesion: 0.22
Nodes (11): EMAIL_BLOCK_TYPES, EmailBlock, emailBlocksOf(), EmailInputProps, emailKey(), isValidEmail(), blockId(), PuckItem (+3 more)

### Community 57 - "ConditionPicker.tsx"
Cohesion: 0.17
Nodes (18): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+10 more)

### Community 58 - "src/brief.ts"
Cohesion: 0.09
Nodes (33): imageJobs(), Step: Generation, AI_ELEMENT_TYPES, AiElement, aiElementSchema, AUTO_ADVANCING, BRIEF_GOALS, briefImageTargets (+25 more)

### Community 59 - "next"
Cohesion: 0.07
Nodes (28): dynamic, NO_STORE, POST(), Summary, dynamic, NO_STORE, POST(), Context (+20 more)

### Community 60 - "DomainsPanel.tsx"
Cohesion: 0.15
Nodes (20): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+12 more)

### Community 64 - "events.ts"
Cohesion: 0.15
Nodes (13): AnalyticsEmitter, AnalyticsEvent, AnalyticsEventName, AnalyticsProperties, AnalyticsPropertyValue, AnalyticsSource, EmitOptions, PropertyOptions (+5 more)

### Community 68 - "Security"
Cohesion: 0.17
Nodes (12): ServerOnlyAnalyticsEvent, Custom domains, Leads (personal data), Operational, Privacy and analytics, Response headers, Runtime safety, Secrets policy (+4 more)

### Community 69 - "CheckoutPanel.tsx"
Cohesion: 0.27
Nodes (12): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, CheckoutBlockView(), REF_KEY() (+4 more)

### Community 70 - "Repository Audit (Stage 0)"
Cohesion: 0.14
Nodes (14): coolify, License table, Method, motion, Not integrated / rejected, posthog, puck, react-sdk (Solidgate) (+6 more)

### Community 71 - "CheckoutPanel.tsx"
Cohesion: 0.10
Nodes (24): ACTION_LABELS, BUTTON_ACTIONS, buttonComponents, buttonProps, TargetField(), usePuck, carouselProps, columnsProps (+16 more)

### Community 72 - "public.payment_orphans"
Cohesion: 0.24
Nodes (6): public.payment_orphans, public.record_payment_adjustment(), public.record_payment_adjustment(), payment_orphans_payment_idx, payment_orphans_run_idx, public.apply_deferred_adjustments()

### Community 73 - "FunnelRuntime.tsx"
Cohesion: 0.12
Nodes (27): ConsentBanner(), contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS (+19 more)

### Community 74 - "chat.ts"
Cohesion: 0.10
Nodes (29): pool(), ChatProposal, ChatRequest, ChatResult, check(), elementPrompt(), issueKey(), MAX_HISTORY_TURNS (+21 more)

### Community 75 - "index.ts"
Cohesion: 0.15
Nodes (16): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditor, ScreenEditorProps, ScreenEditorSlots, usePuck (+8 more)

### Community 76 - "AssistantPanel.tsx"
Cohesion: 0.08
Nodes (34): ERROR_TEXT, errorText(), Action, ACTIONS, chunk(), errorSchema, InlineAi(), LANGUAGES (+26 more)

### Community 77 - "payments/types.ts"
Cohesion: 0.12
Nodes (24): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, formSchema (+16 more)

### Community 78 - "screen-refs.ts"
Cohesion: 0.53
Nodes (5): cleanItem(), cleanItems(), isItem(), Item, stripScreenRefs()

### Community 79 - "google.ts"
Cohesion: 0.17
Nodes (18): DROPPED_KEYS, Json, strictJsonSchema(), walk(), createAnthropicModel(), FALLBACK_MODELS, mapError(), BLOCKED (+10 more)

### Community 80 - "text-edits.ts"
Cohesion: 0.18
Nodes (19): Step: Inline copy, MAX_TITLE_LENGTH, applyPropsTextEdits(), applyTextEdits(), collect(), editable(), elementTextFields(), flatten() (+11 more)

### Community 81 - "checkout/route.ts"
Cohesion: 0.29
Nodes (15): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+7 more)

### Community 82 - "Implementation Plan"
Cohesion: 0.22
Nodes (9): Decisions to review (taken during the autonomous loop, 2026-10-30), Implementation Plan, Stage 0: Audit, Stage 2: Components and logic, Stage 3: Database and publishing, Stage 5: Analytics and publishing operations, Stage 6: Custom domains, Stage overview (+1 more)

### Community 83 - "patch.ts"
Cohesion: 0.22
Nodes (13): Step: Chat panel, Step: Chat route, Step: Operations, Step: Working copy, Steps, applyOne(), applyPatch(), isAttached() (+5 more)

### Community 84 - "migrate"
Cohesion: 0.31
Nodes (7): DefinitionCheck, isOlderDefinition(), parseInput(), Step: Validate definition, migrate(), MigrationError, CURRENT_SCHEMA_VERSION

### Community 86 - "getStudioContext"
Cohesion: 0.14
Nodes (14): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, MermaidDiagrams(), DocEntry, DocGroup (+6 more)

### Community 87 - "FunnelRuntime"
Cohesion: 0.24
Nodes (9): dynamic, PreviewPage(), FunnelRuntime(), parseDefinition(), Flow, Public runtime, Related, Step: Render screen (+1 more)

### Community 88 - "ThemeEditor.tsx"
Cohesion: 0.28
Nodes (8): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE

### Community 89 - "parseStoredDefinition"
Cohesion: 0.19
Nodes (7): PublishedFunnel, PublishedReader, parseStoredDefinition(), SupabasePublishedReader, toVersion(), Module boundaries, Step: Load live version

### Community 90 - "Data flow"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+2 more)

### Community 91 - "Steps"
Cohesion: 0.25
Nodes (8): Flow, Related, Step: Autosave draft, Step: Funnel versions, Step: Publish version, Steps, Studio authoring, What it does

### Community 92 - "public.leads"
Cohesion: 0.53
Nodes (5): leads_funnel_created_idx, leads_project_id_idx, leads_version_id_idx, public.leads, public.record_lead()

### Community 93 - "Asset"
Cohesion: 0.27
Nodes (3): isNotFound(), Asset, NewAsset

### Community 94 - "actions.ts"
Cohesion: 0.06
Nodes (56): accountClientKey(), authenticate(), AuthFormState, AuthKeys, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError() (+48 more)

### Community 95 - "draft/route.ts"
Cohesion: 0.32
Nodes (7): Context, dynamic, GET(), PUT(), saveSchema, checkDefinition(), Step: Save draft route

### Community 96 - "guards.ts"
Cohesion: 0.12
Nodes (19): AiSessionResult, imageEstimate(), ImageSession, ledger, LedgerEntry, Meter, Opened, RATE_LIMITS (+11 more)

### Community 97 - "seed.ts"
Cohesion: 0.36
Nodes (10): Step: Catalog, button(), createSeedFunnel(), createStarterFunnel(), heading(), options(), paragraph(), puck() (+2 more)

### Community 98 - "Analytics and consent"
Cohesion: 0.40
Nodes (5): Analytics and consent, Flow, Related, What is and is not sent, What it does

### Community 99 - "Deployment"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 101 - "next"
Cohesion: 0.21
Nodes (15): dynamic, first(), StudioFunnelsPage(), dynamic, StudioPage(), studioShellProps(), uiFont, aiBriefOptions (+7 more)

### Community 102 - "isPaymentType"
Cohesion: 0.11
Nodes (22): useEditorData(), ActionField(), DestinationField(), Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals (+14 more)

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
Cohesion: 0.17
Nodes (12): dependencies, @funnel/schema@workspace:*, @google/genai@2.30.0, next@16.4.3, openai@7.41.0, @puckeditor/core@0.23.0, react@19.3.1, server-only@0.0.1 (+4 more)

### Community 109 - "repository.ts"
Cohesion: 0.11
Nodes (24): dynamic, GET(), register(), requireAppUrlInProduction(), readSupabaseEnv(), requireSupabaseEnv(), resolveStorageMode(), StorageMode (+16 more)

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

### Community 114 - "leads.ts"
Cohesion: 0.33
Nodes (6): emailBlocks(), LEADS_ROUTE, LeadSubmission, sendLead(), warn(), Step: Send on advance

### Community 116 - "AnimationSettings.tsx"
Cohesion: 0.40
Nodes (4): ANIMATION_PRESETS, AnimationPreset, MAX_ANIMATION_MS, ScreenAnimation

### Community 118 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, typecheck

### Community 120 - "Steps"
Cohesion: 0.12
Nodes (16): allowedElement(), AI assistant, Deviations from the first design, Flow, Security, AI generation, Flow, Step: Brief wizard (+8 more)

### Community 121 - "public.ai_usage"
Cohesion: 0.36
Nodes (6): ai_usage_project_created_idx, assets_project_created_idx, funnels_ai_draft_expires_idx, public.ai_spend_since(), public.ai_usage, public.assets

## Knowledge Gaps
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `ImageAssets.tsx`, `web/package.json`, `webhook.ts`, `[id]/domains/route.ts`, `config.tsx`, `BriefWizard.tsx`, `FunnelEditor.tsx`, `next`, `index.ts`, `StudioShell.tsx`, `stripe-provider.ts`, `parseJsonBody`, `flow.tsx`, `verify.ts`, `react`, `inline.ts`, `guards.ts`, `api/leads/route.ts`, `images/route.ts`, `generate/route.ts`, `payments/types.ts`, `checkout/route.ts`, `getStudioContext`, `FunnelRuntime`, `actions.ts`, `draft/route.ts`, `guards.ts`, `next`, `dependencies`, `repository.ts`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FunnelEditor()` (e.g. with `What it does` and `Step: Chat panel`) actually correct?**
  _`FunnelEditor()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `ImageAssets.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._
- **Why does `react` connect `CheckoutPanel.tsx` to `ImageAssets.tsx`, `web/package.json`, `use-funnel-analytics.ts`, `config.tsx`, `BriefWizard.tsx`, `FunnelEditor.tsx`, `AddElementPanel.tsx`, `index.ts`, `StudioShell.tsx`, `use-draft-saver.ts`, `elements/layout.tsx`, `flow.tsx`, `StyleFields.tsx`, `paywall.tsx`, `react`, `styles.ts`, `catalog.tsx`, `inputs.tsx`, `next`, `DomainsPanel.tsx`, `CheckoutPanel.tsx`, `FunnelRuntime.tsx`, `index.ts`, `AssistantPanel.tsx`, `getStudioContext`, `ThemeEditor.tsx`, `actions.ts`, `react`, `dependencies`, `repository.ts`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `withStudio()` (e.g. with `Storage, auth and public read path (Stage 3)` and `Component responsibilities`) actually correct?**
  _`withStudio()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `Root Tooling and Lint` be split into smaller, more focused modules?**
  _Cohesion score 0.07357357357357357 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `repository.ts` to `web/package.json`, `webhook.ts`, `[id]/domains/route.ts`, `switch-platform-domain.mjs`, `next`, `ai/types.ts`, `payments/types.ts`, `stripe-provider.ts`, `verify.ts`, `supabase-funnel-repository.ts`, `inline.ts`, `guards.ts`, `api/leads/route.ts`, `ai/brief.ts`, `studio-overview.ts`, `generate/route.ts`, `solidgate-provider.ts`, `next`, `DomainsPanel.tsx`, `events.ts`, `chat.ts`, `google.ts`, `checkout/route.ts`, `getStudioContext`, `guards.ts`, `next`, `dependencies`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._