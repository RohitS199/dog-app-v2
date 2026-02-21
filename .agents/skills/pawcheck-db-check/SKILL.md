---
name: pawcheck-db-check
description: Verifies PawCheck database schema, RLS policies, foreign key constraints, audit log integrity, and data health. Use after migrations, schema changes, or when debugging data issues.
user_invocable: true
metadata:
  author: PawCheck Team
  tags: database, supabase, postgres, verification, rls
---

# PawCheck Database Health Check

## Overview

Comprehensive database verification for PawCheck's Supabase Postgres database. Checks schema integrity, RLS policies, foreign key behavior, audit log health, and data consistency.

## When to Use

- After running database migrations
- After creating new tables or modifying schemas
- When debugging "permission denied" or "RLS violation" errors
- Before and after account deletion testing
- When verifying audit log integrity for safety compliance

## Quick Health Check Queries

### 1. Table Existence Check

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables: `anonymized_safety_metrics`, `dog_health_content`, `documents` (legacy), `dogs`, `stress_test_results`, `triage_audit_log`, `user_acknowledgments`

### 2. RLS Status Check

```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN (
  'dogs', 'triage_audit_log', 'user_acknowledgments',
  'dog_health_content', 'anonymized_safety_metrics', 'stress_test_results'
);
```

Expected: ALL public tables should have `rowsecurity = true`. As of Feb 20, 2026: dogs, triage_audit_log, user_acknowledgments, dog_health_content, stress_test_results, anonymized_safety_metrics, documents.

### 3. Foreign Key Constraints

```sql
SELECT
  tc.table_name, kcu.column_name,
  ccu.table_name AS foreign_table, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

Expected FK behavior:

| Table | Column | References | Delete Rule |
|-------|--------|------------|-------------|
| dogs | user_id | auth.users | CASCADE |
| triage_audit_log | user_id | auth.users | SET NULL |
| triage_audit_log | dog_id | dogs | SET NULL |
| user_acknowledgments | user_id | auth.users | CASCADE |

### 4. Audit Log Urgency Values

```sql
SELECT output_urgency, COUNT(*) as count
FROM triage_audit_log
GROUP BY output_urgency
ORDER BY count DESC;
```

Expected values: `emergency`, `urgent`, `soon`, `monitor`. **No** `low`, `high`, `critical`, or other invalid values.

### 5. Invalid Urgency Detection

```sql
SELECT id, output_urgency, created_at
FROM triage_audit_log
WHERE output_urgency NOT IN ('emergency', 'urgent', 'soon', 'monitor')
LIMIT 10;
```

Expected: Empty result set.

### 6. Filter Violation Summary

```sql
SELECT filter_severity, COUNT(*) as count
FROM triage_audit_log
WHERE filter_severity IS NOT NULL AND filter_severity != 'none'
GROUP BY filter_severity
ORDER BY count DESC;
```

### 7. Anonymization Check (After Account Deletion)

```sql
-- Check anonymized metrics exist
SELECT COUNT(*) as metric_rows FROM anonymized_safety_metrics;

-- Check redacted records
SELECT COUNT(*) as redacted
FROM triage_audit_log
WHERE input_symptoms = '[REDACTED]' AND user_id IS NULL;
```

### 8. RAG Knowledge Base Health

```sql
SELECT
  COUNT(*) as total_chunks,
  COUNT(DISTINCT source_name) as unique_sources,
  AVG(source_tier) as avg_tier,
  MIN(source_tier) as min_tier,
  MAX(source_tier) as max_tier
FROM dog_health_content;
```

Expected: ~303 chunks, multiple sources, tiers 1-3.

### 9. User Acknowledgments Check

```sql
SELECT terms_version, COUNT(*) as acceptances
FROM user_acknowledgments
GROUP BY terms_version;
```

### 10. Rate Limit Verification

```sql
-- Check recent triage frequency per user (should not exceed 10/hour)
SELECT user_id, COUNT(*) as triages_last_hour
FROM triage_audit_log
WHERE created_at >= now() - interval '1 hour'
  AND is_off_topic = false
GROUP BY user_id
HAVING COUNT(*) > 10;
```

Expected: Empty (no users exceeding rate limit).

## MCP Tool Usage

Use the Supabase MCP tool for all queries:

```
mcp__claude_ai_Supabase__execute_sql({ query: "SELECT ..." })
```

**Important**: The parameter is `query`, NOT `sql`.

## Schema Documentation

### dogs
- `id` UUID PK, `user_id` UUID FK (CASCADE), `name` TEXT NOT NULL, `breed` TEXT, `age_years` NUMERIC CHECK (IS NULL OR >= 0), `weight_lbs` NUMERIC CHECK (IS NULL OR > 0), `vet_phone` TEXT, `created_at` TIMESTAMPTZ, `updated_at` TIMESTAMPTZ

### triage_audit_log
- `id` UUID PK, `user_id` UUID FK (SET NULL), `dog_id` UUID FK (SET NULL), `input_symptoms` TEXT NOT NULL, `output_urgency` TEXT NOT NULL, `raw_llm_urgency` TEXT, `urgency_validated` BOOLEAN, `sources_used` JSONB, `filter_violations` JSONB, `filter_severity` TEXT, `is_off_topic` BOOLEAN, `response_time_ms` INTEGER, `created_at` TIMESTAMPTZ

### user_acknowledgments
- `id` UUID PK, `user_id` UUID FK (CASCADE), `terms_version` TEXT NOT NULL, `accepted_at` TIMESTAMPTZ, UNIQUE(user_id, terms_version)

### anonymized_safety_metrics
- `id` UUID PK, `aggregated_at` TIMESTAMPTZ, `period_start` DATE, `period_end` DATE, urgency counts (4 columns), `off_topic_count`, `filter_violation_count`, `filter_critical_count`, `avg_response_time_ms`, `source_event` TEXT

## Common Issues

1. **"new row violates RLS policy"**: The INSERT doesn't include `user_id` matching `auth.uid()`. Fix: include `user_id: user.id` explicitly.
2. **Missing table**: Run the CREATE TABLE migration. Check `information_schema.tables`.
3. **FK violation on delete**: Check the delete rule. CASCADE deletes children. SET NULL nullifies references.
4. **Urgency "low" in audit log**: The backend returned an invalid urgency value. Check the fuzzy matching in `urgency.ts`.
