---
name: pawcheck-edge-deploy
description: Deploys and manages Supabase Edge Functions for PawCheck. Handles the check-symptoms pipeline, delete-account, and stress test functions. Knows about the verify_jwt workaround, file structure requirements, and deployment verification steps.
user_invocable: true
metadata:
  author: PawCheck Team
  tags: supabase, edge-functions, deployment, backend
---

# PawCheck Edge Function Deployment

## Overview

Manages deployment of Supabase Edge Functions for PawCheck. All functions use `verify_jwt: false` due to an ES256/HS256 JWT mismatch — they validate JWTs internally via `supabase.auth.getUser(token)`.

## When to Use

- After modifying any Edge Function code (output filter, emergency detection, system prompt, etc.)
- When deploying a new Edge Function
- When debugging deployment failures
- When verifying a deployed function works correctly

## Current Edge Functions

| Function | Version | Files | Purpose |
|----------|---------|-------|---------|
| `check-symptoms` | v7 | 6 files (1 entrypoint + 5 shared) | Core triage pipeline |
| `delete-account` | v1 | 1 file | Account deletion with anonymization |
| `run-stress-test` | v3 | 2 files (1 entrypoint + 1 prompts) | Automated testing |

## Deployment Process

### Step 1: Retrieve Current Source

Use the Supabase MCP tool to get the current source:

```
mcp__claude_ai_Supabase__get_edge_function({ function_slug: "check-symptoms" })
```

This returns all files with their current content.

### Step 2: Modify Code

Make changes to the relevant file(s). Common modification targets:

- **Output filter patterns**: `_shared/output-filter.ts` — add/modify blocked patterns
- **Emergency detection**: `_shared/emergency.ts` — add/modify regex patterns
- **System prompt**: `_shared/system-prompt.ts` — modify LLM behavior rules
- **Pipeline logic**: `source/index.ts` — modify the 16-step pipeline
- **Urgency validation**: `_shared/urgency.ts` — modify fuzzy matching, urgency floor

### Step 3: Deploy

Use the Supabase MCP tool with ALL files (not just modified ones):

```
mcp__claude_ai_Supabase__deploy_edge_function({
  name: "check-symptoms",
  entrypoint_path: "source/index.ts",
  verify_jwt: false,  // ALWAYS false — functions handle auth internally
  files: [
    { name: "source/index.ts", content: "..." },
    { name: "_shared/emergency.ts", content: "..." },
    { name: "_shared/off-topic.ts", content: "..." },
    { name: "_shared/output-filter.ts", content: "..." },
    { name: "_shared/urgency.ts", content: "..." },
    { name: "_shared/system-prompt.ts", content: "..." }
  ]
})
```

**CRITICAL**: You must include ALL files in the deployment, not just the ones you changed. Missing files will cause import errors.

### Step 4: Verify

Test the deployed function with a known prompt:

```bash
# Emergency bypass test
curl -s -X POST "https://wwuwosuysoxihtbykwgh.supabase.co/functions/v1/check-symptoms" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "apikey: <anon_key>" \
  -d '{"dog_id":"<dog_id>","symptoms":"my dog is having a seizure"}'
```

Expected: `type: "emergency_bypass"`, `urgency: "emergency"`

## check-symptoms File Structure

```
source/
  index.ts          # Main 16-step pipeline (entrypoint)
_shared/
  emergency.ts      # Emergency keyword/cluster/toxicity detection
  off-topic.ts      # Non-dog animal and human health detection
  output-filter.ts  # 23 blocked patterns (diagnosis, treatment, reassurance)
  urgency.ts        # Urgency validation, fuzzy matching, floor logic
  system-prompt.ts  # Full LLM system prompt with all rules
```

## Common Pitfalls

1. **Missing files**: Deploy with ALL files, not just changed ones
2. **verify_jwt must be false**: The ES256/HS256 mismatch causes 401 errors if JWT verification is enabled at the gateway level
3. **Regex global flag**: Output filter patterns use `/gi` flags. The `lastIndex` must be reset before each test (`pattern.lastIndex = 0`)
4. **Import paths**: Shared files use `../_shared/` relative imports from the entrypoint
5. **Deno runtime**: Edge Functions run on Deno, not Node. Use `Deno.env.get()` for env vars, `Deno.serve()` for the handler
6. **CORS headers**: All responses must include CORS headers (defined in `CORS_HEADERS` constant)

## Environment Variables (set in Supabase Dashboard)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Auto-set by Supabase |
| `SUPABASE_ANON_KEY` | Auto-set by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set; used for admin operations |
| `OPENAI_API_KEY` | For embeddings + GPT-4o-mini |
| `ENVIRONMENT` | Set to "development" to enable `_debug` in responses |

## Verification Checklist

After deployment, verify:
- [ ] Function returns 200 for a valid triage request
- [ ] Emergency bypass fires for known keywords (e.g., "seizure")
- [ ] Off-topic detection works (e.g., "my cat is sick")
- [ ] Rate limiting returns 429 after 10 requests/hour
- [ ] Output filter catches diagnostic language
- [ ] Audit log entries are written correctly
