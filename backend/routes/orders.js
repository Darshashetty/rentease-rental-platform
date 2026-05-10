const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const ALLOWED_TRANSITIONS = {
  Pending: ['Approved', 'Cancelled'],
  Approved: ['Rented', 'Cancelled'],
  Rented: ['Returned', 'Cancelled'],
  Returned: [],
  Cancelled: [],
  // Backward compatibility with legacy statuses still present in existing records
  Confirmed: ['Rented', 'Cancelled'],
  Delivered: ['Rented', 'Returned', 'Cancelled'],
  Active: ['Returned', 'Cancelled'],
  Completed: []
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rentalDuration, totalCost, deliveryDate, address } = req.body;
    
    if (!productId || !rentalDuration || !totalCost || !deliveryDate || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate address is not empty
    if (!address.trim()) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    const order = new Order({
      userId: req.user._id,
      productId,
      rentalDuration,
      totalCost,
      deliveryDate,
      address: address.trim(),
    });

    const createdOrder = await order.save();
    await createdOrder.populate('productId');
    
    // Send email notification (non-blocking)
    sendEmail({
      email: req.user.email,
      subject: 'Order Confirmation - RentEase',
      message: `<h2>Order Confirmed!</h2>
                <p>Hi ${req.user.name},</p>
                <p>Your rental order for <strong>${product.name}</strong> has been placed successfully.</p>
                <p>Total Cost: ₹${totalCost}</p>
                <p>Thank you for using RentEase!</p>`
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate('productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId', 'id name').populate('productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['Pending', 'Approved', 'Rented', 'Returned', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const allowedNextStatuses = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    order.status = status;
    await order.save();
    
    // Fetch updated order with populated fields
    const updatedOrder = await Order.findById(req.params.id)
      .populate('productId')
      .populate('userId', 'id name email');
      
    if (status === 'Approved' && updatedOrder.userId?.email) {
      sendEmail({
        email: updatedOrder.userId.email,
        subject: 'Order Approved - RentEase',
        message: `<h2>Order Approved!</h2>
                  <p>Hi ${updatedOrder.userId.name},</p>
                  <p>Your rental order for <strong>${updatedOrder.productId.name}</strong> has been officially approved by the admin.</p>
                  <p>Check your dashboard for delivery updates.</p>`
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/orders/:id/extend
// @desc    Request rental extension
// @access  Private
router.post('/:id/extend', protect, async (req, res) => {
  try {
    const { extendedMonths, extendedCost } = req.body;

    if (!extendedMonths || !extendedCost) {
      return res.status(400).json({ message: 'Extended months and cost are required' });
    }

    if (extendedMonths <= 0 || extendedCost <= 0) {
      return res.status(400).json({ message: 'Extended months and cost must be positive numbers' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to extend this order' });
    }

    // Add extension request
    order.extensions.push({
      extendedMonths,
      extendedCost,
      status: 'Pending'
    });

    await order.save();
    
    // Fetch updated order with populated fields
    const updatedOrder = await Order.findById(req.params.id)
      .populate('productId');
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/extend/:extensionId/approve
// @desc    Approve rental extension
// @access  Private/Admin
router.put('/:id/extend/:extensionId/approve', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const extension = order.extensions.id(req.params.extensionId);
    if (!extension) {
      return res.status(404).json({ message: 'Extension not found' });
    }

    extension.status = 'Approved';
    extension.approvalDate = Date.now();
    
    await order.save();
    
    // Fetch updated order with populated fields
    const updatedOrder = await Order.findById(req.params.id)
      .populate('productId');
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/extend/:extensionId/reject
// @desc    Reject rental extension
// @access  Private/Admin
router.put('/:id/extend/:extensionId/reject', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const extension = order.extensions.id(req.params.extensionId);
    if (!extension) {
      return res.status(404).json({ message: 'Extension not found' });
    }

    extension.status = 'Rejected';
    
    await order.save();
    
    // Fetch updated order with populated fields
    const updatedOrder = await Order.findById(req.params.id)
      .populate('productId');
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
