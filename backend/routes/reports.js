const express = require('express');
const ReportsController = require('../controllers/reportsController');

const router = express.Router();

// Sales summary
router.get('/sales-summary', ReportsController.salesSummary);

// Inventory value
router.get('/inventory-value', ReportsController.inventoryValue);

// Bestsellers
router.get('/bestsellers', ReportsController.bestsellers);

// Low-stock products
router.get('/low-stock', ReportsController.lowStockProducts);

module.exports = router; 