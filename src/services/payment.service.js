const { VNPay } = require('vnpay');
const { Payment, Order } = require('../models');

function sanitizeIp(ip) {
  if (!ip || typeof ip !== 'string') return '127.0.0.1';
  return ip
    .replace('::ffff:', '')
    .split(',')[0]
    .trim() || '127.0.0.1';
}

function resolveVNPayHost() {
  const fallbackHost = 'https://sandbox.vnpayment.vn';
  const configuredUrl = process.env.VNPAY_URL;

  if (!configuredUrl) return fallbackHost;

  try {
    const u = new URL(configuredUrl);
    return `${u.protocol}//${u.host}`;
  } catch (_e) {
    return fallbackHost;
  }
}

let cachedVNPayClient = null;
let cachedClientKey = null;

function getVNPayClient() {
  const tmnCode = process.env.VNPAY_TMN_CODE || '';
  const secureSecret = process.env.VNPAY_HASH_SECRET || '';
  const vnpayHost = resolveVNPayHost();
  const testMode = String(process.env.VNPAY_TEST_MODE || 'true').toLowerCase() !== 'false';

  if (!tmnCode) {
    throw new Error('VNPAY_TMN_CODE is not configured');
  }
  if (!secureSecret) {
    throw new Error('VNPAY_HASH_SECRET is not configured');
  }

  const key = `${tmnCode}::${secureSecret}::${vnpayHost}::${testMode}`;
  if (cachedVNPayClient && cachedClientKey === key) return cachedVNPayClient;

  cachedVNPayClient = new VNPay({
    tmnCode,
    secureSecret,
    vnpayHost,
    testMode,
    enableLog: false,
  });
  cachedClientKey = key;

  return cachedVNPayClient;
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

  // VNPay integration via vnpay package
  createVNPayUrl(order, callbackUrl, clientIp) {
    const client = getVNPayClient();
    const vnp_ReturnUrl = callbackUrl || process.env.VNPAY_RETURN_URL;

    if (!vnp_ReturnUrl) {
      throw new Error('VNPAY_RETURN_URL is not configured');
    }

    const amount = Number(order.total_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Order amount is invalid for VNPay');
    }

    const paymentUrl = client.buildPaymentUrl({
      vnp_Amount: Math.round(amount),
      vnp_IpAddr: sanitizeIp(clientIp),
      vnp_TxnRef: order.order_id,
      vnp_OrderInfo: `Thanh toan don hang ${order.order_code || order.order_id}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl,
      vnp_Locale: String(process.env.VNPAY_LOCALE || 'vn').toLowerCase() === 'en' ? 'en' : 'vn',
    });

    return { paymentUrl, method: 'VNPAY', orderId: order.order_id };
  }

  handleVNPayCallback(data) {
    const payload = { ...(data || {}) };
    const verify = getVNPayClient().verifyReturnUrl(payload);

    if (!verify?.isVerified) {
      return { success: false, message: 'Invalid VNPay signature' };
    }

    if (verify.isSuccess) {
      return {
        success: true,
        orderId: payload.vnp_TxnRef,
        transactionCode: payload.vnp_TransactionNo || payload.vnp_TransactionId || null,
      };
    }

    return {
      success: false,
      message: verify.message || `Payment failed with code ${payload.vnp_ResponseCode || 'UNKNOWN'}`,
      orderId: payload.vnp_TxnRef,
    };
  }

  verifyVNPaySignature(data) {
    const verify = getVNPayClient().verifyReturnUrl({ ...(data || {}) });
    return Boolean(verify?.isVerified);
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

module.exports = new PaymentService();
