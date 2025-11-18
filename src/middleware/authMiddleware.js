import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ error: "Unauthorized" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, env.jwt.secret);

    req.user = decoded; // id, role, orgId
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
