const express = require('express');
const ProductController = require('../controllers/productController');

const router = express.Router();

// Get all products
router.get('/', ProductController.getAllProducts);

// Search products
router.get('/search', ProductController.searchProducts);

// Get low stock products
router.get('/low-stock', ProductController.getLowStockProducts);

// Get overstock products
router.get('/overstock', ProductController.getOverstockProducts);

// Get damaged products
router.get('/damaged', ProductController.getDamagedProducts);

// Get product by barcode/QR code
router.get('/scan/:code', ProductController.getProductByCode);

// Get product by ID
router.get('/:id', ProductController.getProductById);

// Get product transaction history
router.get('/:id/history', ProductController.getProductHistory);

// Create new product
router.post('/', ProductController.createProduct);

// Update product
router.put('/:id', ProductController.updateProduct);

// Mark product as damaged
router.patch('/:id/damage', ProductController.markAsDamaged);

// Delete product
router.delete('/:id', ProductController.deleteProduct);

module.exports = router; 