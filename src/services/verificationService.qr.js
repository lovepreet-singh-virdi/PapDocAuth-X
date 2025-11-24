import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";
import { addAuditEntry } from "./auditService.js";
import { WORKFLOW_STATUS } from "../constants/enums.js";

export async function verifyDocumentVersionHash({ userId, orgId, docId, versionHash }) {
  // Step 1: Load root document
  const doc = await Document.findOne({ docId });
  if (!doc) {
    return {
      exists: false,
      message: "Document not found"
    };
  }

  // Step 2: Find version by versionHash
  const version = await DocumentVersion.findOne({ docId, versionHash });
  if (!version) {
    return {
      exists: true,
      versionFound: false,
      message: "Version not found"
    };
  }

  // Step 3: Check status
  const isRevoked = version.workflowStatus === WORKFLOW_STATUS.REVOKED;
  const isApproved = version.workflowStatus === WORKFLOW_STATUS.APPROVED;

  // Step 4: Audit log (use doc.ownerOrgId for superadmin)
  let auditOrgId = orgId;
  if (auditOrgId == null) {
    auditOrgId = doc.ownerOrgId;
  }
  await addAuditEntry({
    userId,
    orgId: auditOrgId,
    docId,
    versionNumber: version.versionNumber,
    action: "VERIFIED",
    details: `QR/manual verification on version ${version.versionNumber}`
  });

  // Add cryptographicallyAuthentic for frontend compatibility
  return {
    exists: true,
    versionFound: true,
    versionNumber: version.versionNumber,
    isApproved,
    isRevoked,
    workflowStatus: version.workflowStatus,
    cryptographicallyAuthentic: isApproved && !isRevoked
  };
}
