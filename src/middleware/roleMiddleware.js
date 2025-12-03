const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
};

const staffOnly = (req, res, next) => {
  if (req.user && req.user.role === 'STAFF') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Staff only.'
    });
  }
};

const staffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'STAFF' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Staff or Admin only.'
    });
  }
};

module.exports = {
  adminOnly,
  staffOnly,
  staffOrAdmin
};
