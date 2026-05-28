# supabase/functions/ — Edge Function source

Source code for the project's Supabase Edge Functions. Each function gets its own subdirectory.

**Why this lives in the repo:** Before May 2026 the Edge Function source lived only on the Supabase dashboard and was edited there directly. Pattern E PR work surfaced the need to track backend changes through code review (12th sticker `tender_caretaker` was added to the frontend in PR #6 but the backend earn-rules pipeline had no record of it). Going forward, every backend change to a function in this directory must land via PR.

## Conventions

- One subdirectory per function, named after the deployed slug (e.g., `check-achievements/`)
- Entrypoint is always `index.ts`
- The runtime is **Deno**, not Node. Imports use URL form (`https://esm.sh/...`) or `jsr:` specifiers
- `verify_jwt` matches the project pattern: `false` because all functions validate JWTs internally (ES256/HS256 mismatch — see root CLAUDE.md)
- Functions deploy with the service role token; JWT only used for `auth.getUser()` inside the function

## TypeScript

The root `tsconfig.json` excludes `supabase/functions/**` so `npx tsc --noEmit` doesn't flag Deno-style URL imports and the `Deno.*` globals as errors. Type checking for these files happens inside the Supabase runtime at deploy time.

## Deploying

Use the Supabase MCP `deploy_edge_function` tool with the file contents and `verify_jwt: false`. Example:

```
mcp__ab556fec…__deploy_edge_function
  name: "check-achievements"
  entrypoint_path: "index.ts"
  verify_jwt: false
  files: [{ name: "index.ts", content: "<contents of supabase/functions/check-achievements/index.ts>" }]
```

Each deploy increments the function's version on Supabase. Always deploy AFTER the source change has been reviewed + merged via PR — production should always match an `origin/main` commit.

## Currently checked in

| Function | Purpose | Deployed version (last known) |
|---|---|---|
| `check-achievements` | Awards stickers based on user events (`dog_added`, `ai_insight_viewed`, `app_opened`, `flower_earned`) | v1 — pending deploy of the 12th-sticker mirror |

Other functions deployed on Supabase that are **NOT yet checked in**: `check-symptoms`, `analyze-patterns`, `delete-account`, `ai-health-analysis`, `weekly-summary-update`, `run-stress-test`, `run-ai-test`, `join-waitlist`. These should migrate in over time as they need updates.
