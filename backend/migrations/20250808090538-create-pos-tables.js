'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Users
    await queryInterface.createTable('users', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Companies
    await queryInterface.createTable('companies', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      name: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Company Admins
    await queryInterface.createTable('company_admins', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      user_id: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'users', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      company_id: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'companies', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      role: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Branches
    await queryInterface.createTable('branches', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      company_id: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'companies', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      name: { type: Sequelize.STRING, allowNull: false },
      address: { type: Sequelize.STRING },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Branch Staff
    await queryInterface.createTable('branch_staff', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      branch_id: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'branches', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      user_id: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'users', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      role: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Branch Tables
    await queryInterface.createTable('branch_tables', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      branch_id: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'branches', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      table_number: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false }, // available, occupied
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Product Categories
    await queryInterface.createTable('product_categories', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      name: { type: Sequelize.STRING, allowNull: false }
    });

    // Products
    await queryInterface.createTable('products', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      category_id: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'product_categories', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      name: { type: Sequelize.STRING, allowNull: false },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      sku: { type: Sequelize.STRING, unique: true, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Orders
    await queryInterface.createTable('orders', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      branch_id: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'branches', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      table_id: { 
        type: Sequelize.UUID, 
        allowNull: true, 
        references: { model: 'branch_tables', key: 'id' }, 
        onDelete: 'SET NULL' 
      },
      order_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      status: { type: Sequelize.STRING, allowNull: false }, // pending, paid, cancelled
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false }
    });

    // Order Items
    await queryInterface.createTable('order_items', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      order_id: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'orders', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      product_id: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'products', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false }
    });

    // Payments
    await queryInterface.createTable('payments', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      order_id: { 
        type: Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'orders', key: 'id' }, 
        onDelete: 'CASCADE' 
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      method: { type: Sequelize.STRING, allowNull: false }, // cash, card
      paid_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('product_categories');
    await queryInterface.dropTable('branch_tables');
    await queryInterface.dropTable('branch_staff');
    await queryInterface.dropTable('branches');
    await queryInterface.dropTable('company_admins');
    await queryInterface.dropTable('companies');
    await queryInterface.dropTable('users');
  }
};
