const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property must have an owner'],
  },
  title: {
    type: String,
    required: [true, 'Please provide a property title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  category: {
    type: String,
    enum: ['Apartment', 'House', 'Studio', 'Shared Room', 'Condo', 'Townhouse'],
    required: [true, 'Please select a property type'],
  },
  images: {
    type: [String],
    required: [true, 'Please upload at least one image'],
  },
  location: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'US',
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  pricing: {
    monthlyRent: {
      type: Number,
      required: [true, 'Please provide monthly rent'],
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Please provide security deposit'],
    },
    minimumTenure: {
      type: Number,
      default: 1,
    },
    maximumTenure: {
      type: Number,
    },
  },
  amenities: [
    {
      type: String,
      enum: [
        'WiFi',
        'Parking',
        'Air Conditioning',
        'Heating',
        'Kitchen',
        'Washer/Dryer',
        'Dishwasher',
        'Gym',
        'Pool',
        'Garden',
        'Furnished',
        'Pet Friendly',
      ],
    },
  ],
  specifications: {
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    squareFeet: Number,
  },
  availability: {
    status: {
      type: String,
      enum: ['Available', 'Unavailable', 'Maintenance'],
      default: 'Available',
    },
    availableFrom: Date,
    availableTo: Date,
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Archived'],
    default: 'Pending Approval',
  },
  ratings: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  rules: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Indexes for better query performance
propertySchema.index({ owner: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ 'pricing.monthlyRent': 1 });
propertySchema.index({ 'availability.status': 1 });

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;
