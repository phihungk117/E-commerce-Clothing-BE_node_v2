const { ProductVariant, Product, Color, Size } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all variants of a product
 */
const getVariantsByProduct = async (productId) => {
    const product = await Product.findByPk(productId);
    if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
    }

    const variants = await ProductVariant.findAll({
        where: { product_id: productId },
        include: [
            {
                model: Color,
                as: 'color',
                attributes: ['color_id', 'name', 'hex_code']
            },
            {
                model: Size,
                as: 'size',
                attributes: ['size_id', 'name', 'type']
            }
        ],
        order: [['created_at', 'DESC']]
    });

    return variants;
};

/**
 * Get variant by ID
 */
const getVariantById = async (variantId) => {
    const variant = await ProductVariant.findByPk(variantId, {
        include: [
            {
                model: Product,
                as: 'product',
                attributes: ['product_id', 'name', 'base_price']
            },
            {
                model: Color,
                as: 'color',
                attributes: ['color_id', 'name', 'hex_code']
            },
            {
                model: Size,
                as: 'size',
                attributes: ['size_id', 'name', 'type']
            }
        ]
    });

    if (!variant) {
        const error = new Error('Product variant not found');
        error.status = 404;
        throw error;
    }

    return variant;
};

/**
 * Create new variant
 */
const createVariant = async (productId, data) => {
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
    }

    // Check if color exists
    const color = await Color.findByPk(data.color_id);
    if (!color) {
        const error = new Error('Color not found');
        error.status = 404;
        throw error;
    }

    // Check if size exists
    const size = await Size.findByPk(data.size_id);
    if (!size) {
        const error = new Error('Size not found');
        error.status = 404;
        throw error;
    }

    // Check duplicate variant (product + color + size)
    const existing = await ProductVariant.findOne({
        where: {
            product_id: productId,
            color_id: data.color_id,
            size_id: data.size_id
        }
    });
    if (existing) {
        const error = new Error('Variant with this color and size already exists');
        error.status = 400;
        throw error;
    }

    // Check duplicate SKU
    if (data.sku) {
        const skuExists = await ProductVariant.findOne({ where: { sku: data.sku } });
        if (skuExists) {
            const error = new Error('SKU already exists');
            error.status = 400;
            throw error;
        }
    }

    const variant = await ProductVariant.create({
        ...data,
        product_id: productId
    });

    return variant;
};

/**
 * Update variant
 */
const updateVariant = async (variantId, data) => {
    const variant = await ProductVariant.findByPk(variantId);
    if (!variant) {
        const error = new Error('Product variant not found');
        error.status = 404;
        throw error;
    }

    // Check duplicate SKU if updating
    if (data.sku && data.sku !== variant.sku) {
        const skuExists = await ProductVariant.findOne({
            where: {
                sku: data.sku,
                variant_id: { [Op.ne]: variantId }
            }
        });
        if (skuExists) {
            const error = new Error('SKU already exists');
            error.status = 400;
            throw error;
        }
    }

    await variant.update(data);
    return variant;
};

/**
 * Delete variant (soft delete)
 */
const deleteVariant = async (variantId) => {
    const variant = await ProductVariant.findByPk(variantId);
    if (!variant) {
        const error = new Error('Product variant not found');
        error.status = 404;
        throw error;
    }

    await variant.destroy();
    return { message: 'Product variant deleted successfully' };
};

/**
 * Update stock quantity
 */
const updateStock = async (variantId, quantity, operation = 'set') => {
    const variant = await ProductVariant.findByPk(variantId);
    if (!variant) {
        const error = new Error('Product variant not found');
        error.status = 404;
        throw error;
    }

    let newQuantity;
    switch (operation) {
        case 'add':
            newQuantity = variant.stock_quantity + quantity;
            break;
        case 'subtract':
            newQuantity = variant.stock_quantity - quantity;
            if (newQuantity < 0) {
                const error = new Error('Insufficient stock');
                error.status = 400;
                throw error;
            }
            break;
        case 'set':
        default:
            newQuantity = quantity;
    }

    await variant.update({ stock_quantity: newQuantity });
    return variant;
};

module.exports = {
    getVariantsByProduct,
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant,
    updateStock
};
