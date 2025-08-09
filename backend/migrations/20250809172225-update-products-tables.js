'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration was already applied manually
    console.log('Migration already applied');
  },

  async down(queryInterface, Sequelize) {
    // This migration was already applied manually
    console.log('Migration rollback not needed');
  }
};