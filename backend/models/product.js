'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Product belongs to ProductCategory
      Product.belongsTo(models.ProductCategory, {
        foreignKey: 'category_id',
        as: 'category'
      });

      // Product belongs to Branch
      Product.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        as: 'branch'
      });

      // Product has many order items
      Product.hasMany(models.OrderItem, {
        foreignKey: 'product_id',
        as: 'orderItems'
      });

      // Product belongs to many orders through order_items
      Product.belongsToMany(models.Order, {
        through: models.OrderItem,
        foreignKey: 'product_id',
        otherKey: 'order_id',
        as: 'orders'
      });
    }
  }
  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'product_categories',
        key: 'id'
      }
    },
    branch_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    discount_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    sku: {
      type: DataTypes.STRING,
      unique: true
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of image URLs for product gallery'
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    min_stock_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 0
      }
    },
    max_stock_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    unit_of_measure: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'piece',
      comment: 'e.g., piece, kg, liter, box, etc.'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'discontinued', 'out_of_stock'),
      allowNull: false,
      defaultValue: 'active'
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of tags for product categorization'
    },
    nutritional_info: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Calories, fat, protein, etc.'
    },
    allergens: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of allergen information'
    },
    preparation_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Preparation time in minutes'
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Reference to supplier (can be added later)'
    },
    weight: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: true,
      comment: 'Product weight in grams'
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Length, width, height in cm'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Product;
};