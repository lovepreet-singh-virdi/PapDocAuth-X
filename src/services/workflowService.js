import { DocumentWorkflow } from "../models/sql/DocumentWorkflow.js";
import { User } from "../models/sql/User.js";
import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";
import { addAuditEntry } from "./auditService.js";

/**
 * Change document workflow state
 * Allowed states: APPROVED, PENDING, REVOKED
 */
export async function changeWorkflowState({ userId, orgId, documentId, versionNumber, state, reason }) {
  // Validate state
  const validStates = ["APPROVED", "PENDING", "REVOKED"];
  if (!validStates.includes(state)) {
    throw new Error(`Invalid state: ${state}. Must be one of: ${validStates.join(", ")}`);
  }

  // Find document and version
  const document = await Document.findOne({ docId: documentId }).lean();
  if (!document) {
    throw new Error("Document not found");
  }

  const version = await DocumentVersion.findOne({
    docId: documentId,
    versionNumber: versionNumber || document.currentVersion
  });

  if (!version) {
    throw new Error("Document version not found");
  }

  // Update version status in MongoDB
  version.workflowStatus = state;
  if (state === "REVOKED") {
    version.revokedAt = new Date();
    version.revokedByUserId = userId;
    version.revocationReason = reason || "No reason provided";
  } else if (state === "PENDING") {
    // Clear revocation fields if moving to PENDING
    version.revokedAt = undefined;
    version.revokedByUserId = undefined;
    version.revocationReason = undefined;
  }
  await version.save();

  // Record workflow change in PostgreSQL
  const workflowEntry = await DocumentWorkflow.create({
    docId: documentId,
    versionNumber: version.versionNumber,
    status: state,
    changedByUserId: userId,
    changedAt: new Date()
  });

  // Add audit entry
  const actionMap = {
    APPROVED: "APPROVE",
    REVOKED: "REVOKE",
    PENDING: "UPLOAD"  // Use UPLOAD for PENDING state changes
  };
  
  await addAuditEntry({
    userId,
    orgId,
    docId: documentId,
    versionNumber: version.versionNumber,
    action: actionMap[state],
    details: { state, reason }
  });

  return {
    documentId,
    versionNumber: version.versionNumber,
    newState: state,
    workflowEntryId: workflowEntry.id
  };
}

/**
 * Get workflow history for a document
 */
export async function getWorkflowHistory({ documentId, orgId, role }) {
  // Check document access
  const document = await Document.findOne({ docId: documentId }).lean();
  if (!document) {
    throw new Error("Document not found");
  }

  // Admin can only view their org's documents
  if (role !== "superadmin" && document.ownerOrgId !== orgId) {
    throw new Error("Access denied to this document");
  }

  // Get all workflow entries with user info
  const history = await DocumentWorkflow.findAll({
    where: { docId: documentId },
    include: [
      {
        model: User,
        as: "changedBy",
        attributes: ["id", "email", "fullName", "role"]
      }
    ],
    order: [["changedAt", "DESC"]]
  });

  return history.map(entry => ({
    id: entry.id,
    versionNumber: entry.versionNumber,
    state: entry.status,
    timestamp: entry.changedAt,
    actor: entry.changedBy?.fullName || entry.changedBy?.email || "Unknown",
    actorEmail: entry.changedBy?.email,
    actorRole: entry.changedBy?.role
  }));
}
