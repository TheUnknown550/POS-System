'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Branch extends Model {
    static associate(models) {
      // Branch belongs to Company
      Branch.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company'
      });

      // Branch has many tables
      Branch.hasMany(models.BranchTable, {
        foreignKey: 'branch_id',
        as: 'tables'
      });

      // Branch has many staff
      Branch.hasMany(models.BranchStaff, {
        foreignKey: 'branch_id',
        as: 'staff'
      });

      // Branch has many orders
      Branch.hasMany(models.Order, {
        foreignKey: 'branch_id',
        as: 'orders'
      });

      // Branch belongs to many users through branch_staff
      Branch.belongsToMany(models.User, {
        through: models.BranchStaff,
        foreignKey: 'branch_id',
        otherKey: 'user_id',
        as: 'users'
      });
    }
  }
  Branch.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Branch',
    tableName: 'branches',
    timestamps: false
  });
  return Branch;
};