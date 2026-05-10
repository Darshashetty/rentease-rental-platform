const express = require('express');
const router = express.Router();
const path = require('path');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/products
// @desc    Fetch all products
// @access  Public
// GET /api/products
// Supports query params: search, category, availability (true/false), sort (price_asc/price_desc), page, limit
router.get('/', async (req, res) => {
  try {
    const { search, category, availability, sort, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search && typeof search === 'string') {
      // Case-insensitive partial match on name and description
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (availability === 'true' || availability === 'false') {
      query.availability = availability === 'true';
    }

    // Build mongoose query
    let mongoQuery = Product.find(query);

    // Sorting
    if (sort === 'price_asc') mongoQuery = mongoQuery.sort({ monthlyRent: 1 });
    else if (sort === 'price_desc') mongoQuery = mongoQuery.sort({ monthlyRent: -1 });
    else mongoQuery = mongoQuery.sort({ name: 1 });

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * perPage;

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      mongoQuery.skip(skip).limit(perPage)
    ]);

    res.json({
      data: products,
      meta: {
        total,
        page: pageNum,
        limit: perPage,
        pages: Math.ceil(total / perPage)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Fetch single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products/upload-image
// @desc    Upload product image
// @access  Private/Admin
router.post('/upload-image', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const relativePath = path.posix.join('/uploads', req.file.filename);
    const imageUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

    res.status(201).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, category, subCategory, monthlyRent, securityDeposit, rentalTenureOptions, stock, availability, image, description } = req.body;
    
    if (!name || !category || !monthlyRent || !securityDeposit || !stock) {
      return res.status(400).json({ message: 'Name, category, monthly rent, security deposit, and stock are required' });
    }

    if (monthlyRent <= 0 || securityDeposit <= 0 || stock <= 0) {
      return res.status(400).json({ message: 'Rent, deposit, and stock must be positive numbers' });
    }

    const product = new Product({
      name, 
      category, 
      subCategory, 
      monthlyRent, 
      securityDeposit, 
      rentalTenureOptions: rentalTenureOptions || [3, 6, 12], 
      stock, 
      availability: stock > 0 ? true : false, 
      image: image || '/placeholder.png', 
      description: description || ''
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, category, subCategory, monthlyRent, securityDeposit, rentalTenureOptions, stock, availability, image, description } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate numeric fields if provided
    if (monthlyRent !== undefined && monthlyRent <= 0) {
      return res.status(400).json({ message: 'Monthly rent must be positive' });
    }
    if (securityDeposit !== undefined && securityDeposit <= 0) {
      return res.status(400).json({ message: 'Security deposit must be positive' });
    }
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    // Update fields
    product.name = name || product.name;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.monthlyRent = monthlyRent || product.monthlyRent;
    product.securityDeposit = securityDeposit || product.securityDeposit;
    product.rentalTenureOptions = rentalTenureOptions || product.rentalTenureOptions;
    product.stock = stock !== undefined ? stock : product.stock;
    // Auto-set availability based on stock
    product.availability = product.stock > 0 ? true : false;
    product.image = image || product.image;
    product.description = description || product.description;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id/stock
// @desc    Update product stock
// @access  Private/Admin
router.put('/:id/stock', protect, admin, async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: 'Stock must be a non-negative number' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stock = stock;
    // Auto-set availability based on stock
    product.availability = stock > 0 ? true : false;
    
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
