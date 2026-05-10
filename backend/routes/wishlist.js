const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/wishlist
// @desc    Get logged-in user's wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({
      data: user?.wishlist || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    const exists = user.wishlist?.some((item) => item.toString() === productId);

    if (exists) {
      return res.status(200).json({ message: 'Product already in wishlist' });
    }

    user.wishlist = user.wishlist || [];
    user.wishlist.push(productId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.status(201).json({
      message: 'Added to wishlist',
      data: updatedUser.wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = (user.wishlist || []).filter((item) => item.toString() !== productId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json({
      message: 'Removed from wishlist',
      data: updatedUser.wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/wishlist/:productId/status
// @desc    Check whether product exists in wishlist
// @access  Private
router.get('/:productId/status', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    const inWishlist = (user?.wishlist || []).some((item) => item.toString() === productId);
    res.json({ inWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
