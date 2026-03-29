const { Size, ProductVariant } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all sizes, optionally filtered by type
 */
const getSizes = async (query) => {
    const where = {};
    if (query.type) {
        where.type = query.type;
    }

    const sizes = await Size.findAll({
        where,
        order: [['type', 'ASC'], ['name', 'ASC']]
    });
    return sizes;
};

/**
 * Get size by ID
 */
const getSizeById = async (sizeId) => {
    const size = await Size.findByPk(sizeId);
    if (!size) {
        const error = new Error('Size not found');
        error.status = 404;
        throw error;
    }
    return size;
};

/**
 * Create new size
 */
const createSize = async (data) => {
    // Check duplicate name + type combination
    const existing = await Size.findOne({
        where: { name: data.name, type: data.type }
    });
    if (existing) {
        const error = new Error('Size with this name and type already exists');
        error.status = 400;
        throw error;
    }

    const size = await Size.create(data);
    return size;
};

/**
 * Update size
 */
const updateSize = async (sizeId, data) => {
    const size = await Size.findByPk(sizeId);
    if (!size) {
        const error = new Error('Size not found');
        error.status = 404;
        throw error;
    }

    // Check duplicate if updating name or type
    if (data.name || data.type) {
        const checkName = data.name || size.name;
        const checkType = data.type || size.type;
        const existing = await Size.findOne({
            where: {
                name: checkName,
                type: checkType,
                size_id: { [Op.ne]: sizeId }
            }
        });
        if (existing) {
            const error = new Error('Size with this name and type already exists');
            error.status = 400;
            throw error;
        }
    }

    await size.update(data);
    return size;
};

/**
 * Delete size (soft delete)
 */
const deleteSize = async (sizeId) => {
    const size = await Size.findByPk(sizeId);
    if (!size) {
        const error = new Error('Size not found');
        error.status = 404;
        throw error;
    }

    // Check if size is in use
    const variantCount = await ProductVariant.count({ where: { size_id: sizeId } });
    if (variantCount > 0) {
        const error = new Error('Cannot delete size that is in use by product variants');
        error.status = 400;
        throw error;
    }

    await size.destroy();
    return { message: 'Size deleted successfully' };
};

module.exports = {
    getSizes,
    getSizeById,
    createSize,
    updateSize,
    deleteSize
};
