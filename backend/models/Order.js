const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rentalDuration: { type: Number, required: true }, // in months
  totalCost: { type: Number, required: true },
  deliveryDate: { type: Date, required: true },
  address: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rented', 'Returned', 'Cancelled'], 
    default: 'Pending' 
  },
  extensions: [{
    extendedMonths: { type: Number, required: true },
    extendedCost: { type: Number, required: true },
    requestDate: { type: Date, default: Date.now },
    approvalDate: { type: Date },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
  }],
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
