const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { errorMiddleware } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.disable('x-powered-by');

const allowedOrigins = [
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((o) => o.trim()) : []),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'https://rentease-rental-platform-black.vercel.app'
].filter(Boolean);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (curl/postman) and configured frontend origins.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// Legacy route aliases for older frontend builds
app.use('/auth', require('./routes/auth'));
app.use('/properties', require('./routes/properties'));
app.use('/bookings', require('./routes/bookings'));
app.use('/reviews', require('./routes/reviews'));
app.use('/users', require('./routes/users'));
app.use('/admin', require('./routes/admin'));

// Legacy routes for backward compatibility
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/wishlist', require('./routes/wishlist'));

app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));
app.use('/maintenance', require('./routes/maintenance'));
app.use('/wishlist', require('./routes/wishlist'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RentEase API is running',
    timestamp: new Date().toISOString(),
  });
});

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to RentEase API',
    version: '2.0.0',
    docs: '/api-docs',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`Server running on port ${PORT}`);
    console.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
