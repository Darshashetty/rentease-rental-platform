const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Booking must have a property'],
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have a tenant'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have an owner'],
  },
  bookingDates: {
    checkInDate: {
      type: Date,
      required: [true, 'Please provide check-in date'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Please provide check-out date'],
    },
  },
  rentalDuration: {
    type: Number,
    required: true,
  },
  pricing: {
    monthlyRent: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Active',
      'Completed',
      'Cancelled',
      'Rejected',
    ],
    default: 'Pending',
  },
  requestMessage: String,
  adminNotes: String,
  cancellationReason: String,
  cancelledAt: Date,
  deliveryAddress: String,
  extensions: [
    {
      extendedMonths: Number,
      extendedCost: Number,
      requestDate: {
        type: Date,
        default: Date.now,
      },
      approvalDate: Date,
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Indexes
bookingSchema.index({ property: 1 });
bookingSchema.index({ tenant: 1 });
bookingSchema.index({ owner: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'bookingDates.checkInDate': 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
