const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { Order, Payment, Product, User, Company, Branch } = require('../models');
const { Op } = require('sequelize');

// Import authentication middleware
const { authenticateToken } = require('./authRoutes');

// Base reports route - Get available reports
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Reports API',
    availableReports: {
      payments: '/api/reports/payments',
      sales: '/api/reports/sales',
      daily: '/api/reports/daily',
      monthly: '/api/reports/monthly',
      products: '/api/reports/products',
      summary: '/api/reports/summary'
    }
  });
});

// Payment reports (protected)
router.get('/payments', authenticateToken, PaymentController.getPaymentReport);

// Sales reports (protected)
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;
    const userCompanyId = req.user.companyId;
    
    let whereClause = {};
    if (startDate && endDate) {
      whereClause.order_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    if (branchId) {
      whereClause.branch_id = branchId;
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        { 
          model: Branch, 
          as: 'branch',
          where: userCompanyId ? { company_id: userCompanyId } : { company_id: null }
        },
        { model: Payment, as: 'payments' }
      ],
      order: [['order_date', 'DESC']]
    });

    const salesData = orders.map(order => ({
      id: order.id,
      date: order.order_date,
      branch: order.branch?.name,
      total: order.total_amount,
      status: order.status,
      paymentStatus: order.payments?.length > 0 ? 'paid' : 'pending'
    }));

    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const averageOrder = orders.length > 0 ? totalSales / orders.length : 0;

    res.json({
      success: true,
      data: salesData,
      summary: {
        totalOrders: orders.length,
        totalSales: totalSales.toFixed(2),
        averageOrderValue: averageOrder.toFixed(2),
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      }
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sales report',
      message: error.message
    });
  }
});

// Daily reports
router.get('/daily', authenticateToken, async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.findAll({
      where: {
        order_date: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      include: [
        { model: Branch, as: 'branch' },
        { model: Payment, as: 'payments' }
      ]
    });

    const payments = await Payment.findAll({
      where: {
        paid_at: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const paidOrders = orders.filter(order => order.payments?.length > 0).length;
    const pendingOrders = totalOrders - paidOrders;

    res.json({
      success: true,
      data: {
        date: date,
        totalOrders,
        totalSales: totalSales.toFixed(2),
        totalPayments: totalPayments.toFixed(2),
        paidOrders,
        pendingOrders,
        averageOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00'
      }
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate daily report',
      message: error.message
    });
  }
});

// Monthly reports
router.get('/monthly', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const orders = await Order.findAll({
      where: {
        order_date: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      },
      include: [
        { model: Branch, as: 'branch' },
        { model: Payment, as: 'payments' }
      ]
    });

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const paidOrders = orders.filter(order => order.payments?.length > 0).length;

    // Group by day
    const dailyData = {};
    orders.forEach(order => {
      const day = order.order_date.getDate();
      if (!dailyData[day]) {
        dailyData[day] = { orders: 0, sales: 0 };
      }
      dailyData[day].orders++;
      dailyData[day].sales += parseFloat(order.total_amount || 0);
    });

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        totalOrders,
        totalSales: totalSales.toFixed(2),
        paidOrders,
        pendingOrders: totalOrders - paidOrders,
        averageOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00',
        dailyBreakdown: dailyData
      }
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate monthly report',
      message: error.message
    });
  }
});

// Product performance reports
router.get('/products', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = {};
    if (startDate && endDate) {
      whereClause.order_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: require('../models').OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    const productStats = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        const productId = item.product_id;
        const productName = item.product?.name || 'Unknown Product';
        
        if (!productStats[productId]) {
          productStats[productId] = {
            name: productName,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        
        productStats[productId].totalQuantity += parseInt(item.quantity || 0);
        productStats[productId].totalRevenue += parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0);
        productStats[productId].orderCount++;
      });
    });

    const sortedProducts = Object.values(productStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      success: true,
      data: sortedProducts,
      summary: {
        totalProducts: sortedProducts.length,
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      }
    });
  } catch (error) {
    console.error('Error generating product report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate product report',
      message: error.message
    });
  }
});

// Summary dashboard report
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userCompanyId = req.user.companyId;
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Build base where clause for company filtering
    const companyFilter = userCompanyId ? {
      include: [{
        model: Branch,
        as: 'branch',
        where: { company_id: userCompanyId }
      }]
    } : {};

    // Today's stats
    const todayOrders = await Order.count({
      where: { order_date: { [Op.gte]: startOfToday } },
      ...companyFilter
    });

    const todaySales = await Order.sum('total_amount', {
      where: { order_date: { [Op.gte]: startOfToday } },
      ...companyFilter
    }) || 0;

    // This week's stats
    const weekOrders = await Order.count({
      where: { order_date: { [Op.gte]: startOfWeek } },
      ...companyFilter
    });

    const weekSales = await Order.sum('total_amount', {
      where: { order_date: { [Op.gte]: startOfWeek } }
    }) || 0;

    // This month's stats
    const monthOrders = await Order.count({
      where: { order_date: { [Op.gte]: startOfMonth } }
    });

    const monthSales = await Order.sum('total_amount', {
      where: { order_date: { [Op.gte]: startOfMonth } }
    }) || 0;

    // Total stats
    const totalOrders = await Order.count();
    const totalSales = await Order.sum('total_amount') || 0;
    const totalProducts = await Product.count();
    const totalBranches = await Branch.count();

    res.json({
      success: true,
      data: {
        today: {
          orders: todayOrders,
          sales: parseFloat(todaySales).toFixed(2)
        },
        thisWeek: {
          orders: weekOrders,
          sales: parseFloat(weekSales).toFixed(2)
        },
        thisMonth: {
          orders: monthOrders,
          sales: parseFloat(monthSales).toFixed(2)
        },
        totals: {
          orders: totalOrders,
          sales: parseFloat(totalSales).toFixed(2),
          products: totalProducts,
          branches: totalBranches
        }
      }
    });
  } catch (error) {
    console.error('Error generating summary report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary report',
      message: error.message
    });
  }
});

module.exports = router;
