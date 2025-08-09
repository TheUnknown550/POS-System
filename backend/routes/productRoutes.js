const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// Import authentication middleware
const { authenticateToken } = require('./authRoutes');

// Product routes (protected)
router.get('/', authenticateToken, ProductController.getAllProducts);
router.get('/:id', authenticateToken, ProductController.getProductById);
router.post('/', authenticateToken, ProductController.createProduct);
router.put('/:id', authenticateToken, ProductController.updateProduct);
router.delete('/:id', authenticateToken, ProductController.deleteProduct);

module.exports = router;
