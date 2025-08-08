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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    sku: {
      type: DataTypes.STRING,
      unique: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: false
  });
  return Product;
};