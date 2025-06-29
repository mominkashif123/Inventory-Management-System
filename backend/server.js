const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection, executeQuery } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Inventory Management System API is running',
    database: 'PostgreSQL',
    version: '1.0.0'
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await executeQuery('SELECT NOW() as current_time');
    if (!result.success) {
      return res.status(500).json(result);
    }
    res.json({
      success: true,
      data: result.data[0],
      message: 'Database connection successful'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await testConnection();
});
