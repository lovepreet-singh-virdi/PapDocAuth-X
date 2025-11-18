import { registerSuperadmin, login } from "../services/authService.js";

export const authController = {
  registerSuperadmin: async (req, res, next) => {
    try {
      const { fullName, email, password } = req.body;

      const setupKey = req.headers["x-setup-key"] || req.body.setupKey;

      const user = await registerSuperadmin({
        fullName,
        email,
        password,
        setupKey,
      });

      res.status(201).json({
        success: true,
        message: "Superadmin created successfully",
        user,
      });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const { token, user } = await login({ email, password });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          role: user.role,
          orgId: user.orgId,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
