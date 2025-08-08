'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Order belongs to Branch
      Order.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        as: 'branch'
      });

      // Order belongs to BranchTable (optional)
      Order.belongsTo(models.BranchTable, {
        foreignKey: 'table_id',
        as: 'table'
      });

      // Order has many order items
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'items'
      });

      // Order has many payments
      Order.hasMany(models.Payment, {
        foreignKey: 'order_id',
        as: 'payments'
      });

      // Order belongs to many products through order_items
      Order.belongsToMany(models.Product, {
        through: models.OrderItem,
        foreignKey: 'order_id',
        otherKey: 'product_id',
        as: 'products'
      });
    }
  }
  Order.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    branch_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    table_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'branch_tables',
        key: 'id'
      }
    },
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled']]
      }
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: false
  });
  return Order;
};