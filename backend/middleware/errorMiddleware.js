const ErrorHandler = require('./errorHandler');

const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

const errorMiddleware = (error, req, res, next) => {
  console.error('Error middleware caught:', error.message || error);
  error.statusCode = error.statusCode || 500;

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const message = `Duplicate ${Object.keys(error.keyValue)} Entered`;
    error = new ErrorHandler(message, 400);
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((val) => val.message)
      .join(', ');
    error = new ErrorHandler(message, 400);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    const message = 'Invalid JWT token';
    error = new ErrorHandler(message, 401);
  }

  if (error.name === 'TokenExpiredError') {
    const message = 'JWT token has expired';
    error = new ErrorHandler(message, 401);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = { asyncHandler, errorMiddleware, ErrorHandler };
