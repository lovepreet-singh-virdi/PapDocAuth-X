import HashPart from "../models/mongo/HashPart.js";
import Document from "../models/mongo/Document.js";
import VerificationResult from "../models/mongo/VerificationResult.js";
import { VerificationStat } from "../models/sql/VerificationStat.js";

export function calculateTamperScore({ textSim, imageDiff, signatureMatch, stampMatch }) {
  let score = 0;

  score += (1 - textSim) * 40;
  score += imageDiff * 30;
  score += signatureMatch ? 0 : 15;
  score += stampMatch ? 0 : 15;

  return Math.min(100, Math.round(score));
}

export async function verifyDocument({ docId, userId, hashes }) {
  const doc = await Document.findOne({ docId });
  if (!doc) throw new Error("Document not found");

  const latest = await HashPart.findOne({
    docId,
    versionNumber: doc.currentVersion
  });

  if (!latest) throw new Error("No base hash found");

  // Simple matching (client can compute similarity)
  const textSim = hashes.textHash === latest.textHash ? 1 : 0;
  const imageDiff = hashes.imageHash === latest.imageHash ? 0 : 1;
  const signatureMatch = hashes.signatureHash === latest.signatureHash;
  const stampMatch = hashes.stampHash === latest.stampHash;

  const tamperScore = calculateTamperScore({
    textSim,
    imageDiff,
    signatureMatch,
    stampMatch
  });

  // Save verification result
  await VerificationResult.create({
    docId,
    versionNumber: doc.currentVersion,
    userId,
    tamperScore,
    textSimilarity: textSim,
    imageDiffScore: imageDiff,
    signatureMatch,
    stampMatch
  });

  // Update stats
  let stats = await VerificationStat.findOne({ where: { docId } });

  if (!stats) {
    stats = await VerificationStat.create({
      docId,
      totalVerifications: 1,
      avgTamperScore: tamperScore,
      lastVerifiedAt: new Date()
    });
  } else {
    const total = stats.totalVerifications + 1;
    stats.avgTamperScore =
      (stats.avgTamperScore * stats.totalVerifications + tamperScore) / total;

    stats.totalVerifications = total;
    stats.lastVerifiedAt = new Date();

    await stats.save();
  }

  return {
    tamperScore,
    textSim,
    imageDiff,
    signatureMatch,
    stampMatch
  };
}
