const crypto = require('crypto');
const { Payment, Order } = require('../models');

// Base Payment Service
class PaymentService {
  async createPaymentUrl(orderId, paymentMethod, callbackUrl) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');

    switch (paymentMethod) {
      case 'VNPAY':
        return this.createVNPayUrl(order, callbackUrl);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  async handleCallback(paymentMethod, callbackData) {
    switch (paymentMethod) {
      case 'VNPAY':
        return this.handleVNPayCallback(callbackData);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  async verifyPayment(orderId, paymentMethod) {
    const payment = await Payment.findOne({ where: { order_id: orderId } });
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  async refundPayment(orderId, { reason = null, actorId = null } = {}) {
    const payment = await Payment.findOne({ where: { order_id: orderId } });
    if (!payment) throw new Error('Payment not found');

    if (!['SUCCESS'].includes(payment.payment_status)) {
      throw new Error('Payment is not refundable');
    }

    await payment.update({
      payment_status: 'REFUNDED',
      payment_time: new Date(),
      transaction_code: payment.transaction_code || `REF-${Date.now()}`
    });

    const order = await Order.findByPk(orderId);
    if (order && order.order_status !== 'RETURNED') {
      await order.update({
        order_status: 'CANCELLED',
        note: [order.note, reason ? `Refund: ${reason}` : null, actorId ? `by ${actorId}` : null]
          .filter(Boolean)
          .join(' | ')
      });
    }

    return payment;
  }

  // VNPay integration
  createVNPayUrl(order, callbackUrl) {
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE || 'YOUR_TMN_CODE';
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || 'YOUR_HASH_SECRET';
    const vnp_Url = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const vnp_ReturnUrl = callbackUrl || process.env.VNPAY_RETURN_URL;

    const date = new Date();
    const createDate = dateFormat(date, 'yyyyMMddHHmmss');
    const orderId = order.order_id;
    const amount = Math.round(order.total_amount * 100);
    const orderType = 'other';

    const vnp_Params = {
      vnp_Amount: amount,
      vnp_Command: 'pay',
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toán đơn hàng ${order.order_code}`,
      vnp_OrderType: orderType,
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_TxnRef: orderId,
      vnp_Version: '2.1.0'
    };

    // Sort and create hash
    const sortedParams = Object.keys(vnp_Params).sort().reduce((obj, key) => {
      obj[key] = vnp_Params[key];
      return obj;
    }, {});

    const signData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = vnp_Url + '?' + Object.entries(vnp_Params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return { paymentUrl, method: 'VNPAY' };
  }

  handleVNPayCallback(data) {
    const vnp_SecureHash = data.vnp_SecureHash;
    delete data.vnp_SecureHash;

    // Verify signature
    const signData = Object.entries(data)
      .filter(([key]) => key.startsWith('vnp_'))
      .sort()
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (vnp_SecureHash === signed && data.vnp_ResponseCode === '00') {
      return { success: true, orderId: data.vnp_TxnRef, transactionCode: data.vnp_TransactionNo };
    }
    return { success: false, message: 'Payment failed' };
  }

  verifyVNPaySignature(data) {
    const hash = data?.vnp_SecureHash;
    const secret = process.env.VNPAY_HASH_SECRET;
    if (!hash || !secret) return false;

    const copy = { ...data };
    delete copy.vnp_SecureHash;
    delete copy.vnp_SecureHashType;

    const signData = Object.entries(copy)
      .filter(([key, value]) => key.startsWith('vnp_') && value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const expected = crypto.createHmac('sha512', secret).update(Buffer.from(signData, 'utf-8')).digest('hex');
    return hash === expected;
  }

  verifyProviderSignature(paymentMethod, callbackData, _headers, _rawPayload) {
    if (paymentMethod === 'VNPAY') {
      return this.verifyVNPaySignature(callbackData);
    }
    return false;
  }
}

function dateFormat(date, format) {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('yyyy', yyyy)
    .replace('MM', MM)
    .replace('dd', dd)
    .replace('HH', HH)
    .replace('mm', mm)
    .replace('ss', ss);
}

module.exports = new PaymentService();
