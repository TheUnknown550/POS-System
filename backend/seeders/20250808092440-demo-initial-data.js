'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed companies
    await queryInterface.bulkInsert('companies', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Awesome Restaurants Inc',
        created_at: new Date()
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Delicious Foods LLC',
        created_at: new Date()
      }
    ]);

    // Seed users
    await queryInterface.bulkInsert('users', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Alice Admin',
        email: 'alice@example.com',
        password_hash: 'hashed_password_here',
        created_at: new Date()
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Bob Manager',
        email: 'bob@example.com',
        password_hash: 'hashed_password_here',
        created_at: new Date()
      }
    ]);

    // Get company and user IDs for foreign keys — select id + identifying field
    const companies = await queryInterface.sequelize.query(
      `SELECT id, name FROM companies WHERE name IN ('Awesome Restaurants Inc', 'Delicious Foods LLC');`
    );

    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('alice@example.com', 'bob@example.com');`
    );

    const companyIds = companies[0]; // array of {id, name}
    const userIds = users[0];        // array of {id, email}

    // Seed company_admins linking user Alice as owner for first company
    await queryInterface.bulkInsert('company_admins', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        user_id: userIds.find(u => u.email === 'alice@example.com').id,
        company_id: companyIds.find(c => c.name === 'Awesome Restaurants Inc').id,
        role: 'owner',
        created_at: new Date()
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        user_id: userIds.find(u => u.email === 'bob@example.com').id,
        company_id: companyIds.find(c => c.name === 'Delicious Foods LLC').id,
        role: 'manager',
        created_at: new Date()
      }
    ]);

    // Seed branches
    await queryInterface.bulkInsert('branches', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        company_id: companyIds.find(c => c.name === 'Awesome Restaurants Inc').id,
        name: 'Downtown Branch',
        address: '123 Main St',
        created_at: new Date()
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        company_id: companyIds.find(c => c.name === 'Delicious Foods LLC').id,
        name: 'Uptown Branch',
        address: '456 Elm St',
        created_at: new Date()
      }
    ]);

    // Seed product categories
    await queryInterface.bulkInsert('product_categories', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Beverages'
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Appetizers'
      }
    ]);

    // Get category IDs for products
    const categories = await queryInterface.sequelize.query(
      `SELECT id, name FROM product_categories WHERE name IN ('Beverages', 'Appetizers');`
    );

    const categoryIds = categories[0]; // array of {id, name}

    // Seed products
    await queryInterface.bulkInsert('products', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        category_id: categoryIds.find(c => c.name === 'Beverages').id,
        name: 'Coffee',
        price: 2.50,
        sku: 'BEV-001',
        created_at: new Date()
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        category_id: categoryIds.find(c => c.name === 'Appetizers').id,
        name: 'Spring Rolls',
        price: 5.00,
        sku: 'APP-001',
        created_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('product_categories', null, {});
    await queryInterface.bulkDelete('branches', null, {});
    await queryInterface.bulkDelete('company_admins', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('companies', null, {});
  }
};
