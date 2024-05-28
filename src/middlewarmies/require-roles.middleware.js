const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.role;
    const allowed = allowedRoles.some(role => userRoles.includes(role));
    if (!allowed) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }
    next();
  };
};

export { requireRoles }