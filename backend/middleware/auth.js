export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  if (req.session.user?.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Administrator access required.',
    });
  }

  next();
}