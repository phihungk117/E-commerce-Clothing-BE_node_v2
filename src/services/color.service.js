const { Color, ProductVariant, ProductImage } = require('../models');

/**
 * Get all colors
 */
const getColors = async () => {
    const colors = await Color.findAll({
        order: [['name', 'ASC']]
    });
    return colors;
};

/**
 * Get color by ID
 */
const getColorById = async (colorId) => {
    const color = await Color.findByPk(colorId);
    if (!color) {
        const error = new Error('Color not found');
        error.status = 404;
        throw error;
    }
    return color;
};

/**
 * Create new color
 */
const createColor = async (data) => {
    // Check duplicate name
    const existing = await Color.findOne({ where: { name: data.name } });
    if (existing) {
        const error = new Error('Color name already exists');
        error.status = 400;
        throw error;
    }

    const color = await Color.create(data);
    return color;
};

/**
 * Update color
 */
const updateColor = async (colorId, data) => {
    const color = await Color.findByPk(colorId);
    if (!color) {
        const error = new Error('Color not found');
        error.status = 404;
        throw error;
    }

    // Check duplicate name if updating
    if (data.name && data.name !== color.name) {
        const existing = await Color.findOne({ where: { name: data.name } });
        if (existing) {
            const error = new Error('Color name already exists');
            error.status = 400;
            throw error;
        }
    }

    await color.update(data);
    return color;
};

/**
 * Delete color (soft delete)
 */
const deleteColor = async (colorId) => {
    const color = await Color.findByPk(colorId);
    if (!color) {
        const error = new Error('Color not found');
        error.status = 404;
        throw error;
    }

    // Check if color is in use
    const variantCount = await ProductVariant.count({ where: { color_id: colorId } });
    if (variantCount > 0) {
        const error = new Error('Cannot delete color that is in use by product variants');
        error.status = 400;
        throw error;
    }

    await color.destroy();
    return { message: 'Color deleted successfully' };
};

module.exports = {
    getColors,
    getColorById,
    createColor,
    updateColor,
    deleteColor
};
