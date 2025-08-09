const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const PaymentController = require('../controllers/paymentController');

// Import authentication middleware
const { authenticateToken } = require('./authRoutes');

// Order routes (protected)
router.get('/', authenticateToken, OrderController.getAllOrders);
router.get('/:id', authenticateToken, OrderController.getOrderById);
router.post('/', authenticateToken, OrderController.createOrder);
router.put('/:id/status', authenticateToken, OrderController.updateOrderStatus);
router.post('/:id/items', authenticateToken, OrderController.addOrderItem);

// Order payment routes
router.get('/:orderId/payments', authenticateToken, PaymentController.getPaymentsByOrder);

module.exports = router;
