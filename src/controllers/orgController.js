import {
  createOrganization,
  createAdminForOrg,
} from "../services/orgService.js";

export const orgController = {
  createOrg: async (req, res, next) => {
    try {
      const { name } = req.body;
      const org = await createOrganization(name);

      res.status(201).json({
        success: true,
        message: "Organization created",
        org,
      });
    } catch (err) {
      next(err);
    }
  },

  createOrgAdmin: async (req, res, next) => {
    try {
      const { orgId } = req.params;
      const { fullName, email, password } = req.body;

      const admin = await createAdminForOrg({
        orgId,
        fullName,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        message: "Organization admin created",
        admin,
      });
    } catch (err) {
      next(err);
    }
  },
};
