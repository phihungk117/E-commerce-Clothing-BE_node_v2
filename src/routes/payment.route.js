const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create-url', verifyToken, (req, res, next) => paymentController.createPaymentUrl(req, res, next));
router.get('/verify/:orderId', verifyToken, (req, res, next) => paymentController.verifyPayment(req, res, next));
router.get('/order/:orderId', verifyToken, (req, res, next) => paymentController.getPaymentStatus(req, res, next));
router.post('/refund/:orderId', verifyToken, (req, res, next) => paymentController.refundPayment(req, res, next));

router.post('/callback/:paymentMethod', (req, res, next) => paymentController.handleCallback(req, res, next));
router.post('/webhook/:provider', (req, res, next) => paymentController.handleProviderWebhook(req, res, next));

module.exports = router;
