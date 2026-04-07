const crypto = require('crypto');
const { Payment, Order } = require('../models');

function buildVNPaySignedQuery(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  const encodedPairs = sortedKeys.map((key) => {
    const value = params[key] ?? '';
    const encValue = encodeURIComponent(String(value)).replace(/%20/g, '+');
    return `${key}=${encValue}`;
  });
  const signData = encodedPairs.join('&');
  const hmac = crypto.createHmac('sha512', secret);
  const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  return { signData, secureHash };
}

function sanitizeIp(ip) {
  if (!ip || typeof ip !== 'string') return '127.0.0.1';
  return ip
    .replace('::ffff:', '')
    .split(',')[0]
    .trim() || '127.0.0.1';
}

// Base Payment Service
class PaymentService {
  async createPaymentUrl(orderId, paymentMethod, callbackUrl, clientIp) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');

    const method = String(paymentMethod || '').toUpperCase();
    switch (method) {
      case 'VNPAY':
        return this.createVNPayUrl(order, callbackUrl, clientIp);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  async handleCallback(paymentMethod, callbackData) {
    const method = String(paymentMethod || '').toUpperCase();
    switch (method) {
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
  createVNPayUrl(order, callbackUrl, clientIp) {
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE || 'YOUR_TMN_CODE';
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || 'YOUR_HASH_SECRET';
    const vnp_Url = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const vnp_ReturnUrl = callbackUrl || process.env.VNPAY_RETURN_URL;

    if (!vnp_TmnCode || vnp_TmnCode === 'YOUR_TMN_CODE') {
      throw new Error('VNPAY_TMN_CODE is not configured');
    }
    if (!vnp_HashSecret || vnp_HashSecret === 'YOUR_HASH_SECRET') {
      throw new Error('VNPAY_HASH_SECRET is not configured');
    }
    if (!vnp_ReturnUrl) {
      throw new Error('VNPAY_RETURN_URL is not configured');
    }

    const date = new Date();
    const createDate = dateFormat(date, 'yyyyMMddHHmmss');
    const orderId = order.order_id;
    const amount = Math.round(Number(order.total_amount) * 100);
    const orderType = 'other';

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Order amount is invalid for VNPay');
    }

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnp_TmnCode,
      vnp_Amount: amount,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${order.order_code || order.order_id}`,
      vnp_OrderType: orderType,
      vnp_Locale: 'vn',
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: sanitizeIp(clientIp),
      vnp_CreateDate: createDate
    };

    const { secureHash } = buildVNPaySignedQuery(vnp_Params, vnp_HashSecret);

    const sortedKeys = Object.keys(vnp_Params).sort();
    const query = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(String(vnp_Params[key])).replace(/%20/g, '+')}`)
      .join('&');

    const paymentUrl = `${vnp_Url}?${query}&vnp_SecureHash=${secureHash}`;

    return { paymentUrl, method: 'VNPAY', orderId: order.order_id };
  }

  handleVNPayCallback(data) {
    const payload = { ...(data || {}) };
    const isValidSignature = this.verifyVNPaySignature(payload);

    if (!isValidSignature) {
      return { success: false, message: 'Invalid VNPay signature' };
    }

    const responseCode = payload.vnp_ResponseCode;
    const transactionStatus = payload.vnp_TransactionStatus;

    if (responseCode === '00' && (!transactionStatus || transactionStatus === '00')) {
      return {
        success: true,
        orderId: payload.vnp_TxnRef,
        transactionCode: payload.vnp_TransactionNo || payload.vnp_TransactionId || null,
      };
    }

    return {
      success: false,
      message: `Payment failed with code ${responseCode || 'UNKNOWN'}`,
      orderId: payload.vnp_TxnRef,
    };
  }

  verifyVNPaySignature(data) {
    const hash = data?.vnp_SecureHash;
    const secret = process.env.VNPAY_HASH_SECRET;
    if (!hash || !secret) return false;

    const copy = { ...data };
    delete copy.vnp_SecureHash;
    delete copy.vnp_SecureHashType;

    const params = {};
    for (const [key, value] of Object.entries(copy)) {
      if (!key.startsWith('vnp_') || value === undefined || value === null) continue;
      params[key] = value;
    }

    const { secureHash } = buildVNPaySignedQuery(params, secret);
    return hash === secureHash;
  }

  verifyProviderSignature(paymentMethod, callbackData, _headers, _rawPayload) {
    const method = String(paymentMethod || '').toUpperCase();
    if (method === 'VNPAY') {
      return this.verifyVNPaySignature(callbackData);
    }
    return false;
  }

  getVNPayReturnCodeDescription(code) {
    const map = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công, giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Hết hạn chờ thanh toán',
      '12': 'Thẻ/Tài khoản bị khóa',
      '13': 'Sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Tài khoản vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Lỗi không xác định',
    };
    return map[String(code)] || 'Lỗi không xác định';
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
