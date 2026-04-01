const { Promotion, Product, PromotionProduct } = require('../models');
const { Op } = require('sequelize');

/**
 * Get active promotions (public)
 */
const getActivePromotions = async () => {
    const now = new Date();
    const promotions = await Promotion.findAll({
        where: {
            is_active: true,
            start_date: { [Op.lte]: now },
            end_date: { [Op.gte]: now }
        },
        order: [['start_date', 'DESC']]
    });
    return promotions;
};

/**
 * Get all promotions (admin)
 */
const getAllPromotions = async (query) => {
    const { page = 1, limit = 10, is_active } = query;
    const offset = (page - 1) * limit;

    const where = {};
    if (is_active !== undefined) {
        where.is_active = is_active === 'true';
    }

    const { count, rows } = await Promotion.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
    });

    return {
        promotions: rows,
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit)
    };
};

/**
 * Get promotion by ID with products
 */
const getPromotionById = async (promotionId) => {
    const promotion = await Promotion.findByPk(promotionId, {
        include: [
            {
                model: Product,
                as: 'products',
                attributes: ['product_id', 'name', 'base_price'],
                through: { attributes: [] }
            }
        ]
    });

    if (!promotion) {
        const error = new Error('Promotion not found');
        error.status = 404;
        throw error;
    }

    return promotion;
};

/**
 * Create new promotion
 */
const createPromotion = async (data) => {
    // Validate dates
    if (new Date(data.start_date) >= new Date(data.end_date)) {
        const error = new Error('Start date must be before end date');
        error.status = 400;
        throw error;
    }

    const promotion = await Promotion.create(data);
    return promotion;
};

/**
 * Update promotion
 */
const updatePromotion = async (promotionId, data) => {
    const promotion = await Promotion.findByPk(promotionId);
    if (!promotion) {
        const error = new Error('Promotion not found');
        error.status = 404;
        throw error;
    }

    // Validate dates if both are provided
    const startDate = data.start_date || promotion.start_date;
    const endDate = data.end_date || promotion.end_date;
    if (new Date(startDate) >= new Date(endDate)) {
        const error = new Error('Start date must be before end date');
        error.status = 400;
        throw error;
    }

    await promotion.update(data);
    return promotion;
};

/**
 * Delete promotion (soft delete)
 */
const deletePromotion = async (promotionId) => {
    const promotion = await Promotion.findByPk(promotionId);
    if (!promotion) {
        const error = new Error('Promotion not found');
        error.status = 404;
        throw error;
    }

    await promotion.destroy();
    return { message: 'Promotion deleted successfully' };
};

/**
 * Add products to promotion
 */
const addProductsToPromotion = async (promotionId, productIds) => {
    const promotion = await Promotion.findByPk(promotionId);
    if (!promotion) {
        const error = new Error('Promotion not found');
        error.status = 404;
        throw error;
    }

    // Validate products exist
    const products = await Product.findAll({
        where: { product_id: { [Op.in]: productIds } }
    });

    if (products.length !== productIds.length) {
        const error = new Error('Some products not found');
        error.status = 400;
        throw error;
    }

    // Add products (ignore duplicates)
    for (const productId of productIds) {
        await PromotionProduct.findOrCreate({
            where: { promotion_id: promotionId, product_id: productId }
        });
    }

    return { message: 'Products added to promotion successfully' };
};

/**
 * Remove product from promotion
 */
const removeProductFromPromotion = async (promotionId, productId) => {
    const promotion = await Promotion.findByPk(promotionId);
    if (!promotion) {
        const error = new Error('Promotion not found');
        error.status = 404;
        throw error;
    }

    const deleted = await PromotionProduct.destroy({
        where: { promotion_id: promotionId, product_id: productId }
    });

    if (!deleted) {
        const error = new Error('Product not found in promotion');
        error.status = 404;
        throw error;
    }

    return { message: 'Product removed from promotion successfully' };
};

/**
 * Get promotions for a product
 */
const getProductPromotions = async (productId) => {
    const now = new Date();
    const product = await Product.findByPk(productId, {
        include: [
            {
                model: Promotion,
                as: 'promotions',
                where: {
                    is_active: true,
                    start_date: { [Op.lte]: now },
                    end_date: { [Op.gte]: now }
                },
                through: { attributes: [] },
                required: false
            }
        ]
    });

    if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
    }

    return product.promotions || [];
};

module.exports = {
    getActivePromotions,
    getAllPromotions,
    getPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion,
    addProductsToPromotion,
    removeProductFromPromotion,
    getProductPromotions
};
