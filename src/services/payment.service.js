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
      case 'MOMO':
        return this.createMoMoUrl(order, callbackUrl);
      case 'ZALOPAY':
        return this.createZaloPayUrl(order, callbackUrl);
      case 'STRIPE':
      case 'CREDIT_CARD':
        return this.createStripeCheckout(order, callbackUrl);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  async handleCallback(paymentMethod, callbackData) {
    switch (paymentMethod) {
      case 'VNPAY':
        return this.handleVNPayCallback(callbackData);
      case 'MOMO':
        return this.handleMoMoCallback(callbackData);
      case 'ZALOPAY':
        return this.handleZaloPayCallback(callbackData);
      case 'STRIPE':
      case 'CREDIT_CARD':
        return this.handleStripeCallback(callbackData);
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

  // MoMo integration
  createMoMoUrl(order, callbackUrl) {
    const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'YOUR_ACCESS_KEY';
    const secretKey = process.env.MOMO_SECRET_KEY || 'YOUR_SECRET_KEY';

    const orderId = order.order_id;
    const amount = Math.round(order.total_amount);
    const orderInfo = `Thanh toán đơn hàng ${order.order_code}`;
    const redirectUrl = callbackUrl || process.env.MOMO_RETURN_URL;
    const ipnUrl = process.env.MOMO_IPN_URL || callbackUrl;
    const requestId = `${Date.now()}`;
    const requestType = 'captureWallet';

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const hmac = crypto.createHmac('sha256', secretKey);
    const signature = hmac.update(Buffer.from(rawSignature, 'utf-8')).digest('hex');

    const body = {
      partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      signature,
      extraData: ''
    };

    return { paymentUrl: endpoint, method: 'MOMO', body };
  }

  handleMoMoCallback(data) {
    if (data.resultCode === 0) {
      return { success: true, orderId: data.orderId, transactionCode: data.transId };
    }
    return { success: false, message: data.message || 'Payment failed' };
  }

  // ZaloPay integration
  createZaloPayUrl(order, callbackUrl) {
    const endpoint = process.env.ZALOPAY_ENDPOINT || 'https://sb-open.zalopay.com.vn/v2/pay';
    const appId = parseInt(process.env.ZALOPAY_APP_ID || '553');
    const key1 = process.env.ZALOPAY_KEY1 || 'YOUR_KEY1';

    const orderId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const amount = Math.round(order.total_amount);
    const description = `Thanh toán đơn hàng ${order.order_code}`;

    const params = {
      app_id: appId,
      app_trans_id: orderId,
      app_user: order.user_id || 'guest',
      app_time: Date.now(),
      amount: amount.toString(),
      item: JSON.stringify([]),
      description,
      embed_data: JSON.stringify({}),
      callback_url: callbackUrl || process.env.ZALOPAY_CALLBACK_URL
    };

    const rawData = `${params.app_id}|${params.app_trans_id}|${params.app_user}|${params.amount}|${params.app_time}|${params.embed_data}|${params.item}`;
    const hmac = crypto.createHmac('sha256', key1);
    params.mac = hmac.update(Buffer.from(rawData, 'utf-8')).digest('hex');

    return { paymentUrl: endpoint, method: 'ZALOPAY', params };
  }

  handleZaloPayCallback(data) {
    if (data.return_code === 1) {
      return { success: true, orderId: data.app_trans_id, transactionCode: data.zp_trans_id };
    }
    return { success: false, message: data.return_message || 'Payment failed' };
  }

  // Stripe (basic hosted checkout handoff)
  createStripeCheckout(order, callbackUrl) {
    const publicKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
    const baseCheckoutUrl = process.env.STRIPE_CHECKOUT_URL || 'https://checkout.stripe.com/pay';
    const successUrl = callbackUrl || process.env.STRIPE_SUCCESS_URL || process.env.FRONT_END_URL;

    return {
      method: 'STRIPE',
      paymentUrl: baseCheckoutUrl,
      meta: {
        orderId: order.order_id,
        amount: Math.round(order.total_amount * 100),
        currency: 'vnd',
        successUrl,
        publishableKey: publicKey
      }
    };
  }

  handleStripeCallback(data) {
    if (data.status === 'succeeded' || data.payment_status === 'paid') {
      return {
        success: true,
        orderId: data.order_id || data.metadata?.order_id,
        transactionCode: data.payment_intent || data.id
      };
    }

    return { success: false, message: data.message || 'Stripe payment failed' };
  }

  verifyStripeSignature(payload, signatureHeader) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !signatureHeader) return false;

    const parts = String(signatureHeader)
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .reduce((acc, part) => {
        const [k, v] = part.split('=');
        if (k && v) acc[k] = v;
        return acc;
      }, {});

    const timestamp = parts.t;
    const signature = parts.v1;
    if (!timestamp || !signature) return false;

    const body = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
    const signedPayload = `${timestamp}.${body}`;

    const expected = crypto.createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Optional replay window (default 5 minutes)
    const toleranceSec = parseInt(process.env.STRIPE_WEBHOOK_TOLERANCE_SEC || '300', 10);
    const nowSec = Math.floor(Date.now() / 1000);
    if (Number.isFinite(toleranceSec) && Math.abs(nowSec - Number(timestamp)) > toleranceSec) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
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

  verifyMoMoSignature(data) {
    const signature = data?.signature;
    const secret = process.env.MOMO_SECRET_KEY;
    if (!signature || !secret) return false;

    const raw = Object.entries(data || {})
      .filter(([k, v]) => k !== 'signature' && v !== undefined && v !== null && v !== '')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    return expected === signature;
  }

  verifyZaloPaySignature(data) {
    const mac = data?.mac;
    if (!mac) return false;

    const key2 = process.env.ZALOPAY_KEY2 || process.env.ZALOPAY_KEY1;
    if (!key2) return false;

    const payload = data?.data || JSON.stringify(data || {});
    const expected = crypto.createHmac('sha256', key2).update(payload).digest('hex');
    return expected === mac;
  }

  verifyProviderSignature(paymentMethod, callbackData, headers, rawPayload) {
    switch (paymentMethod) {
      case 'STRIPE':
      case 'CREDIT_CARD': {
        const signature = headers?.['stripe-signature'] || headers?.['x-stripe-signature'];
        return this.verifyStripeSignature(rawPayload, signature);
      }
      case 'VNPAY':
        return this.verifyVNPaySignature(callbackData);
      case 'MOMO':
        return this.verifyMoMoSignature(callbackData);
      case 'ZALOPAY':
        return this.verifyZaloPaySignature(callbackData);
      default:
        return false;
    }
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