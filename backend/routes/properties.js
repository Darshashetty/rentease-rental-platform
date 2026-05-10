const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { asyncHandler, ErrorHandler } = require('../middleware/errorMiddleware');
const { protect, authorize, admin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// @route   GET /api/properties
// @desc    Get all properties with filters
router.get('/', asyncHandler(async (req, res) => {
  const { 
    city, 
    category, 
    minRent, 
    maxRent, 
    amenities,
    sortBy = '-createdAt',
    page = 1,
    limit = 12 
  } = req.query;

  let filter = { status: 'Approved', 'availability.status': 'Available' };

  if (city) {
    filter['location.city'] = new RegExp(city, 'i');
  }

  if (category) {
    filter.category = category;
  }

  if (minRent || maxRent) {
    filter['pricing.monthlyRent'] = {};
    if (minRent) filter['pricing.monthlyRent'].$gte = Number(minRent);
    if (maxRent) filter['pricing.monthlyRent'].$lte = Number(maxRent);
  }

  if (amenities) {
    const amenityList = amenities.split(',');
    filter.amenities = { $in: amenityList };
  }

  const skip = (page - 1) * limit;

  const properties = await Property.find(filter)
    .populate('owner', 'name profileImage phone')
    .sort(sortBy)
    .skip(skip)
    .limit(Number(limit));

  const total = await Property.countDocuments(filter);

  res.json({
    success: true,
    count: properties.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
    properties,
  });
}));

// @route   GET /api/properties/:id
// @desc    Get single property
router.get('/:id', asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate('owner', 'name email phone profileImage bio')
    .populate({
      path: 'ratings',
      select: 'rating comment reviewer',
    });

  if (!property) {
    throw new ErrorHandler('Property not found', 404);
  }

  res.json({
    success: true,
    property,
  });
}));

// @route   POST /api/properties
// @desc    Create a new property (owner only)
router.post('/', protect, authorize('owner', 'admin'), validate(schemas.property), 
  asyncHandler(async (req, res) => {
    const propertyData = {
      ...req.validatedData,
      owner: req.user.id,
      status: req.user.role === 'admin' ? 'Approved' : 'Pending Approval',
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property,
    });
  })
);

// @route   PUT /api/properties/:id
// @desc    Update property (owner only)
router.put('/:id', protect, asyncHandler(async (req, res) => {
  let property = await Property.findById(req.params.id);

  if (!property) {
    throw new ErrorHandler('Property not found', 404);
  }

  // Check authorization
  if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ErrorHandler('Not authorized to update this property', 403);
  }

  const { title, description, category, images, location, pricing, amenities, specifications, rules } = req.body;

  if (title) property.title = title;
  if (description) property.description = description;
  if (category) property.category = category;
  if (images) property.images = images;
  if (location) property.location = { ...property.location, ...location };
  if (pricing) property.pricing = { ...property.pricing, ...pricing };
  if (amenities) property.amenities = amenities;
  if (specifications) property.specifications = { ...property.specifications, ...specifications };
  if (rules) property.rules = rules;

  property = await property.save();

  res.json({
    success: true,
    message: 'Property updated successfully',
    property,
  });
}));

// @route   DELETE /api/properties/:id
// @desc    Delete property (owner only)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ErrorHandler('Property not found', 404);
  }

  // Check authorization
  if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ErrorHandler('Not authorized to delete this property', 403);
  }

  await Property.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Property deleted successfully',
  });
}));

// @route   PUT /api/properties/:id/status
// @desc    Update property availability status
router.put('/:id/status', protect, asyncHandler(async (req, res) => {
  const { status } = req.body;

  const property = await Property.findById(req.params.id);
  if (!property) {
    throw new ErrorHandler('Property not found', 404);
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ErrorHandler('Not authorized', 403);
  }

  property.availability.status = status;
  await property.save();

  res.json({
    success: true,
    message: 'Property status updated',
    property,
  });
}));

// @route   GET /api/properties/owner/:ownerId
// @desc    Get all properties of an owner
router.get('/owner/:ownerId', asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.params.ownerId })
    .sort('-createdAt');

  res.json({
    success: true,
    count: properties.length,
    properties,
  });
}));

module.exports = router;
