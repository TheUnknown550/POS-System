const { Payment, Order, Branch, BranchTable } = require('../models');
const { Op } = require('sequelize');

class PaymentController {
  // GET /api/payments
  static async getAllPayments(req, res) {
    try {
      const { order_id, method, date_from, date_to, limit = 50, offset = 0 } = req.query;
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

      if (order_id) whereClause.order_id = order_id;
      if (method) whereClause.method = method;

      if (date_from || date_to) {
        whereClause.paid_at = {};
        if (date_from) whereClause.paid_at[Op.gte] = new Date(date_from);
        if (date_to) whereClause.paid_at[Op.lte] = new Date(date_to);
      }

      const payments = await Payment.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Order,
            as: 'order',
            include: [
              { 
                model: Branch, 
                as: 'branch',
                where: { company_id: userCompanyId }
              },
              { model: BranchTable, as: 'table' }
            ]
          }
        ],
        order: [['paid_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: payments.rows,
        count: payments.count,
        pagination: {
          total: payments.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(payments.count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payments',
        message: error.message
      });
    }
  }

  // GET /api/payments/:id
  static async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const payment = await Payment.findByPk(id, {
        include: [
          {
            model: Order,
            as: 'order',
            include: [
              { model: Branch, as: 'branch' },
              { model: BranchTable, as: 'table' }
            ]
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment',
        message: error.message
      });
    }
  }

  // POST /api/payments
  static async createPayment(req, res) {
    try {
      const { order_id, amount, method } = req.body;

      if (!order_id || !amount || !method) {
        return res.status(400).json({
          success: false,
          error: 'Order ID, amount, and payment method are required'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Payment amount must be greater than 0'
        });
      }

      const validMethods = ['cash', 'card', 'digital_wallet', 'bank_transfer'];
      if (!validMethods.includes(method)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment method. Must be one of: ' + validMethods.join(', ')
        });
      }

      // Check if order exists
      const order = await Order.findByPk(order_id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      if (order.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          error: 'Cannot process payment for cancelled order'
        });
      }

      // Check existing payments for this order
      const existingPayments = await Payment.findAll({
        where: { order_id }
      });

      const totalPaid = existingPayments.reduce((sum, payment) => 
        sum + parseFloat(payment.amount), 0
      );

      const newTotal = totalPaid + parseFloat(amount);
      const orderTotal = parseFloat(order.total_amount);

      if (newTotal > orderTotal) {
        return res.status(400).json({
          success: false,
          error: `Payment amount exceeds remaining balance. Remaining: ${(orderTotal - totalPaid).toFixed(2)}`
        });
      }

      // Create payment
      const payment = await Payment.create({
        order_id,
        amount: parseFloat(amount).toFixed(2),
        method
      });

      // Check if order is fully paid
      if (newTotal >= orderTotal) {
        await order.update({ status: 'paid' });
        
        // Update table status to available if order has a table
        if (order.table_id) {
          await BranchTable.update(
            { status: 'available' },
            { where: { id: order.table_id } }
          );
        }
      }

      // Fetch created payment with order info
      const createdPayment = await Payment.findByPk(payment.id, {
        include: [
          {
            model: Order,
            as: 'order',
            include: [
              { model: Branch, as: 'branch' },
              { model: BranchTable, as: 'table' }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: createdPayment,
        message: 'Payment processed successfully',
        order_status: newTotal >= orderTotal ? 'paid' : 'partially_paid',
        remaining_balance: (orderTotal - newTotal).toFixed(2)
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process payment',
        message: error.message
      });
    }
  }

  // GET /api/orders/:orderId/payments
  static async getPaymentsByOrder(req, res) {
    try {
      const { orderId } = req.params;

      const payments = await Payment.findAll({
        where: { order_id: orderId },
        order: [['paid_at', 'ASC']]
      });

      // Calculate payment summary
      const totalPaid = payments.reduce((sum, payment) => 
        sum + parseFloat(payment.amount), 0
      );

      const order = await Order.findByPk(orderId);
      const orderTotal = order ? parseFloat(order.total_amount) : 0;
      const remainingBalance = orderTotal - totalPaid;

      res.json({
        success: true,
        data: payments,
        count: payments.length,
        summary: {
          total_paid: totalPaid.toFixed(2),
          order_total: orderTotal.toFixed(2),
          remaining_balance: remainingBalance.toFixed(2),
          is_fully_paid: remainingBalance <= 0
        }
      });
    } catch (error) {
      console.error('Error fetching order payments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order payments',
        message: error.message
      });
    }
  }

  // GET /api/reports/payments
  static async getPaymentReport(req, res) {
    try {
      const { 
        branch_id, 
        date_from, 
        date_to, 
        method,
        group_by = 'day' // day, month, method
      } = req.query;

      let whereClause = {};
      let orderClause = {};

      if (date_from || date_to) {
        whereClause.paid_at = {};
        if (date_from) whereClause.paid_at[Op.gte] = new Date(date_from);
        if (date_to) whereClause.paid_at[Op.lte] = new Date(date_to);
      }

      if (method) whereClause.method = method;
      if (branch_id) orderClause.branch_id = branch_id;

      const payments = await Payment.findAll({
        where: whereClause,
        include: [
          {
            model: Order,
            as: 'order',
            where: orderClause,
            include: [{ model: Branch, as: 'branch' }]
          }
        ],
        order: [['paid_at', 'ASC']]
      });

      // Group payments based on group_by parameter
      const groupedData = {};
      let totalRevenue = 0;

      payments.forEach(payment => {
        let key;
        const amount = parseFloat(payment.amount);
        totalRevenue += amount;

        switch (group_by) {
          case 'method':
            key = payment.method;
            break;
          case 'month':
            key = payment.paid_at.toISOString().substring(0, 7); // YYYY-MM
            break;
          case 'day':
          default:
            key = payment.paid_at.toISOString().substring(0, 10); // YYYY-MM-DD
            break;
        }

        if (!groupedData[key]) {
          groupedData[key] = {
            key,
            total_amount: 0,
            payment_count: 0,
            payments: []
          };
        }

        groupedData[key].total_amount += amount;
        groupedData[key].payment_count += 1;
        groupedData[key].payments.push(payment);
      });

      // Convert to array and sort
      const reportData = Object.values(groupedData).map(group => ({
        ...group,
        total_amount: parseFloat(group.total_amount.toFixed(2)),
        payments: undefined // Remove detailed payments from summary
      }));

      res.json({
        success: true,
        data: reportData,
        summary: {
          total_revenue: parseFloat(totalRevenue.toFixed(2)),
          total_payments: payments.length,
          date_range: {
            from: date_from || 'All time',
            to: date_to || 'All time'
          },
          group_by
        }
      });
    } catch (error) {
      console.error('Error generating payment report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate payment report',
        message: error.message
      });
    }
  }

  // DELETE /api/payments/:id (refund)
  static async refundPayment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const payment = await Payment.findByPk(id, {
        include: [{ model: Order, as: 'order' }]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      const order = payment.order;
      
      // Check if refund is allowed (order should not be too old, etc.)
      const paymentDate = new Date(payment.paid_at);
      const now = new Date();
      const hoursDiff = (now - paymentDate) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return res.status(400).json({
          success: false,
          error: 'Cannot refund payments older than 24 hours'
        });
      }

      // Delete the payment (this is a refund)
      await payment.destroy();

      // Update order status if needed
      const remainingPayments = await Payment.findAll({
        where: { order_id: order.id }
      });

      const remainingTotal = remainingPayments.reduce((sum, p) => 
        sum + parseFloat(p.amount), 0
      );

      if (remainingTotal === 0) {
        await order.update({ status: 'pending' });
      }

      res.json({
        success: true,
        message: 'Payment refunded successfully',
        refunded_amount: payment.amount,
        reason: reason || 'No reason provided'
      });
    } catch (error) {
      console.error('Error refunding payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refund payment',
        message: error.message
      });
    }
  }
}

module.exports = PaymentController;
