const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'BookingRequest',
      'BookingApproved',
      'BookingRejected',
      'BookingCancelled',
      'ReviewReceived',
      'PropertyApproved',
      'PropertyRejected',
      'NewMessage',
      'PaymentReceived',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Property', 'Booking', 'User', 'Review'],
    },
    entityId: mongoose.Schema.Types.ObjectId,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    expire: 30 * 24 * 60 * 60, // Auto-delete after 30 days
  },
}, { timestamps: true });

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
