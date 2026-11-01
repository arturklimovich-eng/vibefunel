# Graph Report - funnel-platform  (2026-11-01)

## Corpus Check
- 188 files · ~98,568 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .css 8, (none) 6, .example 1)

## Summary
- 1631 nodes · 4139 edges · 89 communities (75 shown, 14 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 313 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `458c9f83`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- withStudio
- web/package.json
- Status log
- Root Tooling and Lint
- Checkout and Status API
- supabase-funnel-repository.ts
- File Funnel Repository
- Puck Blocks Config
- leads/registry.ts
- payments/registry.ts
- FunnelEditor.tsx
- file-payment-store.ts
- Core DB Schema Migrations
- actions.ts
- Stripe Provider
- Funnel Schema and Theme
- solidgate-provider.ts
- validate.ts
- Supabase Funnel Repository
- webhook.ts
- StudioDashboard.tsx
- Payments DB Migrations
- mock/webhook/route.ts
- Web TS Config
- publish/route.ts
- getPublishedReader
- verify.ts
- types.ts
- file-funnel-repository.ts
- ScreenEditor.tsx
- Docker Compose
- Schema Package Manifest
- studio-overview.ts
- next
- Funnel Repository Interface
- funnelRoutes
- serve-check/route.ts
- Draft Saving and Validation
- DomainsPanel.tsx
- file-funnel-repository.ts
- RuntimeInner
- Schema TS Config
- README
- isMissingServiceKey
- docs/[slug]/page.tsx
- FunnelRuntime.tsx
- CheckoutPanel.tsx
- [id]/domains/route.ts
- apps_web_src_components_funneleditor_module
- Architecture
- run-storage.ts
- resolveStorageMode
- Seed Funnel
- Status log
- PaymentStore
- FilePaymentStore
- Security
- Steps
- store.ts
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- docs.ts
- Data flow
- email.ts
- ConditionPicker.tsx
- platform-host.ts
- Deployment
- ThemeEditor.tsx
- Steps
- payment-status.ts
- Steps
- layout.tsx
- repository.ts
- leads.ts
- Feature map
- Custom domains
- Analytics and consent
- Lead capture
- Checkout
- Auth and access
- layout.ts

## God Nodes (most connected - your core abstractions)
1. `FunnelEditor()` - 51 edges
2. `next` - 49 edges
3. `FileFunnelRepository` - 41 edges
4. `withStudio()` - 36 edges
5. `server-only` - 34 edges
6. `SupabaseFunnelRepository` - 29 edges
7. `Status log` - 29 edges
8. `react` - 28 edges
9. `FunnelRepository` - 24 edges
10. `getPaymentStore()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Storage, auth and public read path (Stage 3)` --references--> `withStudio()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/server/api-helpers.ts
- `Component responsibilities` --references--> `withStudio()`  [INFERRED]
  docs/C4.md → apps/web/src/server/api-helpers.ts
- `Step: List leads` --references--> `withStudio()`  [INFERRED]
  docs/features/25-lead-capture.md → apps/web/src/server/api-helpers.ts
- `Step: Daily report` --references--> `cronAuthorized()`  [INFERRED]
  docs/features/40-refunds-disputes.md → apps/web/src/server/cron-auth.ts

## Import Cycles
- None detected.

## Communities (89 total, 14 thin omitted)

### Community 0 - "withStudio"
Cohesion: 0.12
Nodes (25): Context, DELETE(), dynamic, Context, dynamic, GET(), PUT(), saveSchema (+17 more)

### Community 1 - "web/package.json"
Cohesion: 0.05
Nodes (52): dependencies, @funnel/schema@workspace:*, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2, posthog-node@5.59.0 (+44 more)

### Community 2 - "Status log"
Cohesion: 0.07
Nodes (49): ConsentBanner(), isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent() (+41 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "Checkout and Status API"
Cohesion: 0.31
Nodes (14): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), cookieNonces(), mergeRunCookie(), newPayerNonce() (+6 more)

### Community 5 - "supabase-funnel-repository.ts"
Cohesion: 0.07
Nodes (23): DefinitionInvalidError, DomainTakenError, ForbiddenError, PublishedFunnel, PublishedReader, parseStoredDefinition(), domainRowSchema, draftRowSchema (+15 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.18
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "Puck Blocks Config"
Cohesion: 0.10
Nodes (20): randomId(), ALLOWED_COMPONENTS, allowedComponentsForScreenType(), ButtonBlock(), buttonProps, checkoutBlockProps, CheckoutBlockView(), COMMON_BLOCKS (+12 more)

### Community 8 - "leads/registry.ts"
Cohesion: 0.11
Nodes (21): Context, dynamic, GET(), normalizeEmail(), csvCell(), HEADER, leadsToCsv(), FileLeadStore (+13 more)

### Community 9 - "payments/registry.ts"
Cohesion: 0.20
Nodes (16): dynamic, GET(), NO_STORE, querySchema, dynamic, POST(), MockProvider, getPaymentProvider() (+8 more)

### Community 10 - "FunnelEditor.tsx"
Cohesion: 0.13
Nodes (35): ChevronLeft(), ChevronRight(), CloseIcon(), CopyIcon(), DotsIcon(), ExternalIcon(), EyeIcon(), GearIcon() (+27 more)

### Community 11 - "file-payment-store.ts"
Cohesion: 0.16
Nodes (14): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), fileSchema, findAdjustmentTarget(), isNotFound() (+6 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.08
Nodes (39): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+31 more)

### Community 13 - "actions.ts"
Cohesion: 0.06
Nodes (53): accountClientKey(), authenticate(), AuthFormState, credentialsSchema, failureLimiter, hasControlCharacter(), isNonCredentialError(), NOT_A_CREDENTIAL_CHECK (+45 more)

### Community 14 - "Stripe Provider"
Cohesion: 0.21
Nodes (4): StripeProvider, PaymentProvider, ProviderNotConfiguredError, Stage 4: Payments

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.09
Nodes (22): animationPresetSchema, animationSchema, conditionSchema, edgeSchema, hasOversizedString(), ID_PATTERN, idSchema, MAX_CONTENT_ITEMS (+14 more)

### Community 16 - "solidgate-provider.ts"
Cohesion: 0.15
Nodes (16): apiKeys(), encryptIntent(), FAILED, Keys, metadataSchema, orderSchema, OrderSnapshot, safeEqual() (+8 more)

### Community 17 - "validate.ts"
Cohesion: 0.13
Nodes (21): retypeEdges(), RetypeResult, Stage 1: Minimal vertical slice (in progress), Edge, isQuizType(), Screen, getOptionLists(), isFallbackEdge() (+13 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.16
Nodes (7): DomainNotFoundError, FunnelNotFoundError, RevisionConflictError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel()

### Community 19 - "webhook.ts"
Cohesion: 0.13
Nodes (24): dynamic, POST(), isSolidgateConfigured(), isAdjustment(), PaymentAdjustment, emitAdjustment(), eventUuid(), isNamed() (+16 more)

### Community 20 - "StudioDashboard.tsx"
Cohesion: 0.13
Nodes (29): BookIcon(), FlowIcon(), HomeIcon(), LogoMark(), LogoutIcon(), PlusIcon(), SparkIcon(), compress() (+21 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.09
Nodes (24): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+16 more)

### Community 22 - "mock/webhook/route.ts"
Cohesion: 0.13
Nodes (24): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, dynamic, GET() (+16 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "publish/route.ts"
Cohesion: 0.15
Nodes (13): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), invalid(), ParsedBody, sizeLabel() (+5 more)

### Community 25 - "getPublishedReader"
Cohesion: 0.33
Nodes (8): CustomDomainFunnelPage(), dynamic, dynamic, PublishedFunnelPage(), getPublishedReader(), parseReturnParams(), SearchParams, single()

### Community 26 - "verify.ts"
Cohesion: 0.20
Nodes (15): RoutingStatus, txtRecordName(), txtRecordValue(), checkDomainDns(), checkOwnership(), checkRouting(), configuredDnsServers(), describe() (+7 more)

### Community 27 - "types.ts"
Cohesion: 0.09
Nodes (27): bodySchema, dynamic, dynamic, formSchema, POST(), isMockEnabled(), PAYER_HASH_PATTERN, adjustmentMetadataSchema (+19 more)

### Community 28 - "file-funnel-repository.ts"
Cohesion: 0.14
Nodes (15): AnimationSettings(), DefinitionCheck, isOlderDefinition(), parseInput(), clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition (+7 more)

### Community 29 - "ScreenEditor.tsx"
Cohesion: 0.07
Nodes (45): Bridge(), EditorBridgeState, EditorCommands, EditorSelection, ScreenEditor(), ScreenEditorProps, ScreenEditorSlots, usePuck (+37 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "studio-overview.ts"
Cohesion: 0.13
Nodes (22): revocationOf(), bucketIndex(), buildWindow(), DAY_FORMAT, FunnelRow, isPaid(), loadStudioOverview(), Metric (+14 more)

### Community 33 - "next"
Cohesion: 0.14
Nodes (5): Context, dynamic, GET(), dynamic, next

### Community 35 - "funnelRoutes"
Cohesion: 0.13
Nodes (22): DeleteFunnelButton(), formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, createdId(), NewFunnelForm() (+14 more)

### Community 36 - "serve-check/route.ts"
Cohesion: 0.29
Nodes (14): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), POST(), rateLimited(), stripPort() (+6 more)

### Community 37 - "Draft Saving and Validation"
Cohesion: 0.13
Nodes (19): ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure(), draftResponseSchema, DraftSaver, issueSchema (+11 more)

### Community 38 - "DomainsPanel.tsx"
Cohesion: 0.18
Nodes (16): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+8 more)

### Community 39 - "file-funnel-repository.ts"
Cohesion: 0.09
Nodes (24): DomainStatus, domainStatusSchema, resultSchema, rowSchema, domainFileSchema, isNotFound(), versionSummarySchema, DomainCheck (+16 more)

### Community 41 - "RuntimeInner"
Cohesion: 0.20
Nodes (14): FunnelRuntime(), longestPathFrom(), parseDefinition(), RuntimeInner(), retreat(), Flow, Public runtime, Related (+6 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "isMissingServiceKey"
Cohesion: 0.17
Nodes (13): dynamic, NO_STORE, POST(), Summary, dynamic, NO_STORE, POST(), Context (+5 more)

### Community 45 - "docs/[slug]/page.tsx"
Cohesion: 0.23
Nodes (10): DocsSearch(), DocsIndexPage(), dynamic, DocPage(), dynamic, studioShellProps(), uiFont, MermaidDiagrams() (+2 more)

### Community 46 - "FunnelRuntime.tsx"
Cohesion: 0.15
Nodes (21): contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS, ReturnParams (+13 more)

### Community 47 - "CheckoutPanel.tsx"
Cohesion: 0.16
Nodes (16): CheckoutPanel(), checkoutResponse, EmbeddedView(), isSafeRedirect(), sleep(), View, LoadState, PlanField() (+8 more)

### Community 48 - "[id]/domains/route.ts"
Cohesion: 0.24
Nodes (13): Context, dynamic, isDomainTaken(), POST(), bodySchema, Context, dynamic, GET() (+5 more)

### Community 49 - "apps_web_src_components_funneleditor_module"
Cohesion: 0.16
Nodes (11): Device, PreviewPane(), IssueList(), ValidationPanel(), ValidationPanelProps, formatDate(), VersionsPanel(), VersionsResponse (+3 more)

### Community 50 - "Architecture"
Cohesion: 0.22
Nodes (9): Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Repository layout, Stack, Storage, auth and public read path (Stage 3) (+1 more)

### Community 51 - "run-storage.ts"
Cohesion: 0.29
Nodes (14): loadUsableRun(), adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN, runIdKey() (+6 more)

### Community 52 - "resolveStorageMode"
Cohesion: 0.15
Nodes (16): AuthKeys, register(), requireAppUrlInProduction(), Bucket, clientIpHeader(), clientKeyFromHeaders(), defaultLimiter, DIRECT_KEY (+8 more)

### Community 53 - "Seed Funnel"
Cohesion: 0.39
Nodes (8): button(), createSeedFunnel(), heading(), options(), paragraph(), puck(), PuckItem, skipButton()

### Community 54 - "Status log"
Cohesion: 0.39
Nodes (8): Step: Screen routing, matches(), nextScreen(), NextScreenOptions, own(), Condition, isPaymentType(), isSkipType()

### Community 55 - "PaymentStore"
Cohesion: 0.16
Nodes (5): PaymentStore, rowRevocation(), SupabasePaymentStore, Data flow, Step: Access policy

### Community 57 - "Security"
Cohesion: 0.18
Nodes (11): Custom domains, Leads (personal data), Operational, Payment rules, Response headers, Runtime safety, Secrets policy, Security (+3 more)

### Community 59 - "Steps"
Cohesion: 0.18
Nodes (11): Flow, Refunds and disputes, Related, Step: Apply deferred, Step: Daily report, Step: Match payment, Step: Resolve metadata, Step: Runtime re-check (+3 more)

### Community 60 - "store.ts"
Cohesion: 0.16
Nodes (17): AdjustmentResult, FunnelPayment, RecordRejection, RecordResult, StaleDeferred, StatusDetail, StatusQuery, accessRowSchema (+9 more)

### Community 68 - "docs.ts"
Cohesion: 0.13
Nodes (10): devOrigins, nextConfig, privateHeaders, securityHeaders, DocEntry, DocGroup, listFeatures(), readOptional() (+2 more)

### Community 69 - "Data flow"
Cohesion: 0.18
Nodes (11): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 4. Checkout, webhook, status, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication (+3 more)

### Community 70 - "email.ts"
Cohesion: 0.20
Nodes (14): emailBlocks(), EmailBlock, emailBlocksOf(), EmailInputProps, emailKey(), isValidEmail(), EmailInputBlock(), LeadTarget (+6 more)

### Community 71 - "ConditionPicker.tsx"
Cohesion: 0.33
Nodes (10): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+2 more)

### Community 72 - "platform-host.ts"
Cohesion: 0.36
Nodes (10): appHost(), customHost(), extraPlatformHosts(), isPlatformHost(), requestHost, customDomainOrigin(), platformRequestOrigin(), requestProto() (+2 more)

### Community 73 - "Deployment"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 74 - "ThemeEditor.tsx"
Cohesion: 0.24
Nodes (9): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE (+1 more)

### Community 75 - "Steps"
Cohesion: 0.25
Nodes (7): Flow, Step: Create a funnel, Step: Load funnels, Step: Render, Steps, Studio overview, What it does

### Community 76 - "payment-status.ts"
Cohesion: 0.40
Nodes (5): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult

### Community 77 - "Steps"
Cohesion: 0.33
Nodes (5): toDomain(), Step: Add a hostname, Step: Hourly re-verification, Step: Warn, revoke, restore, Steps

### Community 79 - "repository.ts"
Cohesion: 0.18
Nodes (15): dynamic, PreviewPage(), dynamic, EditFunnelPage(), dynamic, StudioPage(), StorageMode, SupabaseDomainMaintenance (+7 more)

### Community 80 - "leads.ts"
Cohesion: 0.50
Nodes (4): LEADS_ROUTE, LeadSubmission, sendLead(), warn()

### Community 83 - "Feature map"
Cohesion: 0.40
Nodes (5): Background jobs, Feature map, How a funnel lives, Keeping these pages current, Map

### Community 84 - "Custom domains"
Cohesion: 0.40
Nodes (5): Custom domains, Domain status, Flow, Related, What it does

### Community 85 - "Analytics and consent"
Cohesion: 0.40
Nodes (5): Analytics and consent, Flow, Related, What is and is not sent, What it does

### Community 87 - "Lead capture"
Cohesion: 0.50
Nodes (4): Flow, Lead capture, Related, What it does

### Community 88 - "Checkout"
Cohesion: 0.50
Nodes (4): Checkout, Flow, Related, What it does

### Community 89 - "Auth and access"
Cohesion: 0.50
Nodes (4): Auth and access, Flow, Related, What it does

## Knowledge Gaps
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `withStudio`, `web/package.json`, `Checkout and Status API`, `Puck Blocks Config`, `leads/registry.ts`, `payments/registry.ts`, `FunnelEditor.tsx`, `actions.ts`, `webhook.ts`, `StudioDashboard.tsx`, `mock/webhook/route.ts`, `publish/route.ts`, `getPublishedReader`, `types.ts`, `funnelRoutes`, `serve-check/route.ts`, `isMissingServiceKey`, `docs/[slug]/page.tsx`, `[id]/domains/route.ts`, `layout.tsx`, `repository.ts`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FunnelEditor()` (e.g. with `toFlowNode()` and `What it does`) actually correct?**
  _`FunnelEditor()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `withStudio` be split into smaller, more focused modules?**
  _Cohesion score 0.11612903225806452 - nodes in this community are weakly interconnected._
- **Why does `react` connect `CheckoutPanel.tsx` to `web/package.json`, `Status log`, `funnelRoutes`, `Draft Saving and Validation`, `DomainsPanel.tsx`, `Puck Blocks Config`, `FunnelEditor.tsx`, `ThemeEditor.tsx`, `actions.ts`, `layout.tsx`, `FunnelRuntime.tsx`, `docs/[slug]/page.tsx`, `apps_web_src_components_funneleditor_module`, `repository.ts`, `StudioDashboard.tsx`, `ScreenEditor.tsx`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05152394775036284 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `mock/webhook/route.ts` to `withStudio`, `web/package.json`, `Status log`, `Checkout and Status API`, `supabase-funnel-repository.ts`, `leads/registry.ts`, `payments/registry.ts`, `file-payment-store.ts`, `actions.ts`, `solidgate-provider.ts`, `webhook.ts`, `verify.ts`, `types.ts`, `studio-overview.ts`, `DomainsPanel.tsx`, `file-funnel-repository.ts`, `isMissingServiceKey`, `docs/[slug]/page.tsx`, `[id]/domains/route.ts`, `resolveStorageMode`, `store.ts`, `docs.ts`, `email.ts`, `platform-host.ts`, `repository.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._