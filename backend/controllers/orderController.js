const { Order, OrderItem, Product, Branch, BranchTable, Payment, ProductCategory } = require('../models');
const { Op } = require('sequelize');

class OrderController {
  // GET /api/orders
  static async getAllOrders(req, res) {
    try {
      const { branch_id, status, table_id, date_from, date_to, limit = 50, offset = 0 } = req.query;
      const userCompanyId = req.user.companyId;

      // If user doesn't have a company, return empty results
      if (!userCompanyId) {
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'No company associated with user'
        });
      }

      let whereClause = {};

      if (branch_id) whereClause.branch_id = branch_id;
      if (status) whereClause.status = status;
      if (table_id) whereClause.table_id = table_id;

      if (date_from || date_to) {
        whereClause.order_date = {};
        if (date_from) whereClause.order_date[Op.gte] = new Date(date_from);
        if (date_to) whereClause.order_date[Op.lte] = new Date(date_to);
      }

      const orders = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Branch,
            as: 'branch',
            where: { company_id: userCompanyId }
          },
          {
            model: BranchTable,
            as: 'table'
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                include: [{ model: ProductCategory, as: 'category' }]
              }
            ]
          },
          {
            model: Payment,
            as: 'payments'
          }
        ],
        order: [['order_date', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: orders.rows,
        count: orders.count,
        pagination: {
          total: orders.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(orders.count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        message: error.message
      });
    }
  }

  // GET /api/orders/:id
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branch'
          },
          {
            model: BranchTable,
            as: 'table'
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                include: [{ model: ProductCategory, as: 'category' }]
              }
            ]
          },
          {
            model: Payment,
            as: 'payments'
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order',
        message: error.message
      });
    }
  }

  // POST /api/orders
  static async createOrder(req, res) {
    try {
      const { branch_id, table_id, items, status = 'pending' } = req.body;

      if (!branch_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Branch ID and items are required'
        });
      }

      // Check if branch exists
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Branch not found'
        });
      }

      // Check if table exists (if provided)
      if (table_id) {
        const table = await BranchTable.findByPk(table_id);
        if (!table) {
          return res.status(404).json({
            success: false,
            error: 'Table not found'
          });
        }
      }

      // Validate and calculate total amount
      let total_amount = 0;
      const validatedItems = [];

      for (const item of items) {
        const { product_id, quantity } = item;
        
        if (!product_id || !quantity || quantity <= 0) {
          return res.status(400).json({
            success: false,
            error: 'Each item must have a valid product_id and quantity > 0'
          });
        }

        const product = await Product.findByPk(product_id);
        if (!product) {
          return res.status(404).json({
            success: false,
            error: `Product with ID ${product_id} not found`
          });
        }

        const itemTotal = parseFloat(product.price) * parseInt(quantity);
        total_amount += itemTotal;

        validatedItems.push({
          product_id,
          quantity: parseInt(quantity),
          unit_price: parseFloat(product.price)
        });
      }

      // Create order
      const order = await Order.create({
        branch_id,
        table_id,
        status,
        total_amount: total_amount.toFixed(2)
      });

      // Create order items
      const orderItems = await Promise.all(
        validatedItems.map(item => 
          OrderItem.create({
            order_id: order.id,
            ...item
          })
        )
      );

      // Update table status if table is provided
      if (table_id) {
        await BranchTable.update(
          { status: 'occupied' },
          { where: { id: table_id } }
        );
      }

      // Fetch complete order with relationships
      const createdOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: Branch,
            as: 'branch'
          },
          {
            model: BranchTable,
            as: 'table'
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                include: [{ model: ProductCategory, as: 'category' }]
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: createdOrder,
        message: 'Order created successfully'
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create order',
        message: error.message
      });
    }
  }

  // PUT /api/orders/:id/status
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }

      const validStatuses = ['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      await order.update({ status });

      // If order is paid or cancelled, update table status to available
      if ((status === 'paid' || status === 'cancelled') && order.table_id) {
        await BranchTable.update(
          { status: 'available' },
          { where: { id: order.table_id } }
        );
      }

      res.json({
        success: true,
        data: order,
        message: 'Order status updated successfully'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status',
        message: error.message
      });
    }
  }

  // POST /api/orders/:id/items
  static async addOrderItem(req, res) {
    try {
      const { id } = req.params;
      const { product_id, quantity } = req.body;

      if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Product ID and quantity > 0 are required'
        });
      }

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      if (['paid', 'cancelled'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          error: 'Cannot add items to paid or cancelled orders'
        });
      }

      const product = await Product.findByPk(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Create order item
      const orderItem = await OrderItem.create({
        order_id: id,
        product_id,
        quantity: parseInt(quantity),
        unit_price: parseFloat(product.price)
      });

      // Update order total
      const itemTotal = parseFloat(product.price) * parseInt(quantity);
      const newTotal = parseFloat(order.total_amount) + itemTotal;
      await order.update({ total_amount: newTotal.toFixed(2) });

      // Fetch created item with product info
      const createdItem = await OrderItem.findByPk(orderItem.id, {
        include: [
          {
            model: Product,
            as: 'product',
            include: [{ model: ProductCategory, as: 'category' }]
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: createdItem,
        message: 'Item added to order successfully'
      });
    } catch (error) {
      console.error('Error adding order item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add order item',
        message: error.message
      });
    }
  }

  // GET /api/branches/:branchId/orders
  static async getOrdersByBranch(req, res) {
    try {
      const { branchId } = req.params;
      const { status, date, limit = 50, offset = 0 } = req.query;
      
      let whereClause = { branch_id: branchId };
      if (status) whereClause.status = status;
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        whereClause.order_date = {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        };
      }

      const orders = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: BranchTable,
            as: 'table'
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                include: [{ model: ProductCategory, as: 'category' }]
              }
            ]
          },
          {
            model: Payment,
            as: 'payments'
          }
        ],
        order: [['order_date', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: orders.rows,
        count: orders.count,
        pagination: {
          total: orders.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(orders.count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching branch orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch branch orders',
        message: error.message
      });
    }
  }
}

module.exports = OrderController;
