const express = require('express');
const ProductController = require('../controllers/productController');

const router = express.Router();

// Get all products
router.get('/', ProductController.getAllProducts);

// Search products
router.get('/search', ProductController.searchProducts);

// Get product by ID
router.get('/:id', ProductController.getProductById);

// Create new product
router.post('/', ProductController.createProduct);

// Update product
router.put('/:id', ProductController.updateProduct);

// Delete product
router.delete('/:id', ProductController.deleteProduct);

module.exports = router; 