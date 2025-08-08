'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // Payment belongs to Order
      Payment.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
    }
  }
  Payment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['cash', 'card', 'digital_wallet', 'bank_transfer']]
      }
    },
    paid_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: false
  });
  return Payment;
};