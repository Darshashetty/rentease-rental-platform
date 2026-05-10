const express = require('express');
const router = express.Router();
const MaintenanceRequest = require('../models/MaintenanceRequest');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/maintenance
// @desc    Create new maintenance request
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, issue } = req.body;
    
    // Validate input
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    
    if (!issue || !issue.trim()) {
      return res.status(400).json({ message: 'Issue description is required' });
    }

    const request = new MaintenanceRequest({
      userId: req.user._id,
      orderId,
      issue: issue.trim(),
    });

    const createdRequest = await request.save();
    // Populate to get full details for response
    await createdRequest.populate({
      path: 'orderId',
      populate: { path: 'productId' }
    });
    res.status(201).json(createdRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/maintenance/myrequests
// @desc    Get logged in user requests
// @access  Private
router.get('/myrequests', protect, async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ userId: req.user._id }).populate({
      path: 'orderId',
      populate: { path: 'productId' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/maintenance
// @desc    Get all maintenance requests
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({})
      .populate('userId', 'id name')
      .populate({
        path: 'orderId',
        populate: { path: 'productId' }
      });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/maintenance/:id/status
// @desc    Update maintenance request status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    request.status = status;
    const updatedRequest = await request.save();
    await updatedRequest.populate({
      path: 'orderId',
      populate: { path: 'productId' }
    });
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
