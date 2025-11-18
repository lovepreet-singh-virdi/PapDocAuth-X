// --------------------------------------------------------------
// PapDocAuthX+ FINAL SEED SERVICE (SQL + Mongo)
// --------------------------------------------------------------

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { sequelize } from "../config/sql.js";
import "../models/sql/index.js";   
// SQL Models
import { Role } from "../models/sql/Role.js";
import { User } from "../models/sql/User.js";
import { UserRole } from "../models/sql/UserRole.js";
import { Workflow } from "../models/sql/Workflow.js";
import { Revocation } from "../models/sql/Revocation.js";

import { VerificationStat } from "../models/sql/VerificationStat.js";

// Mongo Models
import Document from "../models/mongo/Document.js";
import DocumentVersion from "../models/mongo/DocumentVersion.js";
import HashPart from "../models/mongo/HashPart.js";
import VerificationResult from "../models/mongo/VerificationResult.js";

// Hash function
import crypto from "crypto";
import { faker } from "@faker-js/faker";

function sha256(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

/* ---------------------------- SEED SQL ------------------------------ */

async function seedSQL() {
  console.log("Seeding PostgreSQL...");


  // Recreate all tables
  await sequelize.sync({ force: true });
  console.log("[SQL] Models synced");

  // Seed Roles
  await Role.bulkCreate([
    { name: "admin" },
    { name: "verifier" },
    { name: "user" }
  ]);
  console.log("[SQL] Roles seeded");

  // Seed Users
  const users = [];
  for (let i = 1; i <= 20; i++) {
    users.push({
      email: `user${i}@example.com`,
      passwordHash: sha256(`pwd${i}`), // REAL hash
      publicKey: null
    });
  }

  const insertedUsers = await User.bulkCreate(users, { returning: true });
  console.log("[SQL] Users seeded");

  // Seed UserRoles
  const allRoles = await Role.findAll();
  for (const usr of insertedUsers) {
    const randRole = faker.helpers.arrayElement(allRoles);
    await UserRole.create({
      userId: usr.id,
      roleId: randRole.id
    });
  }

  console.log("[SQL] UserRoles seeded");

  // Seed Workflows
  await Workflow.bulkCreate([
    {
      docId: "DOC1001",
      fromState: null,
      toState: "UPLOADED",
      reason: "Initial creation"
    },
    {
      docId: "DOC1002",
      fromState: "UPLOADED",
      toState: "VERIFIED",
      reason: "Auto-verified"
    },
    {
      docId: "DOC1003",
      fromState: "UPLOADED",
      toState: "REVOKED",
      reason: "Auto-revoked"
    }
  ]);

  console.log("[SQL] Workflows seeded");

  // Seed Revocations
  await Revocation.create({
    docId: "DOC1003",
    version: 1,
    reason: "Testing seed"
  });

  console.log("[SQL] Revocations seeded");

  // Seed Verification Stats
  await VerificationStat.bulkCreate([
    { docId: "DOC1001", totalVerifications: 10, avgTamperScore: 0.15 },
    { docId: "DOC1002", totalVerifications: 5, avgTamperScore: 0.1 },
    { docId: "DOC1003", totalVerifications: 2, avgTamperScore: 0.5 }
  ]);

  console.log("[SQL] VerificationStats seeded");

  console.log("PostgreSQL seeding complete.");
}

/* ---------------------------- SEED MONGO ------------------------------ */

async function seedMongo() {
  console.log("\nSeeding MongoDB...");

  await Document.deleteMany({});
  await DocumentVersion.deleteMany({});
  await HashPart.deleteMany({});
  await VerificationResult.deleteMany({});

  // Get SQL users
  const sqlUsers = await User.findAll();
  const userIds = sqlUsers.map((u) => u.id);

  function pickUserId() {
    return faker.helpers.arrayElement(userIds);
  }

  // Seed Documents
  const doc1 = await Document.create({
    docId: "DOC1001",
    ownerUserId: pickUserId(),
    type: "degree"
  });

  const doc2 = await Document.create({
    docId: "DOC1002",
    ownerUserId: pickUserId(),
    type: "transcript"
  });

  console.log("[Mongo] Documents seeded");

  // Seed Versions
  const dv1 = await DocumentVersion.create({
    docId: "DOC1001",
    versionNumber: 1,
    versionHash: sha256("DOC1001_version1"),
    merkleRoot: sha256("DOC1001_hashparts_v1")
  });

  const dv2 = await DocumentVersion.create({
    docId: "DOC1002",
    versionNumber: 1,
    versionHash: sha256("DOC1002_version1"),
    merkleRoot: sha256("DOC1002_hashparts_v1")
  });

  console.log("[Mongo] DocumentVersions seeded");

  // Seed HashParts
  await HashPart.create({
    versionId: dv1._id,
    textHash: sha256("text1"),
    imageHash: sha256("img1"),
    signatureHash: sha256("sign1"),
    stampHash: sha256("stamp1")
  });

  await HashPart.create({
    versionId: dv2._id,
    textHash: sha256("text2"),
    imageHash: sha256("img2"),
    signatureHash: sha256("sign2"),
    stampHash: sha256("stamp2")
  });

  console.log("[Mongo] HashParts seeded");

  // Seed Verification Results
  await VerificationResult.create({
    docId: "DOC1001",
    result: "verified"
  });

  await VerificationResult.create({
    docId: "DOC1002",
    result: "failed"
  });

  console.log("[Mongo] VerificationResults seeded");

  console.log("MongoDB seeding complete.\n");
}

/* ---------------------------- RUN SEEDER ------------------------------ */

async function main() {
  try {
    console.log("Starting full database seed...\n");

    await sequelize.authenticate();
    console.log("[PostgreSQL] Connected");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("[MongoDB] Connected");

    await seedSQL();
    await seedMongo();

    console.log("\n🎉 FULL DATABASE SEED COMPLETED SUCCESSFULLY!");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ ERROR:", err);
    process.exit(1);
  }
}

main();
