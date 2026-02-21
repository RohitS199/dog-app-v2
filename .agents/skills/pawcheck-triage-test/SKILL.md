---
name: pawcheck-triage-test
description: Quick triage testing against the check-symptoms Edge Function. Send individual symptom prompts and inspect the full response including urgency, type, filter violations, and sources. Use for manual testing, debugging, or verifying specific behaviors.
user_invocable: true
metadata:
  author: PawCheck Team
  tags: testing, triage, edge-function, debugging
---

# PawCheck Quick Triage Test

## Overview

Send individual symptom prompts to the `check-symptoms` Edge Function and inspect the full response. Useful for manual testing, debugging specific prompts, and verifying behaviors after changes.

## When to Use

- Testing a specific symptom prompt against the backend
- Debugging why a particular prompt gets the wrong urgency or type
- Verifying emergency bypass patterns work correctly
- Checking that the output filter catches specific language
- Testing off-topic detection
- Verifying source attribution for specific symptoms

## Quick Test

### Step 1: Get Auth Token

```bash
# Sign in as test user
TOKEN=$(curl -s -X POST \
  "https://wwuwosuysoxihtbykwgh.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"email":"stresstest.runner@test.local","password":"StressTest2026x"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])")
```

### Step 2: Send Prompt

```bash
curl -s -X POST \
  "https://wwuwosuysoxihtbykwgh.supabase.co/functions/v1/check-symptoms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "apikey: <ANON_KEY>" \
  -d '{"dog_id":"8e945de1-a1e6-47ba-9ede-a82ecab92ab9","symptoms":"<YOUR PROMPT HERE>"}' \
  | python3 -m json.tool
```

### Step 3: Inspect Response

Check these fields:
- `type`: Should be `triage`, `emergency_bypass`, or `off_topic`
- `urgency`: Should be `emergency`, `urgent`, `soon`, or `monitor`
- `headline`: Should be action-oriented, no diagnosis
- `educational_info`: Should use hedging language, cite sources
- `what_to_tell_vet`: Should be practical items, no treatment recommendations
- `sources`: Should reference real veterinary sources from RAG
- `show_poison_control`: Only on emergency_bypass for toxicity
- `_debug` (dev only): Shows raw_urgency, filter_violations, rag_chunks_found

## Test Scenarios

### Emergency Bypass (should return type: "emergency_bypass")

```
"My dog is having a seizure right now"
"She ate a whole bar of dark chocolate"
"He is vomiting blood everywhere"
"My dog was hit by a car"
"She ate some grapes"
"He collapsed and is unresponsive"
```

### Toxicity with Poison Control (should show_poison_control: true)

```
"My dog ate chocolate"
"She ate rat poison"
"He drank antifreeze"
"My puppy ate some xylitol gum"
```

### Off-Topic (should return type: "off_topic")

```
"My cat is sneezing"
"I have a headache"
"My rabbit won't eat"
```

### Monitor Level (should return urgency: "monitor" or "soon")

```
"My dog has been scratching his ear today"
"She has been scooting on the floor"
```

### Output Filter Test (should NOT contain diagnosis/treatment)

```
"My dog is limping, does she have hip dysplasia?"
"Can I give my dog Benadryl? How much?"
"My dog is fine, right? He just threw up once"
```

## Debugging Checklist

If a prompt returns unexpected results:

1. **Wrong type** (expected emergency_bypass, got triage):
   - Check `_shared/emergency.ts` for matching patterns
   - The LLM may still classify correctly even without bypass
   - Known gap: `cannot` vs `can't` patterns

2. **Wrong urgency**:
   - Check `_debug.raw_urgency` — was the LLM's original classification different?
   - Check `_debug.urgency_modified` — was it fuzzy-matched?
   - Check `_debug.urgency_floored` — was the urgency floor applied?

3. **Diagnosis language in response**:
   - Check `_debug.filter_violations` — did the filter catch it?
   - If not, add a new pattern to `output-filter.ts`
   - Remember to check `what_to_tell_vet` (now filtered as of v7)

4. **No sources**:
   - Check `_debug.rag_chunks_found` — were any RAG chunks retrieved?
   - If 0, the symptom may not match any knowledge base content
   - The urgency floor should bump "monitor" to "soon" in this case

5. **Rate limited (429)**:
   - The user has exceeded 10 requests/hour
   - Use the stress test bypass header: `x-stress-test-key: <service_role_key>`

## Test User Credentials

- **Email**: `stresstest.runner@test.local`
- **Password**: `StressTest2026x`
- **Dog ID**: `8e945de1-a1e6-47ba-9ede-a82ecab92ab9`
- **User ID**: `e3b5c33a-b7eb-44c9-86af-55db1cbf45a0`
