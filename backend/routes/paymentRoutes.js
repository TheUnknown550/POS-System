const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

// Import authentication middleware
const { authenticateToken } = require('./authRoutes');

// Payment routes (protected)
router.get('/', authenticateToken, PaymentController.getAllPayments);
router.get('/:id', authenticateToken, PaymentController.getPaymentById);
router.post('/', authenticateToken, PaymentController.createPayment);
router.delete('/:id', authenticateToken, PaymentController.refundPayment);

module.exports = router;
