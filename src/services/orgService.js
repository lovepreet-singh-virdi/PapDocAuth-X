import bcrypt from "bcryptjs";
import { Organization } from "../models/sql/Organization.js";
import { User } from "../models/sql/User.js";

/**
 * Create a new organization.
 * Ensures unique organization name.
 */
export async function createOrganization(name) {
  const exists = await Organization.findOne({ where: { name } });
  if (exists) throw new Error("Organization already exists");

  return await Organization.create({ name });
}

/**
 * Create an admin user for an organization.
 * Role = admin, orgId must exist.
 */
export async function createAdminForOrg({ orgId, fullName, email, password }) {
  const org = await Organization.findByPk(orgId);
  if (!org) throw new Error("Organization not found");

  const exists = await User.findOne({ where: { email } });
  if (exists) throw new Error("Admin already exists with this email");

  const passwordHash = await bcrypt.hash(password, 10);

  return await User.create({
    fullName,
    email,
    passwordHash,
    role: "admin",
    orgId,
  });
}
