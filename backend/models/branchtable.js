'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BranchTable extends Model {
    static associate(models) {
      // BranchTable belongs to Branch
      BranchTable.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        as: 'branch'
      });

      // BranchTable has many orders
      BranchTable.hasMany(models.Order, {
        foreignKey: 'table_id',
        as: 'orders'
      });
    }
  }
  BranchTable.init({
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
    table_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['available', 'occupied', 'reserved']]
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'BranchTable',
    tableName: 'branch_tables',
    timestamps: false
  });
  return BranchTable;
};