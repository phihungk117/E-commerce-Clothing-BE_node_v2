const { Usage, Product, ProductUsage } = require('../models');

/**
 * Get all usages
 */
const getUsages = async () => {
    const usages = await Usage.findAll({
        order: [['name', 'ASC']]
    });
    return usages;
};

/**
 * Get usage by ID with products
 */
const getUsageById = async (usageId) => {
    const usage = await Usage.findByPk(usageId, {
        include: [
            {
                model: Product,
                as: 'products',
                attributes: ['product_id', 'name', 'base_price'],
                through: { attributes: [] }
            }
        ]
    });
    if (!usage) {
        const error = new Error('Usage not found');
        error.status = 404;
        throw error;
    }
    return usage;
};

/**
 * Create new usage
 */
const createUsage = async (data) => {
    // Check duplicate name
    const existing = await Usage.findOne({ where: { name: data.name } });
    if (existing) {
        const error = new Error('Usage name already exists');
        error.status = 400;
        throw error;
    }

    const usage = await Usage.create(data);
    return usage;
};

/**
 * Update usage
 */
const updateUsage = async (usageId, data) => {
    const usage = await Usage.findByPk(usageId);
    if (!usage) {
        const error = new Error('Usage not found');
        error.status = 404;
        throw error;
    }

    // Check duplicate name if updating
    if (data.name && data.name !== usage.name) {
        const existing = await Usage.findOne({ where: { name: data.name } });
        if (existing) {
            const error = new Error('Usage name already exists');
            error.status = 400;
            throw error;
        }
    }

    await usage.update(data);
    return usage;
};

/**
 * Delete usage (soft delete)
 */
const deleteUsage = async (usageId) => {
    const usage = await Usage.findByPk(usageId);
    if (!usage) {
        const error = new Error('Usage not found');
        error.status = 404;
        throw error;
    }

    // Check if usage is in use
    const productCount = await ProductUsage.count({ where: { usage_id: usageId } });
    if (productCount > 0) {
        const error = new Error('Cannot delete usage that is linked to products');
        error.status = 400;
        throw error;
    }

    await usage.destroy();
    return { message: 'Usage deleted successfully' };
};

module.exports = {
    getUsages,
    getUsageById,
    createUsage,
    updateUsage,
    deleteUsage
};
