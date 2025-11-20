# Remove 'user' from enum_users_role — Backup & Run Instructions

This document explains the safe steps to remove the `'user'` value from the Postgres `enum_users_role` type.

1) Backup your database

Use `pg_dump` to take a full logical backup before applying any destructive migration.

PowerShell example:

```powershell
pg_dump -h <host> -p <port> -U <user> -Fc -f papdocauthx_backup_$(Get-Date -Format yyyyMMdd_HHmmss).dump <database>
```

Replace `<host>`, `<port>`, `<user>`, and `<database>` with your environment values. The `-Fc` format produces a compressed custom-format dump that `pg_restore` can consume.

2) Verify there are no rows with `role = 'user'`

Run the verification query before applying the migration:

```sql
SELECT COUNT(*) as cnt FROM users WHERE role = 'user';
```

If the result is `0`, you can proceed. Otherwise, you must first migrate those rows to an allowed role (for example, `verifier`) or remove them.

3) Run migration script (recommended)

From the backend root, run:

```powershell
node src/migrations/remove-user-enum.js
```

The script will abort if it finds any rows with `role='user'`.

4) Alternative: Run the SQL directly

If you prefer to run the SQL from `DATABASE_MIGRATIONS.sql`, extract the `Safe removal` section and run it with `psql` or via your DB tool. Ensure you are connected to the correct database and have a backup.

5) Rollback plan

If anything goes wrong, restore from the `pg_dump` created earlier:

```powershell
pg_restore -h <host> -p <port> -U <user> -d <database> papdocauthx_backup_<timestamp>.dump
```

6) Notes

- Removing enum values requires creating a new enum type and switching the column to it. This script follows that pattern.
- Test this process in a staging copy of your DB before running on production.
