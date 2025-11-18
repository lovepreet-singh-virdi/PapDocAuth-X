import crypto from "crypto";
import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";
import { addAuditEntry } from "./auditService.js";

function computeMerkleRoot({ textHash, imageHash, signatureHash, stampHash }) {
  const leaves = [textHash, imageHash, signatureHash, stampHash]
    .map(h => crypto.createHash("sha256").update(h).digest("hex"))
    .sort();

  const concatenated = leaves.join("");
  return crypto.createHash("sha256").update(concatenated).digest("hex");
}

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
    workflowStatus: "APPROVED"
  }).sort({ versionNumber: -1 });

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
    workflowStatus: "REVOKED"
  });

  const isRevoked = Boolean(revokedVersion);

  // Step 6: Log audit
  await addAuditEntry({
    userId,
    orgId,
    docId,
    versionNumber,
    action: "CRYPTO_CHECK",
    details: `crypto-check performed on version ${versionNumber}`
  });

  return {
    exists: true,
    latestVersion: versionNumber,
    cryptographicallyAuthentic,
    isApprovedByAuthority: workflowStatus === "APPROVED",
    isRevoked,
    workflowStatus
  };
}
