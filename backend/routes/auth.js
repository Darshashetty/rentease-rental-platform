const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { asyncHandler, ErrorHandler } = require('../middleware/errorMiddleware');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const crypto = require('crypto');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', validate(schemas.register), asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.validatedData;

  // Check if user exists
  let user = await User.findOne({ email });
  if (user) {
    throw new ErrorHandler('User already exists with that email', 400);
  }

  // Create user
  user = await User.create({
    name,
    email,
    password,
    role: role || 'tenant',
  });

  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', validate(schemas.login), asyncHandler(async (req, res) => {
  const { email, password } = req.validatedData;

  // Validate email & password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ErrorHandler('Invalid email or password', 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ErrorHandler('Invalid email or password', 401);
  }

  const token = user.getSignedJwtToken();

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
  });
}));

// @route   GET /api/auth/me
// @desc    Get current logged-in user
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    user,
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Forgot password - send reset email
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorHandler('User not found with that email', 404);
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // TODO: Send email with reset URL
  // For now, just return the token in development
  if (process.env.NODE_ENV === 'development') {
    res.json({
      success: true,
      message: 'Password reset link sent to email',
      resetUrl, // Only for development
    });
  } else {
    res.json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  }
}));

// @route   PUT /api/auth/reset-password/:resettoken
// @desc    Reset password
router.put('/reset-password/:resettoken', asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ErrorHandler('Please provide a password', 400);
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ErrorHandler('Invalid or expired reset token', 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  const token = user.getSignedJwtToken();

  res.json({
    success: true,
    token,
    message: 'Password reset successful',
  });
}));

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
router.put('/update-profile', protect, asyncHandler(async (req, res) => {
  const { name, phone, bio, address, preferences } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (bio) user.bio = bio;
  if (address) user.address = { ...user.address, ...address };
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout (client-side token removal)
router.post('/logout', protect, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

module.exports = router;
