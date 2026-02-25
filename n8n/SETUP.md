# PawCheck n8n Weekly Summary Workflow — Setup Guide

## Overview

This workflow triggers the `weekly-summary-update` Edge Function for each eligible dog every Monday at 3:00 AM Central Time. It compresses 14 days of check-in data into a rolling `health_summary` using Haiku 4.5.

**n8n Instance**: `ras199.app.n8n.cloud`

## Prerequisites

Before importing, you need two secrets from Supabase:

### 1. Supabase Service Role Key

**Where to find it**: Supabase Dashboard > Settings > API > `service_role` key (the **secret** one, NOT the anon key)

**How to store in n8n**:
1. Go to n8n Settings > Credentials
2. Create a new credential (type: "Header Auth" or generic credential)
3. Store the service role key value

**Used in**: The "Get Eligible Dogs" HTTP Request node needs this key in TWO headers:
- `apikey: <service_role_key>`
- `Authorization: Bearer <service_role_key>`

Both headers use the **same key** — this is Supabase's dual-header authentication pattern for RPC calls.

### 2. WEEKLY_SERVICE_KEY

**Where to find it**: This was generated during Phase 2 build and set as a Supabase Edge Function secret. If you have it stored, use it. If lost:

```bash
openssl rand -hex 32
```

Then update in **both** places:
- Supabase: Dashboard > Edge Functions > Secrets (or via CLI)
- n8n: Settings > Credentials

**Used in**: The "Call Weekly Summary" HTTP Request node as the `x-service-key` header.

### 3. Email Credentials (for failure alerts)

Configure SMTP credentials in n8n for sending failure notification emails to `rsandur19@gmail.com`. This can be:
- n8n's built-in email service
- A configured SMTP provider (Gmail, SendGrid, etc.)

## Import Steps

### Step 1: Import the Main Workflow

1. Open `ras199.app.n8n.cloud`
2. Click "Add workflow" or use Import
3. Import `weekly-summary-workflow.json`
4. **Wire up credentials**: Open each HTTP Request node and connect your stored credentials:
   - "Get Eligible Dogs" node: Set the `apikey` and `Authorization` header values to your Supabase service role key
   - "Call Weekly Summary" node: Set the `x-service-key` header value to your WEEKLY_SERVICE_KEY
5. Open the "Send Failure Email" node and verify the email credentials are configured

### Step 2: Import the Error Workflow

1. Import `weekly-summary-error-workflow.json` as a separate workflow
2. Wire up the email credentials in the "Send Error Email" node

### Step 3: Connect Error Workflow

1. Open the main "PawCheck Weekly Summary" workflow
2. Go to Settings (gear icon)
3. Set "Error Workflow" to "PawCheck Weekly Summary — Error Handler"
4. This ensures you get notified if the entire workflow fails (not just individual dogs)

### Step 4: Activate

1. Toggle the workflow to **Active** (the switch at the top right)
2. The Schedule Trigger will now fire every Monday at 3:00 AM Central

## Testing

### Pre-Test: Verify Credentials

Test each HTTP Request node individually before running the full workflow:

1. **Test RPC call**: Execute the "Get Eligible Dogs" node alone
   - Expected: JSON array with 4 dog_ids
   - If 401: Service role key is wrong or missing
   - If empty array: No eligible dogs (check `get_eligible_dogs_for_summary()` in Supabase)

2. **Test Edge Function call**: Execute the "Call Weekly Summary" node with a hardcoded dog_id
   - Expected: `{ "success": true, "dog_id": "...", "check_ins_processed": N, "summary_size": N }`
   - If 401: WEEKLY_SERVICE_KEY doesn't match between n8n and Supabase
   - If 400: Body expression isn't passing dog_id correctly

### Full Workflow Test

1. Use the **Manual Trigger** to run the full workflow
2. Watch the execution in n8n's Executions tab
3. After completion, verify in Supabase:

```sql
SELECT d.name, d.health_summary IS NOT NULL as has_summary,
       d.health_summary->>'last_updated' as last_updated
FROM dogs d
WHERE d.id IN (SELECT dog_id FROM get_eligible_dogs_for_summary());
```

4. Open the app > Health tab > verify HealthSummaryCard appears
5. **Billy special case**: Billy already has a health_summary — verify it was UPDATED (check `last_updated` timestamp changed)

### Error Path Test

1. Temporarily modify the "Call Weekly Summary" node body to use a fake dog_id (e.g., `00000000-0000-0000-0000-000000000000`)
2. Run via Manual Trigger
3. Verify:
   - The workflow continues past the failed item (Continue on Fail works)
   - Other dogs still get processed
   - The failure email is sent to `rsandur19@gmail.com`
4. **If the IF node doesn't route to email**: The condition expression may need adjustment for your n8n version's error object shape. Inspect the raw output of the failed "Call Weekly Summary" node to see what error properties exist, then update the IF condition accordingly.
5. **Revert** the fake dog_id after testing!

## Post-Build Checklist

- [ ] Schedule Trigger is set to Monday 3:00 AM America/Chicago
- [ ] Manual Trigger is connected and functional
- [ ] Credentials are stored in n8n's Credentials system (NOT hardcoded in nodes)
- [ ] Exporting the workflow JSON does NOT reveal credential values
- [ ] RPC call returns expected dog_ids (currently 4)
- [ ] Edge Function call succeeds for at least one dog
- [ ] `health_summary` is populated in the dogs table after a successful run
- [ ] "Continue on Fail" is enabled on the "Call Weekly Summary" node
- [ ] Failure email is sent when an error occurs
- [ ] Workflow is set to **Active**
- [ ] Error Workflow is configured (catches pre-batch failures)

## Workflow Drift Prevention

If you edit the workflow in n8n's UI after importing:

1. Re-export the workflow from n8n (Download > JSON)
2. Replace `n8n/weekly-summary-workflow.json` in the repo
3. Commit the updated JSON

This keeps the repo as the source of truth.

## Quick Reference

| Item | Value |
|------|-------|
| Supabase Project URL | `https://wwuwosuysoxihtbykwgh.supabase.co` |
| RPC Endpoint | `/rest/v1/rpc/get_eligible_dogs_for_summary` |
| Edge Function Endpoint | `/functions/v1/weekly-summary-update` |
| n8n Instance | `ras199.app.n8n.cloud` |
| Schedule | Monday 3:00 AM America/Chicago |
| Edge Function Auth Header | `x-service-key: <WEEKLY_SERVICE_KEY>` |
| RPC Auth Headers | `apikey` + `Authorization: Bearer` (both service role key) |
| Haiku Model | claude-haiku-4-5-20251001 |
| Currently Eligible Dogs | 4 |
| Alert Email | `rsandur19@gmail.com` |

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| RPC returns 401 | Service role key wrong | Check Supabase Dashboard > Settings > API |
| RPC returns empty `[]` | No eligible dogs | Run `SELECT * FROM get_eligible_dogs_for_summary()` in Supabase |
| Edge Function returns 401 | WEEKLY_SERVICE_KEY mismatch | Regenerate and update both Supabase + n8n |
| Edge Function returns 502 | Anthropic API error | Transient — will retry next week |
| No failure email sent | Email credentials not configured | Check n8n Settings > Credentials for SMTP setup |
| Workflow never fires | Not activated | Toggle the Active switch in n8n |
