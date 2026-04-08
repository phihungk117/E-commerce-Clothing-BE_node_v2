const { Order, OrderItem, Cart, CartItem, ProductVariant, Product, ProductImage, Size, Color, Payment, User, Coupon, Inventory, StockMovement, sequelize } = require('../models');
const { Op } = require('sequelize');

class OrderService {
  generateOrderCode() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  async createOrder(userId, orderData) {
    const {
      customer_name, customer_phone, shipping_address, note,
      payment_method
    } = orderData;

    const orderId = await sequelize.transaction(async (transaction) => {
      const cart = await Cart.findOne({
        where: { user_id: userId },
        include: [
          { model: CartItem, as: 'items', include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }] },
          { model: Coupon, as: 'coupon' }
        ],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      let subtotal = 0;
      const orderItems = [];

      for (const item of cart.items) {
        const variant = item.variant;
        const product = variant.product;
        const itemTotal = parseFloat(variant.price) * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          variant_id: variant.variant_id,
          product_name: product.name,
          sku: variant.sku,
          quantity: item.quantity,
          unit_price: variant.price,
          total_price: itemTotal
        });

        const inventory = await Inventory.findOne({
          where: { variant_id: variant.variant_id },
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!inventory || inventory.on_hand - inventory.reserved < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        await inventory.update({
          reserved: inventory.reserved + item.quantity
        }, { transaction });
      }

      let discountAmount = 0;
      let couponId = null;

      if (cart.coupon_id) {
        const coupon = cart.coupon;
        if (coupon && this.isCouponValid(coupon)) {
          const minOrder = parseFloat(coupon.min_order_value ?? 0);
          if (subtotal >= minOrder) {
            const dt = String(coupon.discount_type || '').toLowerCase();
            if (dt === 'percentage') {
              discountAmount = (subtotal * parseFloat(coupon.discount_value)) / 100;
              if (
                coupon.max_discount_amount != null &&
                discountAmount > parseFloat(coupon.max_discount_amount)
              ) {
                discountAmount = parseFloat(coupon.max_discount_amount);
              }
            } else if (dt === 'fixed_amount') {
              discountAmount = Math.min(parseFloat(coupon.discount_value || 0), subtotal);
            }
          }
          if (discountAmount > 0) {
            couponId = coupon.coupon_id;
          }
        }
      }

      const shippingFee = 0;
      const totalAmount = subtotal + shippingFee - discountAmount;

      const order = await Order.create({
        user_id: userId,
        order_code: this.generateOrderCode(),
        customer_name,
        customer_phone,
        shipping_address,
        note,
        subtotal_amount: subtotal,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        order_status: 'PENDING',
        coupon_id: couponId
      }, { transaction });

      for (const item of orderItems) {
        await OrderItem.create({
          order_id: order.order_id,
          ...item
        }, { transaction });
      }

      await Payment.create({
        order_id: order.order_id,
        payment_method,
        amount: totalAmount,
        payment_status: payment_method === 'COD' ? 'SUCCESS' : 'PENDING'
      }, { transaction });

      await CartItem.destroy({ where: { cart_id: cart.cart_id }, transaction });
      await cart.update({ coupon_id: null }, { transaction });

      for (const item of orderItems) {
        const inv = await Inventory.findOne({ where: { variant_id: item.variant_id }, transaction });
        if (!inv || !inv.warehouse_id) {
          throw new Error(`Missing inventory warehouse for variant ${item.variant_id} in order ${order.order_id}`);
        }

        await StockMovement.create({
          warehouse_id: inv.warehouse_id,
          variant_id: item.variant_id,
          movement_type: 'RESERVE',
          quantity: item.quantity,
          reference_type: 'ORDER',
          reference_id: order.order_id
        }, { transaction });
      }

      return order.order_id;
    });

    return this.getOrderById(orderId);
  }

  isCouponValid(coupon) {
    const now = new Date();
    if (coupon.start_date && now < new Date(coupon.start_date)) return false;
    if (coupon.end_date && now > new Date(coupon.end_date)) return false;
    if (!coupon.is_active) return false;
    return true;
  }

  async getOrderById(orderId, userId = null) {
    const where = { order_id: orderId };
    if (userId) where.user_id = userId;

    return Order.findOne({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: ProductVariant,
              as: 'variant',
              include: [
                {
                  model: Product,
                  as: 'product',
                  include: [{ model: ProductImage, as: 'images' }]
                },
                { model: Size, as: 'size' },
                { model: Color, as: 'color' }
              ]
            }
          ]
        },
        { model: Payment, as: 'payments' },
        { model: Coupon, as: 'coupon' },
        { model: User, as: 'user', attributes: ['user_id', 'email', 'first_name', 'last_name', 'phone_number'] }
      ]
    });
  }

  async getUserOrders(userId, { page = 1, limit = 10, status } = {}) {
    const where = { user_id: userId };
    if (status) where.order_status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: ProductVariant,
              as: 'variant',
              include: [
                {
                  model: Product,
                  as: 'product',
                  include: [{ model: ProductImage, as: 'images' }]
                },
                { model: Size, as: 'size' },
                { model: Color, as: 'color' }
              ]
            }
          ]
        },
        { model: Payment, as: 'payments' }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      orders: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }

  async cancelOrder(orderId, userId) {
    const order = await Order.findOne({
      where: { order_id: orderId, user_id: userId }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.order_status)) {
      throw new Error('Cannot cancel this order');
    }

    // Update order status
    await order.update({ order_status: 'CANCELLED' });

    // Release inventory reservation
    const orderItems = await OrderItem.findAll({
      where: { order_id: orderId }
    });

    for (const item of orderItems) {
      const inventory = await Inventory.findOne({
        where: { variant_id: item.variant_id }
      });
      
      if (inventory) {
        await inventory.update({
          reserved: Math.max(0, inventory.reserved - item.quantity)
        });
      }

      if (!inventory || !inventory.warehouse_id) {
        throw new Error(`Missing inventory warehouse for variant ${item.variant_id} while cancelling order ${orderId}`);
      }

      // Create stock movement
      await StockMovement.create({
        warehouse_id: inventory.warehouse_id,
        variant_id: item.variant_id,
        movement_type: 'RELEASE',
        quantity: item.quantity,
        reference_type: 'ORDER',
        reference_id: orderId,
        note: 'Order cancelled'
      });
    }

    // Update payment status
    await Payment.update(
      { payment_status: 'REFUNDED' },
      { where: { order_id: orderId } }
    );

    return this.getOrderById(orderId);
  }

  // Admin methods
  async getAllOrders({ page = 1, limit = 20, status, startDate, endDate } = {}) {
    const where = {};
    if (status) where.order_status = status;
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) where.created_at[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['user_id', 'email', 'first_name', 'last_name', 'phone_number'] },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: ProductVariant,
              as: 'variant',
              include: [
                {
                  model: Product,
                  as: 'product',
                  include: [{ model: ProductImage, as: 'images' }]
                },
                { model: Size, as: 'size' },
                { model: Color, as: 'color' }
              ]
            }
          ]
        },
        { model: Payment, as: 'payments' }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      orders: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }

  async updateOrderStatus(orderId, status) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    await order.update({ order_status: status });

    // Handle stock based on status
    if (status === 'CONFIRMED' || status === 'SHIPPING') {
      const orderItems = await OrderItem.findAll({ where: { order_id: orderId } });
      for (const item of orderItems) {
        const inventory = await Inventory.findOne({ where: { variant_id: item.variant_id } });
        if (inventory) {
          // Release reserved, reduce on_hand
          await inventory.update({
            on_hand: inventory.on_hand - item.quantity,
            reserved: Math.max(0, inventory.reserved - item.quantity)
          });

          await StockMovement.create({
            warehouse_id: inventory.warehouse_id,
            variant_id: item.variant_id,
            movement_type: 'OUT',
            quantity: item.quantity,
            reference_type: 'ORDER',
            reference_id: orderId
          });
        }
      }
    }

    if (status === 'DELIVERED') {
      await Payment.update(
        { payment_status: 'SUCCESS', payment_time: new Date() },
        { where: { order_id: orderId } }
      );
    }

    if (status === 'CANCELLED') {
      // Release inventory
      await this.cancelOrder(orderId, order.user_id);
    }

    return this.getOrderById(orderId);
  }

  async requestReturn(orderId, userId, reason = null) {
    const order = await Order.findOne({ where: { order_id: orderId, user_id: userId } });
    if (!order) throw new Error('Order not found');
    if (order.order_status !== 'DELIVERED') {
      throw new Error('Only delivered orders can request return');
    }

    const note = [order.note, '[RETURN_REQUESTED]', reason].filter(Boolean).join(' | ');
    await order.update({ note });
    return order;
  }

  async processReturn(orderId, { approve = true, reason = null, actorId = null } = {}) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');

    if (!approve) {
      const note = [order.note, '[RETURN_REJECTED]', reason, actorId ? `by ${actorId}` : null]
        .filter(Boolean)
        .join(' | ');
      await order.update({ note });
      return order;
    }

    await order.update({ order_status: 'RETURNED' });

    const orderItems = await OrderItem.findAll({ where: { order_id: orderId } });
    for (const item of orderItems) {
      const inventory = await Inventory.findOne({ where: { variant_id: item.variant_id } });
      if (inventory) {
        await inventory.update({ on_hand: Number(inventory.on_hand) + Number(item.quantity) });
        await StockMovement.create({
          warehouse_id: inventory.warehouse_id,
          variant_id: item.variant_id,
          movement_type: 'RETURN',
          quantity: item.quantity,
          reference_type: 'RETURN',
          reference_id: orderId,
          note: reason || 'Order return processed',
          created_by: actorId || null
        });
      }
    }

    await Payment.update(
      { payment_status: 'REFUNDED', payment_time: new Date() },
      { where: { order_id: orderId } }
    );

    return this.getOrderById(orderId);
  }
}

module.exports = new OrderService();