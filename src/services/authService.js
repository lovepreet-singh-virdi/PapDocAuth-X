import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/sql/User.js";
import { Organization } from "../models/sql/Organization.js";
import { env } from "../config/env.js";

/**
 * Check if superadmin already exists
 */
export async function checkSuperadminExists() {
  const superadminExists = await User.findOne({
    where: { role: "superadmin" }
  });
  return !!superadminExists;
}

/**
 * Create superadmin (secured)
 */
export async function registerSuperadmin({ fullName, email, password, setupKey }) {

  // ENV LOCK
  if (env.allowSuperadminRegistration !== "true") {
    throw new Error("Superadmin registration is disabled");
  }

  // SETUP KEY CHECK
  if (env.setupKey && setupKey !== env.setupKey) {
    throw new Error("Invalid setup key");
  }

  // SELF-LOCKING: only allow when no superadmin exists
  const superadminExists = await checkSuperadminExists();

  if (superadminExists) {
    throw new Error("Superadmin already initialized. This endpoint is permanently locked.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    passwordHash,
    role: "superadmin",
    orgId: null,
  });

  return user;
}

/**
 * Login
 */
export async function login({ email, password }) {
const user = await User.findOne({
  where: { email },
  include: [
    {
      model: Organization,
      as: "organization"
    }
  ]
});

  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      orgId: user.orgId,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  return { token, user };
}

/**
 * Get all users (superadmin only)
 */
export async function getAllUsers() {
  return await User.findAll({
    attributes: ['id', 'fullName', 'email', 'role', 'orgId', 'createdAt'],
    include: [{
      model: Organization,
      as: 'organization',
      attributes: ['id', 'name', 'slug']
    }],
    order: [['createdAt', 'DESC']],
  });
}
