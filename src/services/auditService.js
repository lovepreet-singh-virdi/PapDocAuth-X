import { AuditLog } from "../models/sql/AuditLog.js";
import { User } from "../models/sql/User.js";
import { Organization } from "../models/sql/Organization.js";
import { computeAuditHash } from "./hashingService.js";

/**
 * Add audit entry with tamper-proof hash chaining
 */
export async function addAuditEntry({
  userId,
  orgId,
  docId,
  versionNumber,
  action,
  details
}) {
  try {
    // Get previous audit hash for this org+docId chain
    const prev = await AuditLog.findOne({
      where: { orgId, docId },
      order: [['timestamp', 'DESC']]
    });

    const timestampISO = new Date().toISOString();
    
    // Compute tamper-proof hash chain
    const auditHash = computeAuditHash({
      userId,
      orgId,
      docId,
      action,
      timestampISO,
      prevAuditHash: prev?.auditHash || ""
    });

    // Create audit log entry
    const entry = await AuditLog.create({
      userId,
      orgId,
      docId,
      action,
      prevAuditHash: prev?.auditHash || null,
      auditHash,
      timestamp: timestampISO
    });

    console.log(`✅ Audit logged: action=${action}, docId=${docId}, version=${versionNumber}`);
    return entry;
  } catch (err) {
    console.error("Audit log error:", err);
    // Don't throw - we don't want audit failures to break the main flow
    return null;
  }
}

/**
 * Get all audit logs (superadmin only)
 */
export async function getAllAuditLogs({ limit = 100, offset = 0 }) {
  return await AuditLog.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'role']
      },
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'slug']
      }
    ],
    order: [['timestamp', 'DESC']],
    limit,
    offset
  });
}

/**
 * Get audit logs for specific organization (admin can view their org)
 */
export async function getOrgAuditLogs({ orgId, limit = 100, offset = 0 }) {
  return await AuditLog.findAll({
    where: { orgId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'role']
      }
    ],
    order: [['timestamp', 'DESC']],
    limit,
    offset
  });
}

/**
 * Get audit logs for specific document
 */
export async function getDocumentAuditLogs({ docId, limit = 50 }) {
  return await AuditLog.findAll({
    where: { docId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'role']
      }
    ],
    order: [['timestamp', 'DESC']],
    limit
  });
}

/**
 * Verify audit chain integrity for an organization
 */
export async function verifyAuditChain({ orgId, docId }) {
  const logs = await AuditLog.findAll({
    where: { orgId, docId },
    order: [['timestamp', 'ASC']]
  });

  let isValid = true;
  const issues = [];

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const expectedPrevHash = i === 0 ? null : logs[i - 1].auditHash;

    if (log.prevAuditHash !== expectedPrevHash) {
      isValid = false;
      issues.push({
        logId: log.id,
        message: `Chain broken at log ${log.id}`,
        expected: expectedPrevHash,
        actual: log.prevAuditHash
      });
    }

    // Recompute hash to verify integrity
    const recomputedHash = computeAuditHash({
      userId: log.userId,
      orgId: log.orgId,
      docId: log.docId,
      action: log.action,
      timestampISO: log.timestamp,
      prevAuditHash: log.prevAuditHash || ""
    });

    if (recomputedHash !== log.auditHash) {
      isValid = false;
      issues.push({
        logId: log.id,
        message: `Hash mismatch at log ${log.id}`,
        expected: recomputedHash,
        actual: log.auditHash
      });
    }
  }

  return { isValid, totalLogs: logs.length, issues };
}
