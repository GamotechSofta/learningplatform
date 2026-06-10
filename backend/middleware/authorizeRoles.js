const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error("Not authorized for this action");
  }

  next();
};

export default authorize;
