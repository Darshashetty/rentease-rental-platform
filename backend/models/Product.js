const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: { 
    type: String, 
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  category: { 
    type: String, 
    enum: ['Furniture', 'Appliances'], 
    required: [true, 'Please select a category'],
  },
  subCategory: { 
    type: String, 
    required: [true, 'Please provide a subcategory'],
  },
  monthlyRent: { 
    type: Number, 
    required: [true, 'Please provide monthly rent'],
  },
  securityDeposit: { 
    type: Number, 
    required: [true, 'Please provide security deposit'],
  },
  rentalTenureOptions: [{ type: Number }],
  stock: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  availability: { 
    type: Boolean, 
    required: true, 
    default: true 
  },
  image: { 
    type: String, 
    required: [true, 'Please provide an image'],
  },
  description: { 
    type: String, 
    required: [true, 'Please provide a description'],
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Inactive'],
    default: 'Active',
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
}, { timestamps: true });

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ monthlyRent: 1 });
productSchema.index({ availability: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
