'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductCategory extends Model {
    static associate(models) {
      // ProductCategory has many products
      ProductCategory.hasMany(models.Product, {
        foreignKey: 'category_id',
        as: 'products'
      });
    }
  }
  ProductCategory.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ProductCategory',
    tableName: 'product_categories',
    timestamps: false
  });
  return ProductCategory;
};