# Supabase Migrations

Always create new migration files via:

```bash
npx supabase migration new <snake_case_name>
```

This generates `supabase/migrations/<14-digit-UTC-timestamp>_<name>.sql` matching the format the Supabase CLI + `schema_migrations` tracking table both expect.

To apply locally / to remote: `npx supabase db push`.

If you must apply via the `mcp__ab556fec...__apply_migration` MCP tool, be aware:

- The MCP tool generates its own `version` timestamp (server clock at apply-time) and writes the `name` argument verbatim into the `name` column.
- Pass `name` as a pure `snake_case_name` (no leading timestamp). After applying, look up the row in `supabase_migrations.schema_migrations` and rename your local file to use the recorded `version` as the prefix, e.g. `<recorded-version>_<your-name>.sql`. That keeps the tracking table and the file in lockstep.

The first migration in this directory (`20260522192648_pattern_e_add_featured_stickers.sql`) was created manually then applied via MCP; subsequent migrations should use the CLI workflow.
