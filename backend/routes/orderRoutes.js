const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const PaymentController = require('../controllers/paymentController');

// Order routes
router.get('/', OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);
router.put('/:id/status', OrderController.updateOrderStatus);
router.post('/:id/items', OrderController.addOrderItem);

// Order payment routes
router.get('/:orderId/payments', PaymentController.getPaymentsByOrder);

module.exports = router;
