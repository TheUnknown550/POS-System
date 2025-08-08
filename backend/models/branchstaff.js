'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BranchStaff extends Model {
    static associate(models) {
      // BranchStaff belongs to Branch
      BranchStaff.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        as: 'branch'
      });

      // BranchStaff belongs to User
      BranchStaff.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  BranchStaff.init({
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'BranchStaff',
    tableName: 'branch_staff',
    timestamps: false
  });
  return BranchStaff;
};