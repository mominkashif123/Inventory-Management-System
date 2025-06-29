const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

class ProductController {
  // Get all products
  static async getAllProducts(req, res) {
    try {
      const result = await Product.findAll();
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json({
        success: true,
        data: result.data,
        count: result.rowCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get product by ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const result = await Product.findById(id);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        data: result.data[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get product by barcode/QR
  static async getProductByCode(req, res) {
    try {
      const { code } = req.params;
      
      // Try barcode first
      let result = await Product.findByBarcode(code);
      
      // If not found, try QR code
      if (result.rowCount === 0) {
        result = await Product.findByQRCode(code);
      }
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      // Get current inventory
      const inventoryResult = await Inventory.getByProductId(result.data[0].id);
      
      res.json({
        success: true,
        data: {
          ...result.data[0],
          current_stock: inventoryResult.success && inventoryResult.data.length > 0 
            ? inventoryResult.data[0].quantity 
            : 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Create new product
  static async createProduct(req, res) {
    try {
      const productData = req.body;
      
      // Validate required fields
      if (!productData.name) {
        return res.status(400).json({
          success: false,
          error: 'Product name is required'
        });
      }
      
      const result = await Product.create(productData);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.status(201).json({
        success: true,
        data: result.data[0],
        message: 'Product created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update product
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;
      
      const result = await Product.update(id, productData);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        data: result.data[0],
        message: 'Product updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete product
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      const result = await Product.delete(id);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        data: result.data[0],
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Search products
  static async searchProducts(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }
      
      const result = await Product.search(q);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json({
        success: true,
        data: result.data,
        count: result.rowCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get low stock products
  static async getLowStockProducts(req, res) {
    try {
      const result = await Product.getLowStockProducts();
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json({
        success: true,
        data: result.data,
        count: result.rowCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get overstock products
  static async getOverstockProducts(req, res) {
    try {
      const result = await Product.getOverstockProducts();
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json({
        success: true,
        data: result.data,
        count: result.rowCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get damaged products
  static async getDamagedProducts(req, res) {
    try {
      const result = await Product.getDamagedProducts();
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json({
        success: true,
        data: result.data,
        count: result.rowCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Mark product as damaged
  static async markAsDamaged(req, res) {
    try {
      const { id } = req.params;
      const { damage_notes } = req.body;
      
      const result = await Product.update(id, {
        is_damaged: true,
        damage_notes: damage_notes || 'Product marked as damaged'
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        data: result.data[0],
        message: 'Product marked as damaged'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get product transaction history
  static async getProductHistory(req, res) {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;
      
      const result = await Inventory.getTransactionHistory(id, parseInt(limit));
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json({
        success: true,
        data: result.data,
        count: result.rowCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = ProductController; 