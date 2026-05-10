const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { asyncHandler, ErrorHandler } = require('../middleware/errorMiddleware');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// @route   POST /api/bookings
// @desc    Create a booking request
router.post('/', protect, authorize('tenant'), validate(schemas.booking), 
  asyncHandler(async (req, res) => {
    const { property, checkInDate, checkOutDate, requestMessage } = req.validatedData;

    // Get property details
    const propertyDoc = await Property.findById(property);
    if (!propertyDoc) {
      throw new ErrorHandler('Property not found', 404);
    }

    if (propertyDoc.availability.status !== 'Available') {
      throw new ErrorHandler('Property is not available for booking', 400);
    }

    // Calculate rental duration
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const rentalDuration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24 * 30));

    if (rentalDuration < propertyDoc.pricing.minimumTenure) {
      throw new ErrorHandler(
        `Minimum rental duration is ${propertyDoc.pricing.minimumTenure} month(s)`,
        400
      );
    }

    // Calculate total cost
    const totalCost = (propertyDoc.pricing.monthlyRent * rentalDuration) + propertyDoc.pricing.securityDeposit;

    // Check for duplicate bookings
    const existingBooking = await Booking.findOne({
      property,
      tenant: req.user.id,
      status: { $in: ['Pending', 'Confirmed', 'Active'] },
    });

    if (existingBooking) {
      throw new ErrorHandler('You already have an active booking for this property', 400);
    }

    const booking = await Booking.create({
      property,
      tenant: req.user.id,
      owner: propertyDoc.owner,
      bookingDates: {
        checkInDate,
        checkOutDate,
      },
      rentalDuration,
      pricing: {
        monthlyRent: propertyDoc.pricing.monthlyRent,
        securityDeposit: propertyDoc.pricing.securityDeposit,
        totalCost,
      },
      requestMessage,
      deliveryAddress: req.body.deliveryAddress,
    });

    await booking.populate('property', 'title images');
    await booking.populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      booking,
    });
  })
);

// @route   GET /api/bookings
// @desc    Get user's bookings
router.get('/', protect, asyncHandler(async (req, res) => {
  const { status, role } = req.query;

  let filter = {};

  if (req.user.role === 'tenant') {
    filter.tenant = req.user.id;
  } else if (req.user.role === 'owner') {
    filter.owner = req.user.id;
  }

  if (status) {
    filter.status = status;
  }

  const bookings = await Booking.find(filter)
    .populate('property', 'title images location pricing')
    .populate('tenant', 'name email phone profileImage')
    .populate('owner', 'name email phone profileImage')
    .sort('-createdAt');

  res.json({
    success: true,
    count: bookings.length,
    bookings,
  });
}));

// @route   GET /api/bookings/:id
// @desc    Get single booking
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('property')
    .populate('tenant', 'name email phone profileImage')
    .populate('owner', 'name email phone profileImage');

  if (!booking) {
    throw new ErrorHandler('Booking not found', 404);
  }

  // Check authorization
  if (
    booking.tenant.toString() !== req.user.id &&
    booking.owner.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new ErrorHandler('Not authorized to view this booking', 403);
  }

  res.json({
    success: true,
    booking,
  });
}));

// @route   PUT /api/bookings/:id/approve
// @desc    Approve booking (owner only)
router.put('/:id/approve', protect, authorize('owner', 'admin'), 
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw new ErrorHandler('Booking not found', 404);
    }

    // Check authorization
    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ErrorHandler('Not authorized to approve this booking', 403);
    }

    if (booking.status !== 'Pending') {
      throw new ErrorHandler('Only pending bookings can be approved', 400);
    }

    booking.status = 'Confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking approved successfully',
      booking,
    });
  })
);

// @route   PUT /api/bookings/:id/reject
// @desc    Reject booking (owner only)
router.put('/:id/reject', protect, authorize('owner', 'admin'), 
  asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw new ErrorHandler('Booking not found', 404);
    }

    // Check authorization
    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ErrorHandler('Not authorized to reject this booking', 403);
    }

    if (booking.status !== 'Pending') {
      throw new ErrorHandler('Only pending bookings can be rejected', 400);
    }

    booking.status = 'Rejected';
    booking.adminNotes = reason;
    await booking.save();

    res.json({
      success: true,
      message: 'Booking rejected',
      booking,
    });
  })
);

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
router.put('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ErrorHandler('Booking not found', 404);
  }

  // Check authorization
  if (
    booking.tenant.toString() !== req.user.id &&
    booking.owner.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new ErrorHandler('Not authorized to cancel this booking', 403);
  }

  if (!['Confirmed', 'Active'].includes(booking.status)) {
    throw new ErrorHandler('Only confirmed or active bookings can be cancelled', 400);
  }

  booking.status = 'Cancelled';
  booking.cancellationReason = reason;
  booking.cancelledAt = new Date();
  await booking.save();

  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    booking,
  });
}));

module.exports = router;
