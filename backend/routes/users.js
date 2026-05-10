const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { asyncHandler, ErrorHandler } = require('../middleware/errorMiddleware');
const { protect, ownerOrAdmin } = require('../middleware/auth');

// @route   GET /api/users/:id
// @desc    Get user profile
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpires');

  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  res.json({
    success: true,
    user,
  });
}));

// @route   GET /api/users/:id/profile
// @desc    Get detailed user profile with stats
router.get('/:id/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  let stats = {};

  if (user.role === 'owner') {
    const properties = await Property.find({ owner: req.params.id });
    const bookings = await Booking.find({ owner: req.params.id });
    const activeBookings = bookings.filter(b => b.status === 'Active').length;
    const completedBookings = bookings.filter(b => b.status === 'Completed').length;
    
    const totalRevenue = bookings
      .filter(b => b.status === 'Completed' || b.status === 'Active')
      .reduce((sum, b) => sum + b.pricing.totalCost, 0);

    stats = {
      totalProperties: properties.length,
      activeBookings,
      completedBookings,
      totalRevenue,
    };
  } else if (user.role === 'tenant') {
    const bookings = await Booking.find({ tenant: req.params.id });
    const activeBookings = bookings.filter(b => b.status === 'Active').length;
    const completedBookings = bookings.filter(b => b.status === 'Completed').length;

    stats = {
      totalBookings: bookings.length,
      activeBookings,
      completedBookings,
    };
  }

  res.json({
    success: true,
    user,
    stats,
  });
}));

// @route   PUT /api/users/:id
// @desc    Update user (own profile or admin)
router.put('/:id', protect, asyncHandler(async (req, res) => {
  // Check authorization
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    throw new ErrorHandler('Not authorized to update this user', 403);
  }

  const { name, phone, bio, address, preferences, profileImage } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (bio) user.bio = bio;
  if (profileImage) user.profileImage = profileImage;
  if (address) user.address = { ...user.address, ...address };
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  await user.save();

  res.json({
    success: true,
    message: 'User updated successfully',
    user,
  });
}));

// @route   GET /api/users/:id/favorites
// @desc    Get user's favorite properties
router.get('/:id/favorites', protect, asyncHandler(async (req, res) => {
  // Check authorization
  if (req.user.id !== req.params.id) {
    throw new ErrorHandler('Not authorized', 403);
  }

  const user = await User.findById(req.params.id).populate('favorites');

  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  res.json({
    success: true,
    count: user.favorites.length,
    favorites: user.favorites,
  });
}));

// @route   POST /api/users/:id/favorites/:propertyId
// @desc    Add property to favorites
router.post('/:id/favorites/:propertyId', protect, asyncHandler(async (req, res) => {
  // Check authorization
  if (req.user.id !== req.params.id) {
    throw new ErrorHandler('Not authorized', 403);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  const property = await Property.findById(req.params.propertyId);
  if (!property) {
    throw new ErrorHandler('Property not found', 404);
  }

  if (user.favorites.includes(req.params.propertyId)) {
    throw new ErrorHandler('Property already in favorites', 400);
  }

  user.favorites.push(req.params.propertyId);
  await user.save();

  res.json({
    success: true,
    message: 'Property added to favorites',
    favorites: user.favorites,
  });
}));

// @route   DELETE /api/users/:id/favorites/:propertyId
// @desc    Remove property from favorites
router.delete('/:id/favorites/:propertyId', protect, asyncHandler(async (req, res) => {
  // Check authorization
  if (req.user.id !== req.params.id) {
    throw new ErrorHandler('Not authorized', 403);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  user.favorites = user.favorites.filter(
    (fav) => fav.toString() !== req.params.propertyId
  );
  await user.save();

  res.json({
    success: true,
    message: 'Property removed from favorites',
    favorites: user.favorites,
  });
}));

module.exports = router;
