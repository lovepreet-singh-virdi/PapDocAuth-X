import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";
import { computeMerkleRoot, sha256 } from "../services/hashingService.js";
import { Organization } from "../models/sql/Organization.js";
import { WORKFLOW_STATUS } from "../constants/enums.js";

export const publicVerify = async (req, res) => {
  try {
    const { docId, versionHash, textHash, imageHash, signatureHash, stampHash } = req.body;
    
    console.log("hello in publicVerify", docId);
    console.log("Hashes received:", { textHash: !!textHash, imageHash: !!imageHash, signatureHash: !!signatureHash, stampHash: !!stampHash });
    
    // Validate input
    if (!docId) {
      return res.json({
        verified: false,
        reason: "DOC_NOT_FOUND",
        document: { docId: null, type: null, organization: null, latestVersion: null },
        version: { versionNumber: null, active: false, revoked: false }
      });
    }

    // Fetch Document
    const doc = await Document.findOne({ docId });
    if (!doc) {
      return res.json({
        verified: false,
        reason: "DOC_NOT_FOUND",
        document: { docId, type: null, organization: null, latestVersion: null },
        version: { versionNumber: null, active: false, revoked: false }
      });
    }

    // Get organization name
    const org = await Organization.findByPk(doc.ownerOrgId);

    // Latest approved or revoked version
    const latest = await DocumentVersion.findOne({
      docId,
      versionNumber: doc.currentVersion
    });

    if (!latest) {
      return res.json({
        verified: false,
        reason: "VERSION_NOT_FOUND",
        document: {
          docId,
          type: doc.type,
          organization: org?.name || null,
          latestVersion: null
        },
        version: { versionNumber: null, active: false, revoked: false }
      });
    }

    // Use hashes provided from frontend
    let merkleMatches = false;
    if (textHash || imageHash || signatureHash || stampHash) {
      try {
        const hashes = {
          textHash: textHash || latest.textHash || "",
          imageHash: imageHash || latest.imageHash || "",
          signatureHash: signatureHash || latest.signatureHash || "",
          stampHash: stampHash || latest.stampHash || ""
        };

        console.log("Generated hashes:", hashes);
        console.log("Stored hashes:", {
          textHash: latest.textHash,
          imageHash: latest.imageHash,
          signatureHash: latest.signatureHash,
          stampHash: latest.stampHash
        });

        const computedRoot = computeMerkleRoot(hashes);
        console.log("Computed merkle root:", computedRoot);
        console.log("Stored merkle root:", latest.merkleRoot);
        
        merkleMatches = computedRoot === latest.merkleRoot;
      } catch (hashError) {
        console.error("Error creating hash:", hashError);
        return res.status(400).json({
          verified: false,
          reason: "HASH_GENERATION_ERROR",
          error: hashError.message,
          document: {
            docId,
            type: doc.type,
            organization: org?.name || null,
            latestVersion: latest.versionNumber
          },
          version: {
            versionNumber: latest.versionNumber,
            active: latest.workflowStatus === WORKFLOW_STATUS.APPROVED,
            revoked: latest.workflowStatus === WORKFLOW_STATUS.REVOKED
          }
        });
      }
    }

    // If client provided only versionHash (QR flow)
    let versionMatches = false;
    if (versionHash) {
      versionMatches = versionHash === latest.versionHash;
    }

    const matched = merkleMatches || versionMatches;

    // Response builder
    const responseBase = {
      document: {
        docId,
        type: doc.type,
        organization: org?.name || null,
        latestVersion: latest.versionNumber
      },
      version: {
        versionNumber: latest.versionNumber,
        active: latest.workflowStatus === WORKFLOW_STATUS.APPROVED,
        revoked: latest.workflowStatus === WORKFLOW_STATUS.REVOKED
      }
    };

    // Determine result
    if (!matched) {
      return res.json({
        verified: false,
        reason: "HASH_MISMATCH",
        ...responseBase
      });
    }

    if (latest.workflowStatus === WORKFLOW_STATUS.REVOKED) {
      return res.json({
        verified: true,
        reason: "VALID_BUT_REVOKED",
        ...responseBase
      });
    }

    // VALID + APPROVED
    return res.json({
      verified: true,
      reason: "VALID_AND_ACTIVE",
      ...responseBase
    });

  } catch (err) {
    console.error("Public verify error:", err);
    return res.status(500).json({
      verified: false,
      reason: "SERVER_ERROR",
      error: err.message,
      document: null,
      version: null
    });
  }
};
