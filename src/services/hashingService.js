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
// Unify Merkle root logic: hash each, sort, join, hash again (matches frontend and documentService.js)
export function computeMerkleRoot({ textHash, imageHash, signatureHash, stampHash }) {
  const hashes = [textHash, imageHash, signatureHash, stampHash];
  // Hash each part (as string)
  const hashed = hashes.map(h => sha256(h || ""));
  // Sort for deterministic order
  const sorted = hashed.sort();
  // Join and hash again
  const concatenated = sorted.join("");
  return sha256(concatenated);
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
