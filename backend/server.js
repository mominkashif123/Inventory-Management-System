const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const salesRoutes = require('./routes/sales');
const inventoryAdjustmentsRoutes = require('./routes/inventoryAdjustments');
const reportsRoutes = require('./routes/reports');
const auditLogsRoutes = require('./routes/auditLogs');

// Import models for table creation
const Product = require('./models/Product');
const User = require('./models/User');
const Sale = require('./models/Sale');
const SaleItem = require('./models/SaleItem');
const InventoryAdjustment = require('./models/InventoryAdjustment');
const AuditLog = require('./models/AuditLog'); 
 
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Normalize origins by removing trailing slashes
    const allowedOrigins = [
      'http://localhost:3000',
      'https://theharleystore-ims.vercel.app',
      'https://theharleystore-ims.vercel.app/'
    ];
    
    // If CORS_ORIGIN is set in environment, add it to allowed origins
    if (process.env.CORS_ORIGIN) {
      allowedOrigins.push(process.env.CORS_ORIGIN);
      // Also add version without trailing slash
      if (process.env.CORS_ORIGIN.endsWith('/')) {
        allowedOrigins.push(process.env.CORS_ORIGIN.slice(0, -1));
      } else {
        allowedOrigins.push(process.env.CORS_ORIGIN + '/');
      }
    }
    
    // Normalize the incoming origin by removing trailing slash
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    
    if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory-adjustments', inventoryAdjustmentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 CORS Origins: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  // console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  // console.log(`🔗 API URL: http://localhost:${PORT}`);
  // console.log(`🗄️ Database: PostgreSQL (Session Pooler)`);
  // console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  // console.log(`👤 Users API: http://localhost:${PORT}/api/users`);
  
  // Create tables if not exist
  await Product.createTable();
  await User.createTable();
  await Sale.createTable();
  await SaleItem.createTable();
  await InventoryAdjustment.createTable();
  await AuditLog.createTable();
});

module.exports = app;
