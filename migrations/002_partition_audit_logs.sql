-- Partition audit logs by month for better performance
-- Learned from ADT course material on table partitioning

-- Backup data first
CREATE TABLE audit_logs_backup AS SELECT * FROM audit_logs;

-- Recreate as partitioned table
DROP TABLE audit_logs CASCADE;

CREATE TABLE audit_logs (
    id SERIAL,
    "userId" INTEGER,
    "orgId" INTEGER,
    "docId" VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    "prevAuditHash" VARCHAR(64),
    "auditHash" VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE audit_logs_2024_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

CREATE TABLE audit_logs_2024_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');

CREATE TABLE audit_logs_2024_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');

CREATE TABLE audit_logs_2024_09 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

CREATE TABLE audit_logs_2024_10 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

CREATE TABLE audit_logs_2024_11 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

CREATE TABLE audit_logs_2024_12 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE audit_logs_2025_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

CREATE TABLE audit_logs_2025_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

CREATE TABLE audit_logs_2025_05 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

CREATE TABLE audit_logs_2025_06 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

CREATE TABLE audit_logs_default PARTITION OF audit_logs DEFAULT;

-- Restore data
INSERT INTO audit_logs SELECT * FROM audit_logs_backup;

-- Recreate indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs("userId");
CREATE INDEX idx_audit_logs_org_id ON audit_logs("orgId");
CREATE INDEX idx_audit_logs_doc_id ON audit_logs("docId");
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_org_timestamp ON audit_logs("orgId", timestamp DESC);
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs("userId", timestamp DESC);
CREATE INDEX idx_audit_logs_prev_hash ON audit_logs USING HASH ("prevAuditHash");

-- Recreate foreign keys
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user 
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_org 
    FOREIGN KEY ("orgId") REFERENCES organizations(id) ON DELETE SET NULL;

ANALYZE audit_logs;
