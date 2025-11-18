import crypto from "crypto";
import { env } from "../config/env.js";

/**
 * SHA-256 hash helper
 */
export function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Compute Merkle Root from 4 multi-modal hash parts
 */
export function computeMerkleRoot({ textHash, imageHash, signatureHash, stampHash }) {
  // Step 1 – Leaf nodes as buffers
  const leaves = [
    Buffer.from(textHash, "hex"),
    Buffer.from(imageHash, "hex"),
    Buffer.from(signatureHash, "hex"),
    Buffer.from(stampHash, "hex"),
  ];

  // Step 2 – Hash leaf pairs
  const hashPair = (a, b) => {
    const combined = Buffer.concat([a, b]);
    return crypto.createHash("sha256").update(combined).digest();
  };

  // Level 1
  const level1_left = hashPair(leaves[0], leaves[1]);
  const level1_right = hashPair(leaves[2], leaves[3]);

  // Level 2 (root)
  const root = hashPair(level1_left, level1_right);

  return root.toString("hex");
}

/**
 * Compute versionHash = sha256(prevVersionHash + merkleRoot)
 */
export function computeVersionHash(prevVersionHash, merkleRoot) {
  const data = `${prevVersionHash || ""}${merkleRoot}`;
  return sha256(data);
}

/**
 * Compute audit chain hash
 * auditHash = sha256(userId + orgId + docId + action + timestamp + prevAuditHash + HASH_SECRET)
 */
export function computeAuditHash({
  userId,
  orgId,
  docId,
  action,
  timestampISO,
  prevAuditHash = "",
}) {
  const data = `${userId}${orgId}${docId}${action}${timestampISO}${prevAuditHash}${env.hashSecret}`;
  return sha256(data);
}
