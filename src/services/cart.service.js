const { Cart, CartItem, ProductVariant, Product, ProductImage, Coupon } = require('../models');
const { v4: uuidv4 } = require('uuid');

function computeSubtotalFromPlainCart(plain) {
  const items = plain.items || [];
  return items.reduce((sum, item) => {
    const price = parseFloat(item.variant?.price ?? 0);
    const qty = parseInt(item.quantity ?? 0, 10);
    return sum + price * qty;
  }, 0);
}

/** Match cart/checkout rules: active, dates, min order, percentage vs fixed_amount, max cap */
function computeDiscountFromCoupon(coupon, subtotal) {
  if (!coupon || subtotal <= 0) return 0;
  const now = new Date();
  if (!coupon.is_active) return 0;
  if (coupon.start_date && now < new Date(coupon.start_date)) return 0;
  if (coupon.end_date && now > new Date(coupon.end_date)) return 0;
  const minOrder = parseFloat(coupon.min_order_value ?? 0);
  if (subtotal < minOrder) return 0;

  const dt = String(coupon.discount_type || '').toLowerCase();
  let amount = 0;
  if (dt === 'percentage') {
    amount = (subtotal * parseFloat(coupon.discount_value)) / 100;
    if (coupon.max_discount_amount != null && amount > parseFloat(coupon.max_discount_amount)) {
      amount = parseFloat(coupon.max_discount_amount);
    }
  } else if (dt === 'fixed_amount') {
    amount = parseFloat(coupon.discount_value || 0);
  }
  return Math.min(Math.max(0, amount), subtotal);
}

class CartService {
  // Get or create cart for user
  async getOrCreateCart(userId, sessionId = null) {
    let cart;
    
    if (userId) {
      cart = await Cart.findOne({
        where: { user_id: userId },
        include: [
          { model: CartItem, as: 'items', include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }] },
          { model: Coupon, as: 'coupon' }
        ]
      });
      
      if (!cart) {
        cart = await Cart.create({ user_id: userId });
      }
    } else if (sessionId) {
      cart = await Cart.findOne({
        where: { session_id: sessionId },
        include: [
          { model: CartItem, as: 'items', include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }] },
          { model: Coupon, as: 'coupon' },
        ],
      });
      
      if (!cart) {
        cart = await Cart.create({ session_id: sessionId });
      }
    } else {
      // Create anonymous cart with temporary session
      const tempSessionId = uuidv4();
      cart = await Cart.create({ session_id: tempSessionId });
    }
    
    return cart;
  }

  async addItem(cartId, variantId, quantity = 1) {
    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    const variant = await ProductVariant.findByPk(variantId, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!variant) {
      throw new Error('Product variant not found');
    }
    
    // Check existing item (bao gồm cả item đã soft-delete)
    let cartItem = await CartItem.findOne({
      where: { cart_id: cartId, variant_id: variantId },
      paranoid: false,
    });
    
    if (cartItem) {
      // Nếu item đã soft-delete, restore lại để tránh lỗi unique key
      if (cartItem.deleted_at) {
        await cartItem.restore();
        await cartItem.update({ quantity });
      } else {
        await cartItem.update({ quantity: cartItem.quantity + quantity });
      }
    } else {
      cartItem = await CartItem.create({
        cart_id: cartId,
        variant_id: variantId,
        quantity
      });
    }
    
    return this.getCartWithItems(cartId);
  }

  async updateItemQuantity(cartId, variantId, quantity) {
    const cartItem = await CartItem.findOne({
      where: { cart_id: cartId, variant_id: variantId }
    });
    
    if (!cartItem) {
      throw new Error('Item not found in cart');
    }
    
    if (quantity <= 0) {
      await cartItem.destroy();
    } else {
      await cartItem.update({ quantity });
    }
    
    return this.getCartWithItems(cartId);
  }

  async removeItem(cartId, variantId) {
    const deleted = await CartItem.destroy({
      where: { cart_id: cartId, variant_id: variantId }
    });
    
    if (!deleted) {
      throw new Error('Item not found in cart');
    }
    
    return this.getCartWithItems(cartId);
  }

  async applyCoupon(cartId, couponCode) {
    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    const normalizedCode = String(couponCode).trim().toUpperCase();
    const coupon = await Coupon.findOne({
      where: { code: normalizedCode, is_active: true }
    });
    
    if (!coupon) {
      throw new Error('Invalid coupon code');
    }
    
    // Check coupon validity
    const now = new Date();
    if (coupon.start_date && now < coupon.start_date) {
      throw new Error('Coupon not yet active');
    }
    if (coupon.end_date && now > coupon.end_date) {
      throw new Error('Coupon has expired');
    }
    
    await cart.update({ coupon_id: coupon.coupon_id });
    
    return this.getCartWithItems(cartId);
  }

  async removeCoupon(cartId) {
    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    await cart.update({ coupon_id: null });
    
    return this.getCartWithItems(cartId);
  }

  async getCartWithItems(cartId) {
    return Cart.findByPk(cartId, {
      include: [
        { 
          model: CartItem, 
          as: 'items', 
          include: [
            { 
              model: ProductVariant, 
              as: 'variant', 
              include: [
                { model: Product, as: 'product', include: [{ model: ProductImage, as: 'images' }] }
              ] 
            }
          ] 
        },
        { model: Coupon, as: 'coupon' }
      ]
    });
  }

  /**
   * JSON-safe cart with subtotal, discount, total (frontend expects these fields).
   */
  serializeCartForApi(cart) {
    if (!cart) return cart;
    const plain = typeof cart.toJSON === 'function' ? cart.toJSON() : { ...cart };
    const subtotal = computeSubtotalFromPlainCart(plain);
    const discount =
      plain.coupon && plain.coupon_id ? computeDiscountFromCoupon(plain.coupon, subtotal) : 0;
    return {
      ...plain,
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
    };
  }

  async clearCart(cartId) {
    await CartItem.destroy({ where: { cart_id: cartId } });
    await Cart.update({ coupon_id: null }, { where: { cart_id: cartId } });
    
    return this.getCartWithItems(cartId);
  }

  // Merge guest cart to user cart after login
  async mergeCarts(guestCartId, userId) {
    const guestCart = await Cart.findByPk(guestCartId, {
      include: [{ model: CartItem, as: 'items' }]
    });
    
    if (!guestCart) {
      return this.getOrCreateCart(userId);
    }
    
    const userCart = await this.getOrCreateCart(userId);
    
    // Merge items
    for (const item of guestCart.items) {
      const existingItem = await CartItem.findOne({
        where: { cart_id: userCart.cart_id, variant_id: item.variant_id }
      });
      
      if (existingItem) {
        await existingItem.update({ quantity: existingItem.quantity + item.quantity });
      } else {
        await CartItem.create({
          cart_id: userCart.cart_id,
          variant_id: item.variant_id,
          quantity: item.quantity
        });
      }
    }
    
    // Delete guest cart
    await guestCart.destroy();
    
    return this.getCartWithItems(userCart.cart_id);
  }
}

module.exports = new CartService();