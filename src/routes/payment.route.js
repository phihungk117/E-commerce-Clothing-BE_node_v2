const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const { paymentValidations } = require('../validations');

const router = express.Router();

// Create payment URL for order
router.post('/create-url', verifyToken, paymentValidations.createUrl, paymentController.createPaymentUrl);

// Generic callback route (legacy)
router.post('/callback/:paymentMethod', paymentController.handleCallback);

// Provider-specific webhooks (recommended)
router.post('/webhook/:provider(VNPAY|MOMO|ZALOPAY|STRIPE|CREDIT_CARD)', paymentController.handleProviderWebhook);

// Admin refund endpoint
router.post('/refund/:orderId', verifyToken, authorize('ADMIN', 'STAFF'), paymentController.refundPayment);

// Verify payment status
router.get('/verify/:orderId', verifyToken, paymentController.verifyPayment);

// Get payment status by order
router.get('/order/:orderId', verifyToken, paymentController.getPaymentStatus);

module.exports = router;
