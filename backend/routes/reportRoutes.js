const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

// Report routes
router.get('/payments', PaymentController.getPaymentReport);

module.exports = router;
