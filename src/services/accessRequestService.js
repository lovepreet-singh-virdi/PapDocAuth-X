import { AccessRequest } from "../models/sql/AccessRequest.js";
import { User } from "../models/sql/User.js";

/**
 * Create a new access request
 */
export async function createAccessRequest({ name, organization, email, message }) {
  // Check if there's already a pending request from this email
  const existing = await AccessRequest.findOne({
    where: { email, status: "pending" },
  });

  if (existing) {
    throw new Error("You already have a pending access request. Please wait for review.");
  }

  return await AccessRequest.create({
    name,
    organization,
    email,
    message,
    status: "pending",
  });
}

/**
 * Get all access requests (superadmin only)
 */
export async function getAllAccessRequests(statusFilter) {
  const where = {};
  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter;
  }

  return await AccessRequest.findAll({
    where,
    include: [
      {
        model: User,
        as: "reviewer",
        attributes: ["id", "fullName", "email"],
      },
    ],
    order: [
      ["status", "ASC"], // pending first
      ["createdAt", "DESC"],
    ],
  });
}

/**
 * Update access request status (approve/reject)
 */
export async function updateAccessRequestStatus({ id, status, reviewedBy, reviewNotes }) {
  const request = await AccessRequest.findByPk(id);
  if (!request) {
    throw new Error("Access request not found");
  }

  if (request.status !== "pending") {
    throw new Error("This request has already been reviewed");
  }

  request.status = status;
  request.reviewedBy = reviewedBy;
  request.reviewedAt = new Date();
  request.reviewNotes = reviewNotes;

  await request.save();

  return request;
}
