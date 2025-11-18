import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/sql/User.js";
import { Role } from "../models/sql/Role.js";
import { UserRole } from "../models/sql/UserRole.js";
import { env } from "../config/env.js";
import { RefreshToken } from "../models/sql/RefreshToken.js";
import crypto from "crypto";

export async function registerUser(email, password, roleName) {
  // 1. check existing user
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error("User already exists");

  // 2. Validate role
  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) throw new Error("Invalid role. Allowed: admin, verifier, user");

  // 3. Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // 4. Create user
  const user = await User.create({
    email,
    passwordHash
  });

  // 5. Insert into UserRoles table
  await UserRole.create({
    userId: user.id,
    roleId: role.id
  });

  // 6. Return cleaned user
  const cleanUser = user.get({ plain: true });
  delete cleanUser.passwordHash;

  return cleanUser;
}

export async function generateRefreshToken(userId) {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    userId,
    token,
    expiresAt,
    revoked: false
  });

  return token;
}

export async function loginUser(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { userId: user.id, email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  const refreshToken = await generateRefreshToken(user.id);

  return { token, refreshToken, user };
}
