'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new columns to the branches table
    await queryInterface.addColumn('branches', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('branches', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('branches', 'manager_name', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('branches', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'maintenance'),
      allowNull: false,
      defaultValue: 'active'
    });

    await queryInterface.addColumn('branches', 'opening_hours', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'JSON string containing opening hours for each day'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('branches', 'phone');
    await queryInterface.removeColumn('branches', 'email');
    await queryInterface.removeColumn('branches', 'manager_name');
    await queryInterface.removeColumn('branches', 'status');
    await queryInterface.removeColumn('branches', 'opening_hours');
  }
};
