import { env } from "../config/env.js";
import { RefreshToken } from "../models/sql/RefreshToken.js";
import { registerUser, loginUser } from "../services/authService.js";
import jwt from "jsonwebtoken";

export const authController = {
  register: async (req, res) => {
    try {
      console.log("in register", JSON.stringify(req.body))
      const { email, password, role } = req.body;
      console.log("email---", req.body)
      const user = await registerUser(email, password, role);
      res.status(201).json({ message: "User registered", user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const { token, refreshToken, user } = await loginUser(email, password);
      res.json({ token, refreshToken, user });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      const stored = await RefreshToken.findOne({
        where: { token: refreshToken, revoked: false }
      });

      if (!stored) return res.status(401).json({ error: "Invalid refresh token" });
      if (new Date() > stored.expiresAt) return res.status(401).json({ error: "Refresh token expired" });

      const newAccessToken = jwt.sign(
        { userId: stored.userId },
        env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ token: newAccessToken });

    } catch (err) {
      res.status(401).json({ error: "Failed to refresh token" });
    }
  },
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      await RefreshToken.update(
        { revoked: true },
        { where: { token: refreshToken } }
      );

      res.json({ message: "Logged out successfully" });
    } catch (err) {
      res.status(400).json({ error: "Could not logout" });
    }
  }
};
