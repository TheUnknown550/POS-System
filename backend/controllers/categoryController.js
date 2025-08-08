const { ProductCategory, Product } = require('../models');

class ProductCategoryController {
  // GET /api/categories
  static async getAllCategories(req, res) {
    try {
      const categories = await ProductCategory.findAll({
        include: [
          {
            model: Product,
            as: 'products'
          }
        ],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: categories,
        count: categories.length
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
        message: error.message
      });
    }
  }

  // GET /api/categories/:id
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await ProductCategory.findByPk(id, {
        include: [
          {
            model: Product,
            as: 'products'
          }
        ]
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch category',
        message: error.message
      });
    }
  }

  // POST /api/categories
  static async createCategory(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Category name is required'
        });
      }

      // Check if category name already exists
      const existingCategory = await ProductCategory.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          error: 'Category name already exists'
        });
      }

      const category = await ProductCategory.create({ name });

      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully'
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create category',
        message: error.message
      });
    }
  }

  // PUT /api/categories/:id
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Category name is required'
        });
      }

      const category = await ProductCategory.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      // Check if new name already exists (if different from current)
      if (name !== category.name) {
        const existingCategory = await ProductCategory.findOne({ where: { name } });
        if (existingCategory) {
          return res.status(409).json({
            success: false,
            error: 'Category name already exists'
          });
        }
      }

      await category.update({ name });

      res.json({
        success: true,
        data: category,
        message: 'Category updated successfully'
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update category',
        message: error.message
      });
    }
  }

  // DELETE /api/categories/:id
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await ProductCategory.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      // Check if category has products
      const products = await Product.findAll({
        where: { category_id: id },
        limit: 1
      });

      if (products.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete category that contains products'
        });
      }

      await category.destroy();

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete category',
        message: error.message
      });
    }
  }
}

module.exports = ProductCategoryController;
