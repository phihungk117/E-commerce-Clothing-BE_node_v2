const { Material, Product } = require('../models');

/**
 * Get all materials
 */
const getMaterials = async () => {
    const materials = await Material.findAll({
        order: [['name', 'ASC']]
    });
    return materials;
};

/**
 * Get material by ID
 */
const getMaterialById = async (materialId) => {
    const material = await Material.findByPk(materialId, {
        include: [
            {
                model: Product,
                as: 'products',
                attributes: ['product_id', 'name', 'base_price']
            }
        ]
    });
    if (!material) {
        const error = new Error('Material not found');
        error.status = 404;
        throw error;
    }
    return material;
};

/**
 * Create new material
 */
const createMaterial = async (data) => {
    // Check duplicate name
    const existing = await Material.findOne({ where: { name: data.name } });
    if (existing) {
        const error = new Error('Material name already exists');
        error.status = 400;
        throw error;
    }

    const material = await Material.create(data);
    return material;
};

/**
 * Update material
 */
const updateMaterial = async (materialId, data) => {
    const material = await Material.findByPk(materialId);
    if (!material) {
        const error = new Error('Material not found');
        error.status = 404;
        throw error;
    }

    // Check duplicate name if updating
    if (data.name && data.name !== material.name) {
        const existing = await Material.findOne({ where: { name: data.name } });
        if (existing) {
            const error = new Error('Material name already exists');
            error.status = 400;
            throw error;
        }
    }

    await material.update(data);
    return material;
};

/**
 * Delete material (soft delete)
 */
const deleteMaterial = async (materialId) => {
    const material = await Material.findByPk(materialId);
    if (!material) {
        const error = new Error('Material not found');
        error.status = 404;
        throw error;
    }

    // Check if material is in use
    const productCount = await Product.count({ where: { material_id: materialId } });
    if (productCount > 0) {
        const error = new Error('Cannot delete material that is in use by products');
        error.status = 400;
        throw error;
    }

    await material.destroy();
    return { message: 'Material deleted successfully' };
};

module.exports = {
    getMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial
};
