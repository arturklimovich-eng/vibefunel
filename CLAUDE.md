## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.

## Documentation

- The studio serves `README.md`, `docs/*.md` and `docs/features/*.md` at `/studio/docs` (signed-in users only), read from disk per request.
- Feature pages (`docs/features/NN-name.md`) are graph-first: line 1 `# Title`, a `> summary` line, a mermaid flowchart whose nodes `click` to `#step-...` anchors or sibling `./NN-name.md` pages, then one `### Step: ...` section per node with Code, Data and Failure modes.
- When a change alters a flow, endpoint, table or failure mode, update the matching feature page and its graph in the same commit. A new feature gets a new page and a node on `docs/features/00-map.md`.

## Operations contract (MCP-readiness)

The platform exposes an MCP server for agents at `/api/mcp` (`apps/web/src/server/mcp`). Keep every change usable through it. The design and the tool table are in `docs/features/90-mcp.md`.

- Every change to a funnel definition is a `PatchOp` from `@funnel/schema`, applied with `applyPatch`. The editor UI, the AI assistant, the HTTP API and MCP all use the same ops. Components never mutate the definition directly.
- Domain rules (validation, reference cleanup, plan checks, element props) live in `packages/funnel-schema`. They do not go in React components or route handlers. The package reads no env vars; configuration such as the plan catalogue is passed in as arguments.
- Each operation has a zod input schema with `.describe()` on every field. The descriptions become the MCP tool and parameter descriptions, so write them for an agent that has never seen the UI.
- Errors are typed: `{ code, message, path? }` (see `ValidationIssue` in `packages/funnel-schema/src/validate.ts`). No bare strings, so an agent can tell what to fix.
- Route handlers stay thin: parse input, call a service in `apps/web/src/server/services/`, map the error. Services take `(ctx, input)` and do not import `next/*`, `react` or cookies.
- Portability: the product is handed over whole and operators run it on their own infrastructure with their own Supabase, payment provider, AI keys and analytics. Never hardcode hosts, keys or providers. Every external feature is optional, and its availability is known through a capabilities check. Every new env var goes into the table in `docs/DEPLOYMENT.md`. Everything works in both `FUNNEL_STORAGE` modes (`file` and `supabase`).
- Agent security: agent requests run as a user through the same RLS as the studio. Never use the service role for agent operations.
- A new operation means a `PatchOp` or service function plus a row in the tool table of `docs/features/90-mcp.md`.
