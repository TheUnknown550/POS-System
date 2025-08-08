'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User can be a company admin
      User.hasMany(models.CompanyAdmin, {
        foreignKey: 'user_id',
        as: 'companyAdminRoles'
      });

      // User can be branch staff
      User.hasMany(models.BranchStaff, {
        foreignKey: 'user_id',
        as: 'branchStaffRoles'
      });

      // User can be associated with multiple companies through company_admins
      User.belongsToMany(models.Company, {
        through: models.CompanyAdmin,
        foreignKey: 'user_id',
        otherKey: 'company_id',
        as: 'companies'
      });

      // User can be associated with multiple branches through branch_staff
      User.belongsToMany(models.Branch, {
        through: models.BranchStaff,
        foreignKey: 'user_id',
        otherKey: 'branch_id',
        as: 'branches'
      });
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
  });
  return User;
};