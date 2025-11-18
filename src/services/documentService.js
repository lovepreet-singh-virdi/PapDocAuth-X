import Document from "../models/mongo/Document.js";
import DocumentVersion from "../models/mongo/DocumentVersion.js";
import HashPart from "../models/mongo/HashPart.js";
import { computeMerkleRoot, sha256 } from "./hashingService.js";

export async function registerDocumentVersion({
  userId,
  docId,
  type,
  metadata,
  hashes
}) {

  let doc = await Document.findOne({ docId });

  if (!doc) {
    doc = await Document.create({
      docId,
      ownerUserId: userId,
      type,
      currentVersion: 1,
      metadata
    });
  } else {
    doc.currentVersion += 1;
    await doc.save();
  }

  const versionNumber = doc.currentVersion;

  // FIXED MERKLE CALL
  const merkleRoot = computeMerkleRoot({
    textHash: hashes.textHash,
    imageHash: hashes.imageHash,
    signatureHash: hashes.signatureHash,
    stampHash: hashes.stampHash
  });

  const prevVersion = await DocumentVersion.findOne({
    docId,
    versionNumber: versionNumber - 1
  });

  const prevHash = prevVersion ? prevVersion.versionHash : null;
  const versionHash = sha256((prevHash || "") + merkleRoot);

  const versionDoc = await DocumentVersion.create({
    docId,
    versionNumber,
    merkleRoot,
    prevVersionHash: prevHash,
    versionHash,
    changeDescription: "New upload or update"
  });

  await HashPart.create({
    versionId: versionDoc._id,
    textHash: hashes.textHash,
    imageHash: hashes.imageHash,
    signatureHash: hashes.signatureHash,
    stampHash: hashes.stampHash
  });

  return { docId, versionNumber, merkleRoot };
}
