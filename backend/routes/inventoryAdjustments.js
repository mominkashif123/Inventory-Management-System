const express = require('express');
const InventoryAdjustmentsController = require('../controllers/inventoryAdjustmentsController');

const router = express.Router();

// Create a new inventory adjustment
router.post('/', InventoryAdjustmentsController.createAdjustment);

// Get all adjustments
router.get('/', InventoryAdjustmentsController.getAllAdjustments);

// Get adjustments for a product
router.get('/product/:product_id', InventoryAdjustmentsController.getAdjustmentsByProduct);

module.exports = router; 