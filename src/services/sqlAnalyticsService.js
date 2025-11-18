import { User } from "../models/sql/User.js";
import { Organization } from "../models/sql/Organization.js";
import { Role } from "../models/sql/Role.js";
import { UserRole } from "../models/sql/UserRole.js";
import { sequelize } from "../config/dbPostgres.js";

export const sqlAnalyticsService = {
  // Simple total user count
  totalUsers: () => User.count(),

  // Users grouped by role
  usersByRole: () =>
    UserRole.findAll({
      attributes: [
        "roleId",
        [sequelize.fn("COUNT", sequelize.col("roleId")), "count"]
      ],
      group: ["roleId", "Role.id"],    // include Role.id for Sequelize strict group
      include: [
        {
          model: Role,
          attributes: ["name"]
        }
      ]
    }),

  // Users grouped by organization
  usersByOrganization: () =>
    User.findAll({
      attributes: [
        "orgId",
        [sequelize.fn("COUNT", sequelize.col("orgId")), "count"]
      ],
      group: ["orgId", "organization.id"],   // must include alias in group
      include: [
        {
          model: Organization,
          as: "organization",
          attributes: ["name"]
        }
      ]
    })
};
