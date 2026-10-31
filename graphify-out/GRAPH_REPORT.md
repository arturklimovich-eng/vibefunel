# Graph Report - funnel-platform  (2026-10-31)

## Corpus Check
- 178 files · ~89,059 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 6, .css 6, .example 1)

## Summary
- 1497 nodes · 3726 edges · 83 communities (71 shown, 12 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 296 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `58369927`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- withStudio
- Web App Dependencies
- Analytics and Consent
- Root Tooling and Lint
- Checkout and Status API
- supabase-funnel-repository.ts
- File Funnel Repository
- Puck Blocks Config
- leads/registry.ts
- Payment Providers Registry
- Funnel Editor UI
- file-payment-store.ts
- Core DB Schema Migrations
- supabase-payment-store.ts
- Stripe Provider
- Funnel Schema and Theme
- index.ts
- Status log
- Supabase Funnel Repository
- webhook.ts
- server-only
- Payments DB Migrations
- mock/webhook/route.ts
- Web TS Config
- resolveStorageMode
- RuntimeInner
- verify.ts
- api/leads/route.ts
- file-funnel-repository.ts
- Puck Screen Adapters
- Docker Compose
- Schema Package Manifest
- rate-limit.ts
- next
- Funnel Repository Interface
- funnelRoutes
- types.ts
- Draft Saving and Validation
- Repository Audit Doc
- maintenance.ts
- Run Storage
- Schema TS Config
- README
- templates.ts
- DomainsPanel.tsx
- FunnelRuntime.tsx
- CheckoutPanel.tsx
- Data Flow Doc
- src/proxy.ts
- normalizeHostname
- repository.ts
- [id]/leads/route.ts
- Seed Funnel
- FilePaymentStore
- Deployment Doc
- isMissingServiceKey
- Docs Index
- Root Layout
- Steps
- store.ts
- Next.js Agent Notes
- Project CLAUDE.md
- Claude Skill Config
- Workspace Config
- ref_node_path
- ThemeEditor.tsx
- service.ts
- parseJsonBody
- VersionsPanel.tsx
- Feature map
- Custom domains
- Analytics and consent
- confirm/route.ts
- Checkout
- Auth and access
- leads.ts
- instrumentation.ts
- Lead capture

## God Nodes (most connected - your core abstractions)
1. `next` - 45 edges
2. `FileFunnelRepository` - 41 edges
3. `withStudio()` - 36 edges
4. `server-only` - 32 edges
5. `FunnelEditor()` - 31 edges
6. `SupabaseFunnelRepository` - 29 edges
7. `Status log` - 29 edges
8. `react` - 24 edges
9. `getPublishedReader()` - 24 edges
10. `FunnelRepository` - 23 edges

## Surprising Connections (you probably didn't know these)
- `What it does` --references--> `FunnelEditor()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/components/FunnelEditor.tsx
- `Known risks and open questions` --references--> `ScreenEditor()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/components/ScreenEditor.tsx
- `puck` --references--> `ScreenEditor()`  [INFERRED]
  docs/REPOSITORY_AUDIT.md → apps/web/src/components/ScreenEditor.tsx
- `Step: Autosave draft` --references--> `useDraftSaver()`  [INFERRED]
  docs/features/10-authoring.md → apps/web/src/lib/use-draft-saver.ts
- `Storage, auth and public read path (Stage 3)` --references--> `withStudio()`  [INFERRED]
  docs/ARCHITECTURE.md → apps/web/src/server/api-helpers.ts

## Import Cycles
- None detected.

## Communities (83 total, 12 thin omitted)

### Community 0 - "withStudio"
Cohesion: 0.06
Nodes (38): Context, DELETE(), dynamic, Context, dynamic, GET(), PUT(), saveSchema (+30 more)

### Community 1 - "Web App Dependencies"
Cohesion: 0.05
Nodes (49): dependencies, @funnel/schema@workspace:*, marked@18.1.1, mermaid@12.2.0, motion@14.7.1, next@16.4.3, posthog-js@1.441.2, posthog-node@5.59.0 (+41 more)

### Community 2 - "Analytics and Consent"
Cohesion: 0.09
Nodes (39): isBrowserAnalyticsConfigured(), startBrowserAnalytics(), trackBrowserEvent(), warn(), ConsentDecision, ConsentState, readConsent(), warn() (+31 more)

### Community 3 - "Root Tooling and Lint"
Cohesion: 0.07
Nodes (35): devDependencies, eslint@9.39.1, @eslint/js@9.39.1, eslint-plugin-react-hooks@5.2.0, globals@16.5.0, @next/eslint-plugin-next@16.4.3, prettier@3.9.10, supabase@2.122.0 (+27 more)

### Community 4 - "Checkout and Status API"
Cohesion: 0.29
Nodes (15): appOrigin(), bodySchema, dynamic, POST(), rateLimited(), getPaymentProvider(), cookieNonces(), mergeRunCookie() (+7 more)

### Community 5 - "supabase-funnel-repository.ts"
Cohesion: 0.08
Nodes (26): DefinitionInvalidError, DomainCheck, DomainLimitError, ForbiddenError, FunnelDraft, FunnelValidationError, MAX_AUTO_RECHECKS, RevisionConflictError (+18 more)

### Community 6 - "File Funnel Repository"
Cohesion: 0.18
Nodes (4): FileFunnelRepository, isRecord(), withRevision(), CustomDomain

### Community 7 - "Puck Blocks Config"
Cohesion: 0.08
Nodes (25): emailKey(), ALLOWED_COMPONENTS, ButtonBlock(), buttonProps, checkoutBlockProps, COMMON_BLOCKS, EmailInputBlock(), headingProps (+17 more)

### Community 8 - "leads/registry.ts"
Cohesion: 0.15
Nodes (11): FileLeadStore, fileSchema, isNotFound(), LeadFile, recordSchema, getLeadStore(), globalForLeads, LeadInput (+3 more)

### Community 9 - "Payment Providers Registry"
Cohesion: 0.15
Nodes (15): isMockEnabled(), MockProvider, SolidgateProvider, CheckoutInput, CheckoutResult, MockForbiddenError, PaymentEvent, PaymentProvider (+7 more)

### Community 10 - "Funnel Editor UI"
Cohesion: 0.12
Nodes (29): choiceToCondition(), ConditionPicker(), ConnectionChoice, decodeChoice(), encodeChoice(), isPaymentScreen(), normalizeChoice(), describeCondition() (+21 more)

### Community 11 - "file-payment-store.ts"
Cohesion: 0.16
Nodes (14): applyAdjustment(), applyDeferred(), Deferred, deferredSchema, eventKey(), fileSchema, findAdjustmentTarget(), isNotFound() (+6 more)

### Community 12 - "Core DB Schema Migrations"
Cohesion: 0.08
Nodes (39): funnel_versions_funnel_id_idx, funnel_versions_no_delete, funnel_versions_no_update, funnels_guard_write, funnels_project_id_idx, on_auth_user_created, project_members_fixed_keys, project_members_keep_owner (+31 more)

### Community 13 - "supabase-payment-store.ts"
Cohesion: 0.22
Nodes (5): RecordResult, rowRevocation(), SupabasePaymentStore, revocationOf(), Step: Access policy

### Community 14 - "Stripe Provider"
Cohesion: 0.14
Nodes (11): PAYER_HASH_PATTERN, adjustmentMetadataSchema, metadataSchema, STRIPE_API_VERSION, StripeProvider, StripeProviderDeps, PlanPriceMismatchError, ProviderNotConfiguredError (+3 more)

### Community 15 - "Funnel Schema and Theme"
Cohesion: 0.06
Nodes (39): AnimationSettings(), DefinitionCheck, isOlderDefinition(), parseInput(), clampScreenAnimation(), isRecord(), MIGRATIONS, RawDefinition (+31 more)

### Community 16 - "index.ts"
Cohesion: 0.39
Nodes (6): NewFunnelForm(), slugify(), FUNNELS_ROUTE, SLUG_INPUT_PATTERN, SLUG_MAX_LENGTH, SLUG_PATTERN

### Community 17 - "Status log"
Cohesion: 0.07
Nodes (43): retypeEdges(), Animation, Architecture, Data model, Deployment (Stage 5), Goals and non-goals, Known risks and open questions, Repository layout (+35 more)

### Community 18 - "Supabase Funnel Repository"
Cohesion: 0.15
Nodes (8): DomainNotFoundError, DomainTakenError, FunnelNotFoundError, fail(), SupabaseFunnelRepository, toDomain(), toFunnel(), Step: Projects and RLS

### Community 19 - "webhook.ts"
Cohesion: 0.15
Nodes (13): PaymentStore, isAdjustment(), PaymentAdjustment, emitAdjustment(), eventUuid(), isNamed(), processAdjustment(), processWebhook() (+5 more)

### Community 20 - "server-only"
Cohesion: 0.18
Nodes (14): Context, dynamic, isDomainTaken(), POST(), bodySchema, Context, dynamic, GET() (+6 more)

### Community 21 - "Payments DB Migrations"
Cohesion: 0.09
Nodes (24): payments_funnel_id_idx, payments_project_id_idx, payments_run_screen_idx, public.payment_events, public.payments, public.record_payment_event(), payments_run_screen_payer_idx, public.record_payment_event() (+16 more)

### Community 22 - "mock/webhook/route.ts"
Cohesion: 0.13
Nodes (22): Context, dynamic, POST(), publishSchema, unknownPlanKeys(), dynamic, GET(), CheckoutTarget (+14 more)

### Community 23 - "Web TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 24 - "resolveStorageMode"
Cohesion: 0.35
Nodes (7): readSupabaseEnv(), requireSupabaseEnv(), SupabaseEnv, SESSION_COOKIE_OPTIONS, SessionResult, createSupabaseAnonClient(), @supabase/ssr

### Community 25 - "RuntimeInner"
Cohesion: 0.13
Nodes (20): dynamic, PublishedFunnelPage(), dynamic, PreviewPage(), FunnelRuntime(), longestPathFrom(), parseDefinition(), RuntimeInner() (+12 more)

### Community 26 - "verify.ts"
Cohesion: 0.21
Nodes (17): POST(), RoutingStatus, txtRecordName(), txtRecordValue(), checkDomainDns(), checkDomainOwnership(), checkOwnership(), checkRouting() (+9 more)

### Community 27 - "api/leads/route.ts"
Cohesion: 0.15
Nodes (27): askSecretMatches(), dynamic, GET(), NO_STORE, rateLimited(), bodySchema, dynamic, POST() (+19 more)

### Community 28 - "file-funnel-repository.ts"
Cohesion: 0.14
Nodes (12): DraftSaver, domainFileSchema, isNotFound(), versionSummarySchema, PublishedFunnel, PublishedReader, parseStoredDefinition(), SupabasePublishedReader (+4 more)

### Community 29 - "Puck Screen Adapters"
Cohesion: 0.24
Nodes (14): PUCK_OVERRIDES, ScreenEditor(), ScreenEditorProps, applyOptionMode(), fromPuckData(), OptionRef, toPuckData(), blockId() (+6 more)

### Community 30 - "Docker Compose"
Cohesion: 0.12
Nodes (15): NEXT_PUBLIC_ANALYTICS_ANSWER_IDS, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, args, context, FUNNEL_STORAGE, services (+7 more)

### Community 31 - "Schema Package Manifest"
Cohesion: 0.14
Nodes (15): dependencies, zod@4.6.7, devDependencies, typescript@5.9.3, exports, typescript, zod, main (+7 more)

### Community 32 - "rate-limit.ts"
Cohesion: 0.21
Nodes (13): Bucket, clientIpHeader(), clientKeyFromHeaders(), defaultLimiter, LimitResult, trustedHops(), customDomainOrigin(), platformRequestOrigin() (+5 more)

### Community 33 - "next"
Cohesion: 0.05
Nodes (49): dynamic, accountClientKey(), authenticate(), AuthFormState, AuthKeys, credentialsSchema, failureLimiter, hasControlCharacter() (+41 more)

### Community 35 - "funnelRoutes"
Cohesion: 0.21
Nodes (14): formatDate(), Lead, leadSchema, LeadsPanel(), responseSchema, describe(), formatDate(), formatMoney() (+6 more)

### Community 36 - "types.ts"
Cohesion: 0.14
Nodes (17): dynamic, formSchema, POST(), dynamic, NO_STORE, querySchema, ACCESS_SUSPENDING_DISPUTES, planKeySchema (+9 more)

### Community 37 - "Draft Saving and Validation"
Cohesion: 0.16
Nodes (16): IssueList(), ValidationPanel(), ValidationPanelProps, ApiResult, apiResultSchema, AUTOSAVE_DELAY_MS, canonicalJson(), describeFailure() (+8 more)

### Community 38 - "Repository Audit Doc"
Cohesion: 0.14
Nodes (14): coolify, License table, Method, motion, Not integrated / rejected, posthog, puck, react-sdk (Solidgate) (+6 more)

### Community 39 - "maintenance.ts"
Cohesion: 0.18
Nodes (7): domainStatusSchema, resultSchema, rowSchema, DomainMaintenance, RecheckOutcome, RecheckResult, Custom domains (Stage 6)

### Community 41 - "Run Storage"
Cohesion: 0.26
Nodes (15): loadUsableRun(), randomId(), adoptRunId(), answersSchema, getOrCreateRunId(), loadRun(), persistedSchema, RUN_ID_PATTERN (+7 more)

### Community 42 - "Schema TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, isolatedModules, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 43 - "README"
Cohesion: 0.17
Nodes (11): Analytics (PostHog), Checks, Custom domains, Docker, Funnel Platform, Hosted Supabase, Local development with Supabase, Mock mode (development only) (+3 more)

### Community 44 - "templates.ts"
Cohesion: 0.41
Nodes (11): checkoutBlock(), createScreenContent(), heading(), nextButton(), optionList(), paragraph(), priceCard(), PuckItem (+3 more)

### Community 45 - "DomainsPanel.tsx"
Cohesion: 0.18
Nodes (16): describeError(), DomainsPanel(), errorSchema, formatDate(), Instructions(), summarize(), DomainCheckResponse, domainCheckResponseSchema (+8 more)

### Community 46 - "FunnelRuntime.tsx"
Cohesion: 0.14
Nodes (22): ConsentBanner(), contrastingForeground(), EmailBlock, foregroundForLuminance(), linearize(), parseChannel(), parseHex(), PRESETS (+14 more)

### Community 47 - "CheckoutPanel.tsx"
Cohesion: 0.21
Nodes (12): fetchPaymentStatus(), PublicStatus, retryAfterMs(), statusResponse, StatusResult, CheckoutPanel(), checkoutResponse, EmbeddedView() (+4 more)

### Community 48 - "Data Flow Doc"
Cohesion: 0.20
Nodes (10): 1. Data inventory, 2. Authoring: draft, publish, rollback, 3. Public runtime, 5. Refunds and disputes, 6. Analytics and consent, 7. Custom domains, 8. Authentication, 9. Trust boundaries (+2 more)

### Community 49 - "src/proxy.ts"
Cohesion: 0.25
Nodes (16): updateSession(), withSessionCookies(), config, CUSTOM_HOST_PATHS, isPrivatePage(), isProtected(), proxy(), route() (+8 more)

### Community 50 - "normalizeHostname"
Cohesion: 0.23
Nodes (14): POST(), CustomDomainFunnelPage(), dynamic, normalizeHostname(), stripPort(), customHost(), extraPlatformHosts(), isPlatformHost() (+6 more)

### Community 51 - "repository.ts"
Cohesion: 0.26
Nodes (13): dynamic, POST(), resolveStorageMode(), StorageMode, SupabaseDomainMaintenance, getPaymentStore(), getStripeProvider(), globalForPayments (+5 more)

### Community 52 - "[id]/leads/route.ts"
Cohesion: 0.24
Nodes (8): Context, dynamic, GET(), csvCell(), HEADER, leadsToCsv(), FunnelLead, Step: Export CSV

### Community 53 - "Seed Funnel"
Cohesion: 0.26
Nodes (11): RetypeResult, Edge, Screen, button(), createSeedFunnel(), heading(), options(), paragraph() (+3 more)

### Community 55 - "Deployment Doc"
Cohesion: 0.25
Nodes (8): Alternative: Coolify API per domain, Coolify, Custom domains for funnels, Deployment, Local image, Scheduled re-verification, TLS: Caddy with on-demand certificates (recommended), What the image needs

### Community 56 - "isMissingServiceKey"
Cohesion: 0.16
Nodes (12): dynamic, NO_STORE, Summary, dynamic, NO_STORE, POST(), Context, dynamic (+4 more)

### Community 57 - "Docs Index"
Cohesion: 0.42
Nodes (3): C4 model, Level 1: System context, Level 2: Containers

### Community 58 - "Root Layout"
Cohesion: 0.25
Nodes (3): metadata, viewport, react

### Community 59 - "Steps"
Cohesion: 0.17
Nodes (12): Flow, Refunds and disputes, Related, Step: Apply adjustment, Step: Apply deferred, Step: Defer adjustment, Step: Match payment, Step: Resolve metadata (+4 more)

### Community 60 - "store.ts"
Cohesion: 0.18
Nodes (16): AdjustmentResult, FunnelPayment, RecordRejection, StaleDeferred, StatusDetail, StatusQuery, accessRowSchema, funnelPaymentRowSchema (+8 more)

### Community 68 - "ref_node_path"
Cohesion: 0.33
Nodes (4): devOrigins, nextConfig, privateHeaders, securityHeaders

### Community 69 - "ThemeEditor.tsx"
Cohesion: 0.24
Nodes (9): COLOR_FIELDS, ColorField(), ColorKey, FontScaleField(), ThemeEditor(), colorSchema, MAX_FONT_SCALE, MIN_FONT_SCALE (+1 more)

### Community 71 - "service.ts"
Cohesion: 0.20
Nodes (7): createSupabaseServiceClient(), MissingServiceKeyError, toDomain(), leadRowSchema, ServiceClient, Step: Hourly re-verification, Step: Record the check

### Community 72 - "parseJsonBody"
Cohesion: 0.36
Nodes (7): invalid(), ParsedBody, parseJsonBody(), sizeLabel(), BodyResult, MAX_BODY_BYTES, readJsonBody()

### Community 73 - "VersionsPanel.tsx"
Cohesion: 0.18
Nodes (11): formatDate(), VersionsPanel(), VersionsResponse, versionsResponseSchema, Flow, Related, Step: Autosave draft, Step: Funnel versions (+3 more)

### Community 74 - "Feature map"
Cohesion: 0.40
Nodes (5): Background jobs, Feature map, How a funnel lives, Keeping these pages current, Map

### Community 75 - "Custom domains"
Cohesion: 0.40
Nodes (5): Custom domains, Domain status, Flow, Related, What it does

### Community 76 - "Analytics and consent"
Cohesion: 0.40
Nodes (5): Analytics and consent, Flow, Related, What is and is not sent, What it does

### Community 77 - "confirm/route.ts"
Cohesion: 0.43
Nodes (7): dynamic, escapeHtml(), GET(), hidden(), page(), querySchema, formatPrice()

### Community 78 - "Checkout"
Cohesion: 0.29
Nodes (7): Checkout, Flow, Related, Step: Advance funnel, Step: Verify webhook, Steps, What it does

### Community 79 - "Auth and access"
Cohesion: 0.50
Nodes (4): Auth and access, Flow, Related, What it does

### Community 80 - "leads.ts"
Cohesion: 0.33
Nodes (6): emailBlocks(), LEADS_ROUTE, LeadSubmission, sendLead(), warn(), Step: Send on advance

### Community 82 - "Lead capture"
Cohesion: 0.50
Nodes (4): Flow, Lead capture, Related, What it does

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `withStudio`, `Web App Dependencies`, `Checkout and Status API`, `Puck Blocks Config`, `Funnel Editor UI`, `index.ts`, `server-only`, `mock/webhook/route.ts`, `resolveStorageMode`, `RuntimeInner`, `api/leads/route.ts`, `types.ts`, `src/proxy.ts`, `normalizeHostname`, `repository.ts`, `[id]/leads/route.ts`, `isMissingServiceKey`, `Root Layout`, `parseJsonBody`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `FileFunnelRepository` (e.g. with `Module boundaries` and `Step: Funnel versions`) actually correct?**
  _`FileFunnelRepository` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `withStudio` be split into smaller, more focused modules?**
  _Cohesion score 0.06464646464646465 - nodes in this community are weakly interconnected._
- **Why does `server-only` connect `server-only` to `withStudio`, `Web App Dependencies`, `Analytics and Consent`, `Checkout and Status API`, `supabase-funnel-repository.ts`, `leads/registry.ts`, `Payment Providers Registry`, `file-payment-store.ts`, `Stripe Provider`, `webhook.ts`, `mock/webhook/route.ts`, `resolveStorageMode`, `verify.ts`, `api/leads/route.ts`, `file-funnel-repository.ts`, `rate-limit.ts`, `next`, `maintenance.ts`, `repository.ts`, `isMissingServiceKey`, `store.ts`, `service.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `withStudio()` (e.g. with `Storage, auth and public read path (Stage 3)` and `Component responsibilities`) actually correct?**
  _`withStudio()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `Web App Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.053877551020408164 - nodes in this community are weakly interconnected._
- **Why does `Status log` connect `Status log` to `withStudio`, `next`, `Analytics and Consent`, `service.ts`, `Run Storage`, `Payment Providers Registry`, `Stripe Provider`, `CheckoutPanel.tsx`, `store.ts`, `webhook.ts`, `RuntimeInner`, `file-funnel-repository.ts`, `Puck Screen Adapters`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._