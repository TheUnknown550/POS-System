'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CompanyAdmin extends Model {
    static associate(models) {
      // CompanyAdmin belongs to User
      CompanyAdmin.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // CompanyAdmin belongs to Company
      CompanyAdmin.belongsTo(models.Company, {
        foreignKey: 'company_id',
        as: 'company'
      });
    }
  }
  CompanyAdmin.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
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
    modelName: 'CompanyAdmin',
    tableName: 'company_admins',
    timestamps: false
  });
  return CompanyAdmin;
};