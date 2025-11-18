import crypto from "crypto";
import { env } from "../config/env.js";

// Basic SHA256
export function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Merkle root generator for multimodal hashes
export function computeMerkleRoot({ textHash, imageHash, signatureHash, stampHash }) {
  const leaves = [textHash, imageHash, signatureHash, stampHash].map(h => sha256(h));

  if (leaves.length === 1) return leaves[0];

  let layer = leaves;

  while (layer.length > 1) {
    let next = [];

    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) {
        next.push(sha256(layer[i] + layer[i + 1]));
      } else {
        next.push(layer[i]); // carry forward
      }
    }

    layer = next;
  }

  return layer[0];
}

// Audit logging hash chain
export function computeAuditHash({ userId, docId, action, prevAuditHash, timestamp }) {
  const raw = `${userId}:${docId}:${action}:${timestamp}:${prevAuditHash}:${env.HASH_SECRET}`;
  return sha256(raw);
}
