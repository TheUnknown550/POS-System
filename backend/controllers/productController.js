const { Product, ProductCategory, OrderItem } = require('../models');

class ProductController {
  // GET /api/products
  static async getAllProducts(req, res) {
    try {
      const { category_id, search } = req.query;
      let whereClause = {};

      if (category_id) {
        whereClause.category_id = category_id;
      }

      if (search) {
        whereClause.name = {
          [require('sequelize').Op.iLike]: `%${search}%`
        };
      }

      const products = await Product.findAll({
        where: whereClause,
        include: [
          {
            model: ProductCategory,
            as: 'category'
          }
        ],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        message: error.message
      });
    }
  }

  // GET /api/products/:id
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id, {
        include: [
          {
            model: ProductCategory,
            as: 'category'
          }
        ]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
        message: error.message
      });
    }
  }

  // POST /api/products
  static async createProduct(req, res) {
    try {
      const { category_id, name, price, sku } = req.body;

      if (!category_id || !name || !price) {
        return res.status(400).json({
          success: false,
          error: 'Category ID, name, and price are required'
        });
      }

      // Check if category exists
      const category = await ProductCategory.findByPk(category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Product category not found'
        });
      }

      // Check if SKU already exists (if provided)
      if (sku) {
        const existingProduct = await Product.findOne({ where: { sku } });
        if (existingProduct) {
          return res.status(409).json({
            success: false,
            error: 'SKU already exists'
          });
        }
      }

      const product = await Product.create({
        category_id,
        name,
        price,
        sku
      });

      // Fetch the created product with category
      const createdProduct = await Product.findByPk(product.id, {
        include: [
          {
            model: ProductCategory,
            as: 'category'
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: createdProduct,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product',
        message: error.message
      });
    }
  }

  // PUT /api/products/:id
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { category_id, name, price, sku } = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Check if category exists (if being updated)
      if (category_id) {
        const category = await ProductCategory.findByPk(category_id);
        if (!category) {
          return res.status(404).json({
            success: false,
            error: 'Product category not found'
          });
        }
      }

      // Check if SKU already exists (if being updated and different from current)
      if (sku && sku !== product.sku) {
        const existingProduct = await Product.findOne({ where: { sku } });
        if (existingProduct) {
          return res.status(409).json({
            success: false,
            error: 'SKU already exists'
          });
        }
      }

      await product.update({
        category_id: category_id || product.category_id,
        name: name || product.name,
        price: price || product.price,
        sku: sku || product.sku
      });

      // Fetch updated product with category
      const updatedProduct = await Product.findByPk(id, {
        include: [
          {
            model: ProductCategory,
            as: 'category'
          }
        ]
      });

      res.json({
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update product',
        message: error.message
      });
    }
  }

  // DELETE /api/products/:id
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Check if product is used in any orders
      const orderItems = await OrderItem.findAll({
        where: { product_id: id },
        limit: 1
      });

      if (orderItems.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete product that has been ordered'
        });
      }

      await product.destroy();

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product',
        message: error.message
      });
    }
  }

  // GET /api/categories/:categoryId/products
  static async getProductsByCategory(req, res) {
    try {
      const { categoryId } = req.params;

      const products = await Product.findAll({
        where: { category_id: categoryId },
        include: [
          {
            model: ProductCategory,
            as: 'category'
          }
        ],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products by category',
        message: error.message
      });
    }
  }
}

module.exports = ProductController;
