const { Coupon, CouponUsage, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Validate coupon
 */
const validateCoupon = async (code, orderValue, userId = null) => {
    const coupon = await Coupon.findOne({
        where: { code: code.toUpperCase() }
    });

    if (!coupon) {
        const error = new Error('Coupon not found');
        error.status = 404;
        throw error;
    }

    const now = new Date();

    // Check if active
    if (!coupon.is_active) {
        const error = new Error('Coupon is not active');
        error.status = 400;
        throw error;
    }

    // Check date range
    if (now < new Date(coupon.start_date)) {
        const error = new Error('Coupon is not yet active');
        error.status = 400;
        throw error;
    }

    if (now > new Date(coupon.end_date)) {
        const error = new Error('Coupon has expired');
        error.status = 400;
        throw error;
    }

    // Check usage limit
    if (coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
        const error = new Error('Coupon usage limit reached');
        error.status = 400;
        throw error;
    }

    // Check per user limit
    if (userId && coupon.per_user_limit > 0) {
        const userUsageCount = await CouponUsage.count({
            where: { coupon_id: coupon.coupon_id, user_id: userId }
        });
        if (userUsageCount >= coupon.per_user_limit) {
            const error = new Error('You have reached the usage limit for this coupon');
            error.status = 400;
            throw error;
        }
    }

    // Check minimum order value
    if (orderValue < parseFloat(coupon.min_order_value)) {
        const error = new Error(`Minimum order value is ${coupon.min_order_value}`);
        error.status = 400;
        throw error;
    }

    // Calculate discount
    let discountAmount;
    if (coupon.discount_type === 'percentage') {
        discountAmount = (orderValue * parseFloat(coupon.discount_value)) / 100;
        // Apply max discount cap
        if (coupon.max_discount_amount && discountAmount > parseFloat(coupon.max_discount_amount)) {
            discountAmount = parseFloat(coupon.max_discount_amount);
        }
    } else {
        discountAmount = parseFloat(coupon.discount_value);
    }

    return {
        valid: true,
        coupon: {
            coupon_id: coupon.coupon_id,
            code: coupon.code,
            description: coupon.description,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value
        },
        discount_amount: discountAmount,
        final_amount: orderValue - discountAmount
    };
};

/**
 * Apply coupon to order
 */
const applyCoupon = async (code, orderId, userId, orderValue) => {
    // First validate
    const validationResult = await validateCoupon(code, orderValue, userId);

    const coupon = await Coupon.findOne({
        where: { code: code.toUpperCase() }
    });

    // Record usage
    await CouponUsage.create({
        coupon_id: coupon.coupon_id,
        user_id: userId,
        order_id: orderId,
        discount_amount: validationResult.discount_amount
    });

    // Increment usage count
    await coupon.increment('usage_count');

    return {
        success: true,
        discount_amount: validationResult.discount_amount,
        message: 'Coupon applied successfully'
    };
};

/**
 * Get all coupons (admin)
 */
const getAllCoupons = async (query) => {
    const { page = 1, limit = 10, is_active, code } = query;
    const offset = (page - 1) * limit;

    const where = {};
    if (is_active !== undefined) {
        where.is_active = is_active === 'true';
    }
    if (code) {
        where.code = { [Op.like]: `%${code.toUpperCase()}%` };
    }

    const { count, rows } = await Coupon.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
    });

    return {
        coupons: rows,
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit)
    };
};

/**
 * Get coupon by ID (admin)
 */
const getCouponById = async (couponId) => {
    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) {
        const error = new Error('Coupon not found');
        error.status = 404;
        throw error;
    }
    return coupon;
};

/**
 * Create new coupon (admin)
 */
const createCoupon = async (data) => {
    // Uppercase code
    if (data.code) {
        data.code = data.code.toUpperCase();
    }

    // Check duplicate code
    const existing = await Coupon.findOne({ where: { code: data.code } });
    if (existing) {
        const error = new Error('Coupon code already exists');
        error.status = 400;
        throw error;
    }

    // Validate dates
    if (new Date(data.start_date) >= new Date(data.end_date)) {
        const error = new Error('Start date must be before end date');
        error.status = 400;
        throw error;
    }

    const coupon = await Coupon.create(data);
    return coupon;
};

/**
 * Update coupon (admin)
 */
const updateCoupon = async (couponId, data) => {
    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) {
        const error = new Error('Coupon not found');
        error.status = 404;
        throw error;
    }

    // Uppercase code if updating
    if (data.code) {
        data.code = data.code.toUpperCase();
        // Check duplicate
        const existing = await Coupon.findOne({
            where: { code: data.code, coupon_id: { [Op.ne]: couponId } }
        });
        if (existing) {
            const error = new Error('Coupon code already exists');
            error.status = 400;
            throw error;
        }
    }

    // Validate dates if both are provided
    const startDate = data.start_date || coupon.start_date;
    const endDate = data.end_date || coupon.end_date;
    if (new Date(startDate) >= new Date(endDate)) {
        const error = new Error('Start date must be before end date');
        error.status = 400;
        throw error;
    }

    await coupon.update(data);
    return coupon;
};

/**
 * Delete coupon (admin)
 */
const deleteCoupon = async (couponId) => {
    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) {
        const error = new Error('Coupon not found');
        error.status = 404;
        throw error;
    }

    await coupon.destroy();
    return { message: 'Coupon deleted successfully' };
};

/**
 * Get coupon usages (admin)
 */
const getCouponUsages = async (couponId, query) => {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) {
        const error = new Error('Coupon not found');
        error.status = 404;
        throw error;
    }

    const { count, rows } = await CouponUsage.findAndCountAll({
        where: { coupon_id: couponId },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['user_id', 'email', 'first_name', 'last_name']
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['used_at', 'DESC']]
    });

    return {
        usages: rows,
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit)
    };
};

module.exports = {
    validateCoupon,
    applyCoupon,
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCouponUsages
};
