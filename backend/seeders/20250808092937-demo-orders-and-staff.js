'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get existing users, branches, tables, products for foreign keys
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('alice@example.com', 'bob@example.com');`
    );
    const userIds = users[0];

    const branches = await queryInterface.sequelize.query(
      `SELECT id, name FROM branches WHERE name IN ('Downtown Branch', 'Uptown Branch');`
    );
    const branchIds = branches[0];

    const tables = await queryInterface.sequelize.query(
      `SELECT id, table_number FROM branch_tables WHERE branch_id IN (SELECT id FROM branches);`
    );
    const tableIds = tables[0];

    const products = await queryInterface.sequelize.query(
      `SELECT id, name FROM products WHERE name IN ('Coffee', 'Spring Rolls');`
    );
    const productIds = products[0];

    // Seed branch_staff - add Alice as manager of Downtown Branch, Bob as cashier of Uptown Branch
    await queryInterface.bulkInsert('branch_staff', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        branch_id: branchIds.find(b => b.name === 'Downtown Branch').id,
        user_id: userIds.find(u => u.email === 'alice@example.com').id,
        role: 'manager',
        created_at: new Date()
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        branch_id: branchIds.find(b => b.name === 'Uptown Branch').id,
        user_id: userIds.find(u => u.email === 'bob@example.com').id,
        role: 'cashier',
        created_at: new Date()
      }
    ]);

    // Seed orders - example order at Downtown Branch, table 1
    // For demo, use the first table found, or null for takeaway
    const downtownBranchId = branchIds.find(b => b.name === 'Downtown Branch').id;
    const downtownTableId = tableIds.length ? tableIds[0].id : null;

    await queryInterface.bulkInsert('orders', [
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        branch_id: downtownBranchId,
        table_id: downtownTableId,  // null if takeaway
        order_date: new Date(),
        status: 'pending',
        total_amount: 10.00
      }
    ]);

    // Get the inserted order's id
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
        unit_price: 2.50
      },
      {
        id: Sequelize.literal('uuid_generate_v4()'),
        order_id: orderId,
        product_id: productIds.find(p => p.name === 'Spring Rolls').id,
        quantity: 1,
        unit_price: 5.00
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('branch_staff', null, {});
  }
};
