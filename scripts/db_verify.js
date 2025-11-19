const { Client } = require('pg');

const cfg = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'papdocauthxv2',
};

const client = new Client(cfg);

const queries = [
  { name: 'index_count', sql: "SELECT COUNT(*) AS index_count FROM pg_indexes WHERE schemaname = 'public';" },
  { name: 'materialized_views', sql: "SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';" },
  { name: 'triggers', sql: "SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY event_object_table, trigger_name;" },
  { name: 'functions', sql: "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;" },
  { name: 'audit_partitions', sql: "SELECT inhrelid::regclass AS partition FROM pg_inherits JOIN pg_class parent ON pg_inherits.inhparent=parent.oid JOIN pg_class child ON pg_inherits.inhrelid=child.oid WHERE parent.relname = 'audit_logs' OR parent.relname = 'AuditLogs';" },
  { name: 'top_tables', sql: "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) AS total_size FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC LIMIT 10;" },
];

(async () => {
  try {
    await client.connect();
    console.log('Connected to Postgres at %s:%d/%s', cfg.host, cfg.port, cfg.database);

    for (const q of queries) {
      try {
        const res = await client.query(q.sql);
        console.log('\n---- ' + q.name + ' ----');
        console.log(JSON.stringify(res.rows, null, 2));
      } catch (err) {
        console.error('\nError running query', q.name, err.message);
      }
    }

    await client.end();
    console.log('\nAll queries finished.');
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
})();
