import {
  createOrganization,
  createAdminForOrg,
  createVerifierForOrg,
  getAllOrganizations,
  getOrganizationAdmins,
  getOrganizationUsers,
} from "../services/orgService.js";

export const orgController = {
  getAllOrgs: async (req, res, next) => {
    try {
      const orgs = await getAllOrganizations();
      res.json({
        success: true,
        organizations: orgs,
      });
    } catch (err) {
      next(err);
    }
  },

  getOrgAdmins: async (req, res, next) => {
    try {
      const { orgId } = req.params;
      const admins = await getOrganizationAdmins(orgId);
      res.json({
        success: true,
        admins,
      });
    } catch (err) {
      next(err);
    }
  },

  getOrgUsers: async (req, res, next) => {
    try {
      const { orgId } = req.params;
      const users = await getOrganizationUsers(orgId);
      res.json({
        success: true,
        users,
      });
    } catch (err) {
      next(err);
    }
  },

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
      const { name, email, password } = req.body;

      const admin = await createAdminForOrg({
        orgId,
        fullName: name,
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

  createOrgVerifier: async (req, res, next) => {
    try {
      const { orgId } = req.params;
      const { name, email, password } = req.body;

      // Permission check: admin can only create verifiers in their own org
      if (req.user.role === 'admin' && req.user.orgId !== parseInt(orgId)) {
        return res.status(403).json({
          success: false,
          error: "You can only create verifiers in your own organization",
        });
      }

      const verifier = await createVerifierForOrg({
        orgId,
        fullName: name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        message: "Verifier created successfully",
        verifier: {
          id: verifier.id,
          fullName: verifier.fullName,
          email: verifier.email,
          role: verifier.role,
          orgId: verifier.orgId,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
