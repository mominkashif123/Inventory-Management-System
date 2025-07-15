const express = require('express');
const SalesController = require('../controllers/salesController');

const router = express.Router();

// Create a new sale
router.post('/', SalesController.createSale);

// Get all sales
router.get('/', SalesController.getAllSales);

// Get sale by ID
router.get('/:id', SalesController.getSaleById);

module.exports = router; 