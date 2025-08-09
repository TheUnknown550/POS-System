'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'address', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('companies', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('companies', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('companies', 'address');
    await queryInterface.removeColumn('companies', 'phone');
    await queryInterface.removeColumn('companies', 'email');
  }
};
