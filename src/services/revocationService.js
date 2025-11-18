import { Revocation } from "../models/sql/Revocation.js";

export async function revokeDocument({ docId, version, userId, reason }) {
  return await Revocation.create({
    docId,
    version,
    revokedByUserId: userId,
    reason,
    isActive: true
  });
}

export async function checkRevocation(docId) {
  const revoked = await Revocation.findOne({
    where: { docId, isActive: true }
  });

  return revoked;
}
