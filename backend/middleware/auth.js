const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, ErrorHandler } = require('./errorMiddleware');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ErrorHandler('Not authorized to access this route', 401);
  }

  // Reject invalid token strings
  if (token === 'undefined' || token === 'null') {
    throw new ErrorHandler('Not authorized to access this route', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      throw new ErrorHandler('User not found', 404);
    }
    next();
  } catch (error) {
    throw new ErrorHandler('Not authorized to access this route', 401);
  }
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ErrorHandler(
      `User role '${req.user.role}' is not authorized to access this route`,
      403
    );
  }
  next();
};

const ownerOrAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.id) {
    next();
  } else {
    throw new ErrorHandler('Not authorized to access this resource', 403);
  }
});

// Legacy support for 'admin' role requirement
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    throw new ErrorHandler('Not authorized as an admin', 403);
  }
};

module.exports = { protect, authorize, admin, ownerOrAdmin, asyncHandler };
