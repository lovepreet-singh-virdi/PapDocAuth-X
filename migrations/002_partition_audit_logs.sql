-- Partition audit logs by month for better performance
-- Learned from ADT course material on table partitioning

-- Backup data first
CREATE TABLE "AuditLogs_backup" AS SELECT * FROM "AuditLogs";

-- Recreate as partitioned table
DROP TABLE "AuditLogs" CASCADE;

CREATE TABLE "AuditLogs" (
    id SERIAL,
    action VARCHAR(50) NOT NULL,
    "userId" INTEGER,
    "orgId" INTEGER,
    "docId" VARCHAR(100),
    details TEXT,
    "prevHash" VARCHAR(64),
    "currentHash" VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE "AuditLogs_2024_06" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

CREATE TABLE "AuditLogs_2024_07" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');

CREATE TABLE "AuditLogs_2024_08" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');

CREATE TABLE "AuditLogs_2024_09" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

CREATE TABLE "AuditLogs_2024_10" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

CREATE TABLE "AuditLogs_2024_11" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

CREATE TABLE "AuditLogs_2024_12" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE "AuditLogs_2025_01" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE "AuditLogs_2025_02" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE "AuditLogs_2025_03" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

CREATE TABLE "AuditLogs_2025_04" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

CREATE TABLE "AuditLogs_2025_05" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

CREATE TABLE "AuditLogs_2025_06" PARTITION OF "AuditLogs"
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

CREATE TABLE "AuditLogs_default" PARTITION OF "AuditLogs" DEFAULT;

-- Restore data
INSERT INTO "AuditLogs" SELECT * FROM "AuditLogs_backup";

-- Recreate indexes
CREATE INDEX idx_audit_logs_user_id ON "AuditLogs"("userId");
CREATE INDEX idx_audit_logs_org_id ON "AuditLogs"("orgId");
CREATE INDEX idx_audit_logs_doc_id ON "AuditLogs"("docId");
CREATE INDEX idx_audit_logs_timestamp ON "AuditLogs"(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON "AuditLogs"(action);
CREATE INDEX idx_audit_logs_org_timestamp ON "AuditLogs"("orgId", timestamp DESC);
CREATE INDEX idx_audit_logs_user_timestamp ON "AuditLogs"("userId", timestamp DESC);
CREATE INDEX idx_audit_logs_prev_hash ON "AuditLogs" USING HASH ("prevHash");

-- Recreate foreign keys
ALTER TABLE "AuditLogs" ADD CONSTRAINT fk_audit_logs_user 
    FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE SET NULL;

ALTER TABLE "AuditLogs" ADD CONSTRAINT fk_audit_logs_org 
    FOREIGN KEY ("orgId") REFERENCES "Organizations"(id) ON DELETE SET NULL;

ANALYZE "AuditLogs";
