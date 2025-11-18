import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/sql/User.js";
import { env } from "../config/env.js";

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
  const superadminExists = await User.findOne({
    where: { role: "superadmin" }
  });

  if (superadminExists) {
    throw new Error("Superadmin already initialized");
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
  const user = await User.findOne({ where: { email } });

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
