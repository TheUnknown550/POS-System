const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const ProductController = require('../controllers/productController');

// Category routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.post('/', CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

// Category products routes
router.get('/:categoryId/products', ProductController.getProductsByCategory);

module.exports = router;
