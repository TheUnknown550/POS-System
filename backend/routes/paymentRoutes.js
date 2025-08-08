const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

// Payment routes
router.get('/', PaymentController.getAllPayments);
router.get('/:id', PaymentController.getPaymentById);
router.post('/', PaymentController.createPayment);
router.delete('/:id', PaymentController.refundPayment);

module.exports = router;
