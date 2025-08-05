const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const restaurantRoutes = require('./routes/restaurants');
const orderRoutes = require('./routes/orders');
const vendorRoutes = require('./routes/vendors');
const deliveryRoutes = require('./routes/delivery');
const adminRoutes = require('./routes/admin');
const pushNotificationRoutes = require('./routes/pushNotifications');

// Middleware
app.use(helmet());
app.use(morgan('combined'));

// CORS configuration for multiple origins
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://192.168.1.3:3000', 'http://192.168.1.4:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Gaon Zaika API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint - API information
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Gaon Zaika API',
    version: '1.0.0',
    description: 'Village Food Delivery API - Connecting rural restaurants with customers',
    status: 'Active',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: {
        url: '/health',
        method: 'GET',
        description: 'API health check'
      },
      auth: {
        url: '/api/auth',
        methods: ['POST'],
        description: 'Authentication endpoints for customers, vendors, delivery, and admin'
      },
      customers: {
        url: '/api/customers',
        methods: ['GET', 'PATCH'],
        description: 'Customer profile and preferences management'
      },
      restaurants: {
        url: '/api/restaurants',
        methods: ['GET'],
        description: 'Restaurant listings and menu information'
      },
      orders: {
        url: '/api/orders',
        methods: ['GET', 'POST', 'PATCH'],
        description: 'Order management and tracking'
      },
      vendors: {
        url: '/api/vendor',
        methods: ['GET', 'PATCH'],
        description: 'Vendor dashboard and restaurant management'
      },
      delivery: {
        url: '/api/delivery',
        methods: ['GET', 'PATCH'],
        description: 'Delivery person management and order assignment'
      },
      admin: {
        url: '/api/admin',
        methods: ['GET'],
        description: 'Admin dashboard and system management'
      },
      pushNotifications: {
        url: '/api/push-notifications',
        methods: ['POST'],
        description: 'Push notification management'
      }
    },
    documentation: 'This is a mobile app backend API. Use the Gaon Zaika mobile app to interact with the platform.',
    support: {
      email: 'gaonzaika@gmail.com',
      phone: '8182838680',
      whatsapp: '8182838680'
    },
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/push-notifications', pushNotificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://infoniict3:u3LxBHUbcVwNJhG2@gaonzaika.azbxae5.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create default admin if not exists
    const Admin = require('./models/Admin');
    await Admin.createDefaultAdmin();
    
    // Seed sample data for testing
    if (process.env.NODE_ENV === 'development') {
      const seedData = require('./seedData');
      await seedData();
    }
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Gaon Zaika API server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
    console.log(`👤 Customer routes: http://localhost:${PORT}/api/customers`);
  });
};

startServer();

module.exports = app; 