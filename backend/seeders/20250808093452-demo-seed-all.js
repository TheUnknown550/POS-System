'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed companies
    await queryInterface.bulkInsert('companies', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Awesome Restaurants Inc',
        created_at: new Date(),
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Delicious Foods LLC',
        created_at: new Date(),
      },
    ]);

    // Seed users
    await queryInterface.bulkInsert('users', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Alice Admin',
        email: 'alice@example.com',
        password_hash: 'hashed_password_here',
        created_at: new Date(),
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Bob Manager',
        email: 'bob@example.com',
        password_hash: 'hashed_password_here',
        created_at: new Date(),
      },
    ]);

    // Fetch companies and users
    const companies = await queryInterface.sequelize.query(
      `SELECT id, name FROM companies WHERE name IN ('Awesome Restaurants Inc', 'Delicious Foods LLC');`
    );
    const companyIds = companies[0];

    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('alice@example.com', 'bob@example.com');`
    );
    const userIds = users[0];

    // Seed company_admins
    await queryInterface.bulkInsert('company_admins', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        user_id: userIds.find(u => u.email === 'alice@example.com').id,
        company_id: companyIds.find(c => c.name === 'Awesome Restaurants Inc').id,
        role: 'owner',
        created_at: new Date(),
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        user_id: userIds.find(u => u.email === 'bob@example.com').id,
        company_id: companyIds.find(c => c.name === 'Delicious Foods LLC').id,
        role: 'manager',
        created_at: new Date(),
      },
    ]);

    // Seed branches
    await queryInterface.bulkInsert('branches', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        company_id: companyIds.find(c => c.name === 'Awesome Restaurants Inc').id,
        name: 'Downtown Branch',
        address: '123 Main St',
        created_at: new Date(),
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        company_id: companyIds.find(c => c.name === 'Delicious Foods LLC').id,
        name: 'Uptown Branch',
        address: '456 Elm St',
        created_at: new Date(),
      },
    ]);

    // Fetch branches
    const branches = await queryInterface.sequelize.query(
      `SELECT id, name FROM branches WHERE name IN ('Downtown Branch', 'Uptown Branch');`
    );
    const branchIds = branches[0];

    // Seed branch_staff
    await queryInterface.bulkInsert('branch_staff', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        branch_id: branchIds.find(b => b.name === 'Downtown Branch').id,
        user_id: userIds.find(u => u.email === 'alice@example.com').id,
        role: 'manager',
        created_at: new Date(),
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        branch_id: branchIds.find(b => b.name === 'Uptown Branch').id,
        user_id: userIds.find(u => u.email === 'bob@example.com').id,
        role: 'cashier',
        created_at: new Date(),
      },
    ]);

    // Seed branch_tables
    await queryInterface.bulkInsert('branch_tables', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        branch_id: branchIds.find(b => b.name === 'Downtown Branch').id,
        table_number: '1',
        status: 'available',
        created_at: new Date(),
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        branch_id: branchIds.find(b => b.name === 'Downtown Branch').id,
        table_number: '2',
        status: 'occupied',
        created_at: new Date(),
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        branch_id: branchIds.find(b => b.name === 'Uptown Branch').id,
        table_number: '1',
        status: 'available',
        created_at: new Date(),
      },
    ]);

    // Seed product_categories
    await queryInterface.bulkInsert('product_categories', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Beverages',
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        name: 'Appetizers',
      },
    ]);

    // Fetch product_categories
    const categories = await queryInterface.sequelize.query(
      `SELECT id, name FROM product_categories WHERE name IN ('Beverages', 'Appetizers');`
    );
    const categoryIds = categories[0];

    // Seed products
    await queryInterface.bulkInsert('products', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        category_id: categoryIds.find(c => c.name === 'Beverages').id,
        name: 'Coffee',
        price: 2.50,
        sku: 'BEV-001',
        created_at: new Date(),
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        category_id: categoryIds.find(c => c.name === 'Appetizers').id,
        name: 'Spring Rolls',
        price: 5.00,
        sku: 'APP-001',
        created_at: new Date(),
      },
    ]);

    // Fetch products
    const products = await queryInterface.sequelize.query(
      `SELECT id, name FROM products WHERE name IN ('Coffee', 'Spring Rolls');`
    );
    const productIds = products[0];

    // Fetch branch_tables for order table assignment
    const tables = await queryInterface.sequelize.query(
      `SELECT id, table_number, branch_id FROM branch_tables WHERE branch_id IN (${branchIds
        .map(b => `'${b.id}'`)
        .join(',')});`
    );
    const tableIds = tables[0];

    // Seed orders (one for Downtown Branch, table 1)
    const downtownBranchId = branchIds.find(b => b.name === 'Downtown Branch').id;
    const downtownTable1 = tableIds.find(t => t.branch_id === downtownBranchId && t.table_number === '1');

    await queryInterface.bulkInsert('orders', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        branch_id: downtownBranchId,
        table_id: downtownTable1 ? downtownTable1.id : null,
        order_date: new Date(),
        status: 'pending',
        total_amount: 10.00,
      },
    ]);

    // Fetch inserted order
    const orders = await queryInterface.sequelize.query(
      `SELECT id FROM orders WHERE branch_id = '${downtownBranchId}' ORDER BY order_date DESC LIMIT 1;`
    );
    const orderId = orders[0][0].id;

    // Seed order_items for the order: 2 Coffees and 1 Spring Roll
    await queryInterface.bulkInsert('order_items', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        order_id: orderId,
        product_id: productIds.find(p => p.name === 'Coffee').id,
        quantity: 2,
        unit_price: 2.50,
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        order_id: orderId,
        product_id: productIds.find(p => p.name === 'Spring Rolls').id,
        quantity: 1,
        unit_price: 5.00,
      },
    ]);

    // Seed payments (partial payment example)
    await queryInterface.bulkInsert('payments', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        order_id: orderId,
        amount: 10.00,
        method: 'cash',
        paid_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('payments', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('product_categories', null, {});
    await queryInterface.bulkDelete('branch_tables', null, {});
    await queryInterface.bulkDelete('branch_staff', null, {});
    await queryInterface.bulkDelete('branches', null, {});
    await queryInterface.bulkDelete('company_admins', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('companies', null, {});
  },
};
