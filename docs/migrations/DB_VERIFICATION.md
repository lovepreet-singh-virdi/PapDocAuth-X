# DB Verification Output

This file contains the results of the verification queries run against the local Postgres database `papdocauthxv2`. The checks were executed with:

- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Database: `papdocauthxv2`
- (Password was supplied temporarily by the user for local checks)

---

## Index Count
- index_count: 652

## Materialized Views
- mv_document_activity
- mv_org_stats
- mv_user_activity

## Triggers (selected)
- prevent_audit_update / prevent_audit_delete on `audit_logs` and monthly partitions (examples):
  - `audit_logs`, `audit_logs_2024_06`, `audit_logs_2024_07`, `audit_logs_2024_08`, `audit_logs_2024_09`, `audit_logs_2024_10`, `audit_logs_2024_11`, `audit_logs_2024_12`, `audit_logs_2025_01`, `audit_logs_2025_02`, `audit_logs_2025_03`, `audit_logs_2025_04`, `audit_logs_2025_05`, `audit_logs_2025_06`, `audit_logs_default`
- users_update_timestamp on `users`
- orgs_update_timestamp on `organizations`

## Functions (selected)
- verify_audit_chain
- verify_audit_chain_recursive
- get_org_stats
- get_document_history
- get_user_activity_ranking
- get_document_verification_trends
- refresh_analytics_views
- prevent_audit_modification
- update_timestamp
- plus several `gtrgm_*` and `gin_trgm_*` helpers from the trigram extension

## Audit Partitions
Partitions found for `audit_logs`:
- audit_logs_2024_06
- audit_logs_2024_07
- audit_logs_2024_08
- audit_logs_2024_09
- audit_logs_2024_10
- audit_logs_2024_11
- audit_logs_2024_12
- audit_logs_2025_01
- audit_logs_2025_02
- audit_logs_2025_03
- audit_logs_2025_04
- audit_logs_2025_05
- audit_logs_2025_06
- audit_logs_default

## Top Tables by Size (selected)
- organizations — 4,336 kB
- users — 2,400 kB
- roles — 696 kB
- several `audit_logs_*` partitions at ~96 kB each

---

Notes
- These outputs were produced by a one-off verification script (`scripts/db_verify.cjs`) which was used to collect the above results and then removed from the repo as requested.
- If you want the raw JSON output included here (or appended as a timestamped file), I can add it.

If you'd like, I can also:
- Push the changes to a remote branch (e.g., `origin/chore/cleanup-migrations-docs`).
- Attach the raw JSON output as `docs/migrations/DB_VERIFICATION_YYYYMMDD.json`.
- Re-run additional checks (EXPLAIN ANALYZE for specific queries) and add the results to `BENCHMARKS.md`.
