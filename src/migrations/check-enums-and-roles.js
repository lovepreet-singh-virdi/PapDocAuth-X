import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/dbPostgres.js';

async function runChecks() {
  try {
    console.log('Connecting to Postgres...');
    await sequelize.authenticate();
    console.log('Connected');

    // List values for enum_users_role
    console.log('\nenum_users_role values:');
    const [roles] = await sequelize.query("SELECT unnest(enum_range(NULL::enum_users_role)) AS role_value;");
    roles.forEach(r => console.log(' -', r.role_value));

    // List values for document workflow status enum
    console.log('\nenum_document_workflow_status values:');
    try {
      const [wf] = await sequelize.query("SELECT unnest(enum_range(NULL::enum_document_workflow_status)) AS status_value;");
      wf.forEach(s => console.log(' -', s.status_value));
    } catch (e) {
      console.log('  (could not read enum_document_workflow_status)', e.message);
    }

    // List values for audit logs action enum (try both known names)
    console.log('\naudit_logs action enum values:');
    try {
      const [a] = await sequelize.query("SELECT unnest(enum_range(NULL::enum_audit_logs_action)) AS action_value;");
      a.forEach(x => console.log(' -', x.action_value));
    } catch (e1) {
      try {
        const [a2] = await sequelize.query("SELECT unnest(enum_range(NULL::enum_audit_log_action)) AS action_value;");
        a2.forEach(x => console.log(' -', x.action_value));
      } catch (e2) {
        console.log('  (could not read audit_logs enum)', e1.message);
      }
    }

    // Count any remaining users with role = 'user' (compare as text to avoid enum parsing error)
    console.log('\nChecking for residual users with role=\'user\'...');
    const [cntRes] = await sequelize.query("SELECT COUNT(*)::int as cnt FROM users WHERE role::text = 'user';");
    const cnt = cntRes[0].cnt;
    console.log(` - rows with role='user': ${cnt}`);

    // Show a sample of users (first 5) — avoid referencing timestamp columns that may vary by schema
    console.log('\nSample users (first 5):');
    const [samples] = await sequelize.query("SELECT id, email, role FROM users ORDER BY id DESC LIMIT 5;");
    samples.forEach(u => console.log(` - ${u.id} | ${u.email} | ${u.role}`));

    await sequelize.close();
    console.log('\nChecks completed');
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

runChecks();
