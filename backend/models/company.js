'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      // Company has many branches
      Company.hasMany(models.Branch, {
        foreignKey: 'company_id',
        as: 'branches'
      });

      // Company has many admins
      Company.hasMany(models.CompanyAdmin, {
        foreignKey: 'company_id',
        as: 'admins'
      });

      // Company belongs to many users through company_admins
      Company.belongsToMany(models.User, {
        through: models.CompanyAdmin,
        foreignKey: 'company_id',
        otherKey: 'user_id',
        as: 'users'
      });
    }
  }
  Company.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
    timestamps: false
  });
  return Company;
};