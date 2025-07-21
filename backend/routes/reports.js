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

// Monthly orders report
router.get('/monthly-orders', ReportsController.monthlyOrders);

// Monthly orders PDF report
router.get('/monthly-orders/pdf', ReportsController.monthlyOrdersPdf);

// Recent 7 days sales
router.get('/recent-sales', ReportsController.recentSales);

module.exports = router; 