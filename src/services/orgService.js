import bcrypt from "bcryptjs";
import { sequelize } from "../config/dbPostgres.js";
import { Organization } from "../models/sql/Organization.js";
import { User } from "../models/sql/User.js";

/**
 * Get all organizations.
 */
export async function getAllOrganizations() {
  return await Organization.findAll({
    order: [['createdAt', 'DESC']],
  });
}

/**
 * Get all admins for a specific organization.
 */
export async function getOrganizationAdmins(orgId) {
  const org = await Organization.findByPk(orgId);
  if (!org) throw new Error("Organization not found");

  return await User.findAll({
    where: {
      orgId,
      role: 'admin',
    },
    attributes: ['id', 'fullName', 'email', 'role', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });
}

/**
 * Get all users in a specific organization (admins and users)
 */
export async function getOrganizationUsers(orgId) {
  const org = await Organization.findByPk(orgId);
  if (!org) throw new Error("Organization not found");

  return await User.findAll({
    where: { orgId },
    attributes: ['id', 'fullName', 'email', 'role', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });
}

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
 * Uses Sequelize transaction for atomicity
 */
export async function createAdminForOrg({ orgId, fullName, email, password }) {
  const t = await sequelize.transaction();
  
  try {
    const org = await Organization.findByPk(orgId, { transaction: t });
    if (!org) throw new Error("Organization not found");

    const exists = await User.findOne({ where: { email }, transaction: t });
    if (exists) throw new Error("Admin already exists with this email");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role: "admin",
      orgId,
    }, { transaction: t });

    await t.commit();
    return user;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
