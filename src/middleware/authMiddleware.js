import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserRole } from "../models/sql/UserRole.js";
import { Role } from "../models/sql/Role.js";

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Find the user role from SQL
    const userRoleRow = await UserRole.findOne({
      where: { userId: decoded.userId }
    });

    if (!userRoleRow) {
      return res.status(403).json({ error: "No role assigned to user" });
    }

    const role = await Role.findByPk(userRoleRow.roleId);

    if (!role) {
      return res.status(403).json({ error: "User role not found" });
    }

    // Attach full authenticated user details
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: role.name  
    };
    console.log("reqfinal--", req.user)

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
