const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const { paymentValidations } = require('../validations');

const router = express.Router();
const pc = paymentController;

// Create payment URL for order (bind so class methods keep `this`)
router.post('/create-url', verifyToken, paymentValidations.createUrl, pc.createPaymentUrl.bind(pc));

// Generic callback route (legacy)
router.post('/callback/:paymentMethod', pc.handleCallback.bind(pc));

// Provider-specific webhooks (recommended)
router.post('/webhook/:provider', pc.handleProviderWebhook.bind(pc));

// Admin refund endpoint
router.post('/refund/:orderId', verifyToken, authorize('ADMIN', 'STAFF'), pc.refundPayment.bind(pc));

// Verify payment status
router.get('/verify/:orderId', verifyToken, pc.verifyPayment.bind(pc));

// Get payment status by order
router.get('/order/:orderId', verifyToken, pc.getPaymentStatus.bind(pc));

module.exports = router;
