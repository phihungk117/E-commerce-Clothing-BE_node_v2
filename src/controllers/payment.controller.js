const paymentService = require('../services/payment.service');
const { Payment, Order } = require('../models');

class PaymentController {
  async assertOrderAccess(orderId, user) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');

    const role = user?.role;
    const isAdmin = role === 'ADMIN' || role === 'STAFF';
    if (!isAdmin && order.user_id && order.user_id !== user?.user_id) {
      throw new Error('Forbidden');
    }

    return order;
  }

  async createPaymentUrl(req, res, next) {
    try {
      const { orderId, paymentMethod } = req.body;
      // Ưu tiên Return URL từ env để đồng bộ merchant config (không override từ FE)
      const callbackUrl = process.env.VNPAY_RETURN_URL;

      await this.assertOrderAccess(orderId, req.user);
      const result = await paymentService.createPaymentUrl(orderId, paymentMethod, callbackUrl);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async handleProviderWebhook(req, res, next) {
    req.params.paymentMethod = req.params.provider;
    return this.handleCallback(req, res, next);
  }

  async handleCallback(req, res, next) {
    try {
      const { paymentMethod } = req.params;
      const callbackData = (req.method === 'GET' ? req.query : req.body) || {};

      const rawPayload = req.rawBody || JSON.stringify(callbackData || {});
      const verified = paymentService.verifyProviderSignature(paymentMethod, callbackData, req.headers, rawPayload);
      if (!verified) {
        if (req.method === 'GET') {
          return res.status(400).send('Invalid payment callback signature');
        }
        return res.status(400).json({ success: false, message: 'Invalid payment callback signature' });
      }

      const result = await paymentService.handleCallback(paymentMethod, callbackData);

      if (result.success) {
        const existingPayment = await Payment.findOne({ where: { order_id: result.orderId } });

        if (existingPayment && existingPayment.payment_status === 'SUCCESS') {
          if (req.method === 'GET') {
            return res.redirect(`${process.env.FRONT_END_URL}/orders/${result.orderId}`);
          }
          return res.status(200).json({
            success: true,
            idempotent: true,
            orderId: result.orderId,
            transactionCode: existingPayment.transaction_code || result.transactionCode,
          });
        }

        await Payment.update(
          {
            payment_status: 'SUCCESS',
            transaction_code: result.transactionCode,
            payment_time: new Date(),
          },
          { where: { order_id: result.orderId } }
        );

        await Order.update(
          { order_status: 'CONFIRMED' },
          { where: { order_id: result.orderId } }
        );

        if (req.method === 'GET') {
          return res.redirect(`${process.env.FRONT_END_URL}/orders/${result.orderId}`);
        }
      }

      if (req.method === 'GET') {
        return res.redirect(`${process.env.FRONT_END_URL}/orders`);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refundPayment(req, res, next) {
    try {
      const { orderId } = req.params;
      const reason = req.body?.reason || null;
      const actorId = req.user?.user_id || null;

      await this.assertOrderAccess(orderId, req.user);
      const payment = await paymentService.refundPayment(orderId, { reason, actorId });
      res.status(200).json({ message: 'Payment refunded', payment });
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req, res, next) {
    try {
      const { orderId } = req.params;
      const { paymentMethod } = req.query;

      await this.assertOrderAccess(orderId, req.user);
      const payment = await paymentService.verifyPayment(orderId, paymentMethod);
      res.status(200).json({ payment });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentStatus(req, res, next) {
    try {
      const { orderId } = req.params;

      await this.assertOrderAccess(orderId, req.user);
      const payment = await Payment.findOne({
        where: { order_id: orderId },
        include: [{ model: Order, as: 'order' }],
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      res.status(200).json({ payment });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
