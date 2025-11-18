export function checkRole(requiredRoles) {
  return (req, res, next) => {
    const userRole = req.user.role;

    const needed = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];

    if (!needed.includes(userRole)) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }

    next();
  };
}
