const { ProductImage, Product, Color } = require('../models');

/**
 * Get all images of a product
 */
const getImagesByProduct = async (productId) => {
    const product = await Product.findByPk(productId);
    if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
    }

    const images = await ProductImage.findAll({
        where: { product_id: productId },
        include: [
            {
                model: Color,
                as: 'color',
                attributes: ['color_id', 'name', 'hex_code']
            }
        ],
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    });

    return images;
};

/**
 * Get image by ID
 */
const getImageById = async (imageId) => {
    const image = await ProductImage.findByPk(imageId, {
        include: [
            {
                model: Product,
                as: 'product',
                attributes: ['product_id', 'name']
            },
            {
                model: Color,
                as: 'color',
                attributes: ['color_id', 'name', 'hex_code']
            }
        ]
    });

    if (!image) {
        const error = new Error('Product image not found');
        error.status = 404;
        throw error;
    }

    return image;
};

/**
 * Create new image
 */
const createImage = async (productId, data) => {
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
    }

    // Check if color exists (if provided)
    if (data.color_id) {
        const color = await Color.findByPk(data.color_id);
        if (!color) {
            const error = new Error('Color not found');
            error.status = 404;
            throw error;
        }
    }

    // If this is set as thumbnail, remove thumbnail from other images
    if (data.is_thumbnail) {
        await ProductImage.update(
            { is_thumbnail: false },
            { where: { product_id: productId } }
        );
    }

    const image = await ProductImage.create({
        ...data,
        product_id: productId
    });

    return image;
};

/**
 * Update image
 */
const updateImage = async (imageId, data) => {
    const image = await ProductImage.findByPk(imageId);
    if (!image) {
        const error = new Error('Product image not found');
        error.status = 404;
        throw error;
    }

    // If setting as thumbnail, remove thumbnail from other images
    if (data.is_thumbnail) {
        await ProductImage.update(
            { is_thumbnail: false },
            { where: { product_id: image.product_id } }
        );
    }

    await image.update(data);
    return image;
};

/**
 * Delete image (soft delete)
 */
const deleteImage = async (imageId) => {
    const image = await ProductImage.findByPk(imageId);
    if (!image) {
        const error = new Error('Product image not found');
        error.status = 404;
        throw error;
    }

    await image.destroy();
    return { message: 'Product image deleted successfully' };
};

/**
 * Set thumbnail
 */
const setThumbnail = async (imageId) => {
    const image = await ProductImage.findByPk(imageId);
    if (!image) {
        const error = new Error('Product image not found');
        error.status = 404;
        throw error;
    }

    // Remove thumbnail from other images
    await ProductImage.update(
        { is_thumbnail: false },
        { where: { product_id: image.product_id } }
    );

    await image.update({ is_thumbnail: true });
    return image;
};

/**
 * Reorder images
 */
const reorderImages = async (productId, imageOrders) => {
    // imageOrders is array of { image_id, sort_order }
    const product = await Product.findByPk(productId);
    if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
    }

    for (const order of imageOrders) {
        await ProductImage.update(
            { sort_order: order.sort_order },
            { where: { image_id: order.image_id, product_id: productId } }
        );
    }

    return { message: 'Images reordered successfully' };
};

module.exports = {
    getImagesByProduct,
    getImageById,
    createImage,
    updateImage,
    deleteImage,
    setThumbnail,
    reorderImages
};
