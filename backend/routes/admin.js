const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Review = require('../models/Review');
const { asyncHandler, ErrorHandler } = require('../middleware/errorMiddleware');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard analytics
router.get('/dashboard', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProperties = await Property.countDocuments();
  const totalBookings = await Booking.countDocuments();
  const pendingApprovals = await Property.countDocuments({ status: 'Pending Approval' });

  const activeBookings = await Booking.countDocuments({ status: 'Active' });
  const completedBookings = await Booking.countDocuments({ status: 'Completed' });

  // Calculate revenue
  const bookings = await Booking.find({ status: { $in: ['Completed', 'Active'] } });
  const totalRevenue = bookings.reduce((sum, b) => sum + b.pricing.totalCost, 0);

  // Property stats
  const approvedProperties = await Property.countDocuments({ status: 'Approved' });
  const unavailableProperties = await Property.countDocuments({ 'availability.status': 'Unavailable' });

  // Recent bookings
  const recentBookings = await Booking.find()
    .populate('property', 'title')
    .populate('tenant', 'name email')
    .sort('-createdAt')
    .limit(5);

  res.json({
    success: true,
    dashboard: {
      userStats: {
        totalUsers,
        tenants: await User.countDocuments({ role: 'tenant' }),
        owners: await User.countDocuments({ role: 'owner' }),
      },
      propertyStats: {
        total: totalProperties,
        approved: approvedProperties,
        pending: pendingApprovals,
        unavailable: unavailableProperties,
      },
      bookingStats: {
        total: totalBookings,
        active: activeBookings,
        completed: completedBookings,
        pending: await Booking.countDocuments({ status: 'Pending' }),
      },
      financialStats: {
        totalRevenue,
        averageBookingValue: totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0,
      },
      recentBookings,
    },
  });
}));

// @route   GET /api/admin/properties/pending
// @desc    Get pending property approvals
router.get('/properties/pending', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const properties = await Property.find({ status: 'Pending Approval' })
    .populate('owner', 'name email phone')
    .sort('-createdAt');

  res.json({
    success: true,
    count: properties.length,
    properties,
  });
}));

// @route   PUT /api/admin/properties/:id/approve
// @desc    Approve a property
router.put('/properties/:id/approve', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ErrorHandler('Property not found', 404);
  }

  property.status = 'Approved';
  await property.save();

  res.json({
    success: true,
    message: 'Property approved successfully',
    property,
  });
}));

// @route   PUT /api/admin/properties/:id/reject
// @desc    Reject a property
router.put('/properties/:id/reject', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ErrorHandler('Property not found', 404);
  }

  property.status = 'Rejected';
  await property.save();

  res.json({
    success: true,
    message: 'Property rejected',
    property,
  });
}));

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;

  let filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .select('-password -resetPasswordToken -resetPasswordExpires')
    .skip(skip)
    .limit(Number(limit))
    .sort('-createdAt');

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    count: users.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
    users,
  });
}));

// @route   PUT /api/admin/users/:id/status
// @desc    Update user approval status
router.put('/users/:id/status', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { isApproved } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ErrorHandler('User not found', 404);
  }

  user.isApproved = isApproved;
  await user.save();

  res.json({
    success: true,
    message: 'User status updated',
    user,
  });
}));

// @route   GET /api/admin/bookings
// @desc    Get all bookings
router.get('/bookings', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  let filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const bookings = await Booking.find(filter)
    .populate('property', 'title')
    .populate('tenant', 'name email')
    .populate('owner', 'name email')
    .skip(skip)
    .limit(Number(limit))
    .sort('-createdAt');

  const total = await Booking.countDocuments(filter);

  res.json({
    success: true,
    count: bookings.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
    bookings,
  });
}));

// @route   GET /api/admin/analytics/revenue
// @desc    Get revenue analytics
router.get('/analytics/revenue', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;

  if (period === 'week') {
    startDate = new Date(now.setDate(now.getDate() - 7));
  } else if (period === 'month') {
    startDate = new Date(now.setMonth(now.getMonth() - 1));
  } else if (period === 'year') {
    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
  }

  const bookings = await Booking.find({
    createdAt: { $gte: startDate },
    status: { $in: ['Completed', 'Active'] },
  });

  const revenue = bookings.reduce((sum, b) => sum + b.pricing.totalCost, 0);

  res.json({
    success: true,
    period,
    revenue: revenue.toFixed(2),
    bookingCount: bookings.length,
  });
}));

// @route   GET /api/admin/reports
// @desc    Generate platform reports
router.get('/reports', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProperties,
    totalBookings,
    totalReviews,
  ] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Booking.countDocuments(),
    Review.countDocuments(),
  ]);

  const bookings = await Booking.find({ status: { $in: ['Completed', 'Active'] } });
  const totalRevenue = bookings.reduce((sum, b) => sum + b.pricing.totalCost, 0);

  res.json({
    success: true,
    report: {
      generatedAt: new Date().toISOString(),
      totalUsers,
      totalProperties,
      totalBookings,
      totalReviews,
      totalRevenue: totalRevenue.toFixed(2),
    },
  });
}));

module.exports = router;
