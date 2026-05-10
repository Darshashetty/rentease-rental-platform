const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { asyncHandler, ErrorHandler } = require('../middleware/errorMiddleware');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// @route   POST /api/reviews
// @desc    Create a review
router.post('/', protect, validate(schemas.review), 
  asyncHandler(async (req, res) => {
    const { property, booking, rating, title, comment, categories, photos } = req.body;

    // Verify property exists
    const propertyDoc = await Property.findById(property);
    if (!propertyDoc) {
      throw new ErrorHandler('Property not found', 404);
    }

    // If booking is provided, verify it
    if (booking) {
      const bookingDoc = await Booking.findById(booking);
      if (!bookingDoc) {
        throw new ErrorHandler('Booking not found', 404);
      }
      if (bookingDoc.tenant.toString() !== req.user.id) {
        throw new ErrorHandler('You can only review your own bookings', 403);
      }
    }

    // Check if user already reviewed this property
    const existingReview = await Review.findOne({
      property,
      reviewer: req.user.id,
    });

    if (existingReview) {
      throw new ErrorHandler('You have already reviewed this property', 400);
    }

    const review = await Review.create({
      property,
      reviewer: req.user.id,
      booking: booking || null,
      rating,
      title,
      comment,
      categories: categories || {},
      photos: photos || [],
      verifiedBooking: !!booking,
    });

    // Update property ratings
    const reviews = await Review.find({ property });
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    
    propertyDoc.ratings.averageRating = avgRating;
    propertyDoc.ratings.totalReviews = reviews.length;
    await propertyDoc.save();

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      review,
    });
  })
);

// @route   GET /api/reviews/property/:propertyId
// @desc    Get all reviews for a property
router.get('/property/:propertyId', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const skip = (page - 1) * limit;

  const reviews = await Review.find({ property: req.params.propertyId })
    .populate('reviewer', 'name profileImage')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Review.countDocuments({ property: req.params.propertyId });

  res.json({
    success: true,
    count: reviews.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
    reviews,
  });
}));

// @route   GET /api/reviews/:id
// @desc    Get single review
router.get('/:id', asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('property', 'title images')
    .populate('reviewer', 'name profileImage');

  if (!review) {
    throw new ErrorHandler('Review not found', 404);
  }

  res.json({
    success: true,
    review,
  });
}));

// @route   PUT /api/reviews/:id
// @desc    Update review (own only)
router.put('/:id', protect, asyncHandler(async (req, res) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    throw new ErrorHandler('Review not found', 404);
  }

  // Check authorization
  if (review.reviewer.toString() !== req.user.id) {
    throw new ErrorHandler('Not authorized to update this review', 403);
  }

  const { rating, title, comment, categories, photos } = req.body;

  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (comment) review.comment = comment;
  if (categories) review.categories = { ...review.categories, ...categories };
  if (photos) review.photos = photos;

  review = await review.save();

  res.json({
    success: true,
    message: 'Review updated successfully',
    review,
  });
}));

// @route   DELETE /api/reviews/:id
// @desc    Delete review (own only)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new ErrorHandler('Review not found', 404);
  }

  // Check authorization
  if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ErrorHandler('Not authorized to delete this review', 403);
  }

  await Review.findByIdAndDelete(req.params.id);

  // Update property ratings
  const propertyId = review.property;
  const reviews = await Review.find({ property: propertyId });
  
  if (reviews.length > 0) {
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    await Property.findByIdAndUpdate(propertyId, {
      'ratings.averageRating': avgRating,
      'ratings.totalReviews': reviews.length,
    });
  } else {
    await Property.findByIdAndUpdate(propertyId, {
      'ratings.averageRating': 0,
      'ratings.totalReviews': 0,
    });
  }

  res.json({
    success: true,
    message: 'Review deleted successfully',
  });
}));

// @route   PUT /api/reviews/:id/helpful
// @desc    Mark review as helpful
router.put('/:id/helpful', protect, asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpful: 1 } },
    { new: true }
  );

  if (!review) {
    throw new ErrorHandler('Review not found', 404);
  }

  res.json({
    success: true,
    message: 'Thanks for your feedback',
    review,
  });
}));

module.exports = router;
