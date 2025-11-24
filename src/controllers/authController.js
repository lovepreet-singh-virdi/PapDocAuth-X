import { registerSuperadmin, login, checkSuperadminExists, getAllUsers } from "../services/authService.js";

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

  checkSuperadminStatus: async (req, res, next) => {
    try {
      const exists = await checkSuperadminExists();
      res.json({
        success: true,
        superadminExists: exists,
        registrationLocked: exists
      });
    } catch (err) {
      next(err);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const { limit = 50, offset = 0, search = '', role = '', orgId = '' } = req.query;
      const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 50, 100));
      const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
      const { users, total } = await getAllUsers({
        limit: parsedLimit,
        offset: parsedOffset,
        search,
        role,
        orgId,
      });
      res.json({
        success: true,
        users,
        total,
      });
    } catch (err) {
      next(err);
    }
  },
};
