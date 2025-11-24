import { computeMerkleRoot } from "./hashingService.js";
import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";
import { addAuditEntry } from "./auditService.js";
import { WORKFLOW_STATUS } from "../constants/enums.js";



export async function verifyDocument({
  userId,
  orgId,
  docId,
  hashes
}) {

  const { textHash, imageHash, signatureHash, stampHash } = hashes;

  // Step 1: Recompute Merkle root from input
  const clientMerkleRoot = computeMerkleRoot({
    textHash,
    imageHash,
    signatureHash,
    stampHash
  });

  // Debug: Log provided hashes and computed Merkle root
  console.log('--- Verification Debug ---');
  console.log('Provided docId:', docId);
  console.log('Provided hashes:', { textHash, imageHash, signatureHash, stampHash });
  console.log('Computed client Merkle root:', clientMerkleRoot);

  // Step 2: Load root document
  const doc = await Document.findOne({ docId });
  if (!doc) {
    return {
      exists: false,
      message: "Document not found"
    };
  }


  // Step 3: Load latest APPROVED version
  const latest = await DocumentVersion.findOne({
    docId,
    workflowStatus: WORKFLOW_STATUS.APPROVED
  }).sort({ versionNumber: -1 });

  // Also fetch stored hashes for this version
  let storedHashes = null;
  if (latest) {
    const { versionNumber } = latest;
    const HashPart = (await import('../models/mongo/HashPart.js')).HashPart;
    storedHashes = await HashPart.findOne({ docId, versionNumber }).lean();
    if (storedHashes) {
      console.log('Stored hashes for latest version:', {
        textHash: storedHashes.textHash,
        imageHash: storedHashes.imageHash,
        signatureHash: storedHashes.signatureHash,
        stampHash: storedHashes.stampHash
      });
    } else {
      console.log('No stored hashes found for latest version:', versionNumber);
    }
    console.log('Stored Merkle root:', latest.merkleRoot);
  }

  if (!latest) {
    return {
      exists: true,
      approvedVersionExists: false,
      message: "No approved version found"
    };
  }

  const {
    versionNumber,
    merkleRoot: storedMerkleRoot,
    workflowStatus
  } = latest;

  // Step 4: Compare Merkle roots
  const cryptographicallyAuthentic = storedMerkleRoot === clientMerkleRoot;

  // Step 5: Revoked check (check if a later version is revoked)
  const revokedVersion = await DocumentVersion.findOne({
    docId,
    versionNumber,
    workflowStatus: WORKFLOW_STATUS.REVOKED
  });

  const isRevoked = Boolean(revokedVersion);

  // Step 6: Log audit
  // Use document.ownerOrgId for superadmin (orgId null/undefined)
  let auditOrgId = orgId;
  if (auditOrgId == null) {
    auditOrgId = doc.ownerOrgId;
  }
  await addAuditEntry({
    userId,
    orgId: auditOrgId,
    docId,
    versionNumber,
    action: "VERIFIED",
    details: `Verification performed on version ${versionNumber}`
  });

  return {
    exists: true,
    latestVersion: versionNumber,
    cryptographicallyAuthentic,
    isApprovedByAuthority: workflowStatus === WORKFLOW_STATUS.APPROVED,
    isRevoked,
    workflowStatus
  };
}
