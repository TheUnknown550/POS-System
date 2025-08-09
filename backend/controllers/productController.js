const { Product, ProductCategory, OrderItem } = require('../models');

class ProductController {
  // GET /api/products
  static async getAllProducts(req, res) {
    try {
      const { category_id, search, branch_id } = req.query;

      console.log('Fetching products with params:', { category_id, search, branch_id });

      if (!branch_id) {
        return res.status(400).json({
          success: false,
          error: 'branch_id is required'
        });
      }

      let whereClause = { branch_id };

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
            as: 'category',
            attributes: ['id', 'name']
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
      console.log('Creating product with data:', req.body);
      const {
        category_id,
        branch_id,
        name,
        description,
        price,
        cost_price,
        discount_percentage,
        discount_price,
        sku,
        barcode,
        image_url,
        images,
        stock_quantity,
        min_stock_level,
        max_stock_level,
        unit_of_measure,
        status,
        is_featured,
        tags,
        nutritional_info,
        allergens,
        preparation_time,
        supplier_id,
        weight,
        dimensions
      } = req.body;

      if (!category_id || !branch_id || !name || !price) {
        return res.status(400).json({
          success: false,
          error: 'Category ID, branch ID, name, and price are required'
        });
      }      // Check if category exists
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

      // Check if barcode already exists (if provided)
      if (barcode) {
        const existingProduct = await Product.findOne({ where: { barcode } });
        if (existingProduct) {
          return res.status(409).json({
            success: false,
            error: 'Barcode already exists'
          });
        }
      }

      const productData = {
        category_id,
        branch_id,
        name,
        price
      };

      // Add optional fields if provided
      if (description !== undefined) productData.description = description;
      if (cost_price !== undefined) productData.cost_price = cost_price;
      if (discount_percentage !== undefined) productData.discount_percentage = discount_percentage;
      if (discount_price !== undefined) productData.discount_price = discount_price;
      if (sku !== undefined) productData.sku = sku;
      if (barcode !== undefined) productData.barcode = barcode;
      if (image_url !== undefined) productData.image_url = image_url;
      if (images !== undefined) productData.images = images;
      if (stock_quantity !== undefined) productData.stock_quantity = stock_quantity;
      if (min_stock_level !== undefined) productData.min_stock_level = min_stock_level;
      if (max_stock_level !== undefined) productData.max_stock_level = max_stock_level;
      if (unit_of_measure !== undefined) productData.unit_of_measure = unit_of_measure;
      if (status !== undefined) productData.status = status;
      if (is_featured !== undefined) productData.is_featured = is_featured;
      if (tags !== undefined) productData.tags = tags;
      if (nutritional_info !== undefined) productData.nutritional_info = nutritional_info;
      if (allergens !== undefined) productData.allergens = allergens;
      if (preparation_time !== undefined) productData.preparation_time = preparation_time;
      if (supplier_id !== undefined) productData.supplier_id = supplier_id;
      if (weight !== undefined) productData.weight = weight;
      if (dimensions !== undefined) productData.dimensions = dimensions;

      const product = await Product.create(productData);

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
      const { 
        category_id, 
        name, 
        description,
        price, 
        cost_price,
        discount_percentage,
        discount_price,
        sku, 
        barcode,
        image_url,
        images,
        stock_quantity,
        min_stock_level,
        max_stock_level,
        unit_of_measure,
        status,
        is_featured,
        tags,
        nutritional_info,
        allergens,
        preparation_time,
        supplier_id,
        weight,
        dimensions
      } = req.body;

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

      // Check if barcode already exists (if being updated and different from current)
      if (barcode && barcode !== product.barcode) {
        const existingProduct = await Product.findOne({ where: { barcode } });
        if (existingProduct) {
          return res.status(409).json({
            success: false,
            error: 'Barcode already exists'
          });
        }
      }

      const updateData = {};

      // Update only provided fields
      if (category_id !== undefined) updateData.category_id = category_id;
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (cost_price !== undefined) updateData.cost_price = cost_price;
      if (discount_percentage !== undefined) updateData.discount_percentage = discount_percentage;
      if (discount_price !== undefined) updateData.discount_price = discount_price;
      if (sku !== undefined) updateData.sku = sku;
      if (barcode !== undefined) updateData.barcode = barcode;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (images !== undefined) updateData.images = images;
      if (stock_quantity !== undefined) updateData.stock_quantity = stock_quantity;
      if (min_stock_level !== undefined) updateData.min_stock_level = min_stock_level;
      if (max_stock_level !== undefined) updateData.max_stock_level = max_stock_level;
      if (unit_of_measure !== undefined) updateData.unit_of_measure = unit_of_measure;
      if (status !== undefined) updateData.status = status;
      if (is_featured !== undefined) updateData.is_featured = is_featured;
      if (tags !== undefined) updateData.tags = tags;
      if (nutritional_info !== undefined) updateData.nutritional_info = nutritional_info;
      if (allergens !== undefined) updateData.allergens = allergens;
      if (preparation_time !== undefined) updateData.preparation_time = preparation_time;
      if (supplier_id !== undefined) updateData.supplier_id = supplier_id;
      if (weight !== undefined) updateData.weight = weight;
      if (dimensions !== undefined) updateData.dimensions = dimensions;

      await product.update(updateData);

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
