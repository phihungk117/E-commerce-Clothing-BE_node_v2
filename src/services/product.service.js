const { Product, Category, Material, ProductImage, ProductVariant, Color, Size, Usage, Inventory, sequelize } = require('../models');
const { Op } = require('sequelize');

const getProducts = async (query) => {
    const {
        page = 1,
        limit = 10,
        name,
        description,
        sku,
        category_id,
        material_id,
        color_id,
        size_id,
        gender,
        age_group,
        min_price,
        max_price,
        in_stock,
        out_of_stock,
        sort_by = 'created_at',
        sort_order = 'DESC'
    } = query;

    const offset = (page - 1) * limit;
    const where = {};
    const variantWhere = {};

    // Product filters
    if (name) {
        where[Op.or] = [
            { name: { [Op.like]: `%${name}%` } },
            { description: { [Op.like]: `%${name}%` } }
        ];
    }
    if (description) {
        where.description = { [Op.like]: `%${description}%` };
    }
    if (sku) {
        variantWhere.sku = { [Op.like]: `%${sku}%` };
    }
    if (category_id) {
        where.category_id = category_id;
    }
    if (material_id) {
        where.material_id = material_id;
    }
    if (gender) {
        where.gender = gender;
    }
    if (age_group) {
        where.age_group = age_group;
    }
    if (min_price || max_price) {
        where.base_price = {};
        if (min_price) where.base_price[Op.gte] = parseFloat(min_price);
        if (max_price) where.base_price[Op.lte] = parseFloat(max_price);
    }

    // Build include for variants (color, size filters)
    const variantInclude = {
        model: ProductVariant,
        as: 'variants',
        required: false,
        include: [
            {
                model: Color,
                as: 'color',
                attributes: ['color_id', 'name', 'hex_code']
            },
            {
                model: Size,
                as: 'size',
                attributes: ['size_id', 'name']
            },
            {
                model: Inventory,
                as: 'inventory',
                attributes: ['on_hand', 'reserved']
            }
        ]
    };

    // Add color filter to variant
    if (color_id) {
        variantWhere.color_id = color_id;
    }

    // Add size filter to variant
    if (size_id) {
        variantWhere.size_id = size_id;
    }

    if (Object.keys(variantWhere).length > 0) {
        variantInclude.where = variantWhere;
        variantInclude.required = true;
    }

    const { count, rows } = await Product.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sort_by, sort_order]],
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'name']
            },
            {
                model: Material,
                as: 'material',
                attributes: ['material_id', 'name']
            },
            {
                model: ProductImage,
                as: 'images',
                attributes: ['image_id', 'image_url', 'alt_text', 'is_thumbnail']
            },
            variantInclude
        ],
        distinct: true
    });

    // Filter by stock status
    let products = rows;
    if (in_stock === 'true' || out_of_stock === 'true') {
        products = products.filter(product => {
            const hasStock = product.variants?.some(v => v.inventory?.on_hand > 0);
            if (in_stock === 'true' && out_of_stock === 'true') return true;
            if (in_stock === 'true') return hasStock;
            if (out_of_stock === 'true') return !hasStock;
            return true;
        });
    }

    return {
        products,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            total_pages: Math.ceil(count / limit)
        }
    };
};

// Advanced search with more options
const searchProducts = async (query) => {
    const {
        page = 1,
        limit = 12,
        q = '', // search query
        category_id,
        color_id,
        size_id,
        min_price,
        max_price,
        gender,
        age_group,
        material_id,
        sort_by = 'relevance', // relevance, price_asc, price_desc, newest, oldest
        sort_order = 'DESC'
    } = query;

    const offset = (page - 1) * limit;
    const where = {};
    const variantWhere = {};

    // Search in name and description
    if (q) {
        where[Op.or] = [
            { name: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
        ];
    }
    if (category_id) where.category_id = category_id;
    if (material_id) where.material_id = material_id;
    if (gender) where.gender = gender;
    if (age_group) where.age_group = age_group;
    if (min_price || max_price) {
        where.base_price = {};
        if (min_price) where.base_price[Op.gte] = parseFloat(min_price);
        if (max_price) where.base_price[Op.lte] = parseFloat(max_price);
    }

    // Determine sort order
    let order;
    switch (sort_by) {
        case 'price_asc':
            order = [['base_price', 'ASC']];
            break;
        case 'price_desc':
            order = [['base_price', 'DESC']];
            break;
        case 'newest':
            order = [['created_at', 'DESC']];
            break;
        case 'oldest':
            order = [['created_at', 'ASC']];
            break;
        default:
            order = [['created_at', 'DESC']];
    }

    const variantInclude = {
        model: ProductVariant,
        as: 'variants',
        required: false,
        include: [
            { model: Color, as: 'color', attributes: ['color_id', 'name', 'hex_code'] },
            { model: Size, as: 'size', attributes: ['size_id', 'name'] },
            { model: Inventory, as: 'inventory', attributes: ['on_hand', 'reserved'] }
        ]
    };

    if (color_id || size_id) {
        if (color_id) variantWhere.color_id = color_id;
        if (size_id) variantWhere.size_id = size_id;
        variantInclude.where = variantWhere;
        variantInclude.required = true;
    }

    const { count, rows } = await Product.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order,
        include: [
            { model: Category, as: 'category', attributes: ['category_id', 'name'] },
            { model: Material, as: 'material', attributes: ['material_id', 'name'] },
            {
                model: ProductImage,
                as: 'images',
                attributes: ['image_id', 'image_url', 'alt_text', 'is_thumbnail']
            },
            variantInclude
        ],
        distinct: true
    });

    return {
        products: rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            total_pages: Math.ceil(count / limit),
            has_more: offset + limit < count
        }
    };
};

const getProductById = async (productId) => {
    const product = await Product.findByPk(productId, {
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'name']
            },
            {
                model: Material,
                as: 'material',
                attributes: ['material_id', 'name']
            },
            {
                model: ProductImage,
                as: 'images',
                attributes: ['image_id', 'image_url', 'alt_text', 'is_thumbnail', 'sort_order']
            },
            {
                model: ProductVariant,
                as: 'variants',
                include: [
                    {
                        model: Color,
                        as: 'color',
                        attributes: ['color_id', 'name', 'hex_code']
                    },
                    {
                        model: Size,
                        as: 'size',
                        attributes: ['size_id', 'name']
                    },
                    {
                        model: Inventory,
                        as: 'inventory',
                        attributes: ['on_hand', 'reserved']
                    }
                ]
            },
            {
                model: Usage,
                as: 'usages',
                attributes: ['usage_id', 'name'],
                through: { attributes: [] }
            }
        ]
    });

    if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
    }

    return product;
};

const createProduct = async (data) => {
    const product = await Product.create(data);
    return product;
};

const updateProduct = async (productId, data) => {
    const product = await Product.findByPk(productId);
    if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
    }

    await product.update(data);
    return product;
};

const deleteProduct = async (productId) => {
    const product = await Product.findByPk(productId);
    if (!product) {
        const error = new Error('Product not found');
        error.status = 404;
        throw error;
    }

    await product.destroy();
    return { message: 'Product deleted successfully' };
};

// Get available filters options
const getFilterOptions = async () => {
    const categories = await Category.findAll({
        attributes: ['category_id', 'name'],
        order: [['name', 'ASC']]
    });

    const colors = await Color.findAll({
        attributes: ['color_id', 'name', 'hex_code'],
        order: [['name', 'ASC']]
    });

    const sizes = await Size.findAll({
        attributes: ['size_id', 'name'],
        order: [['name', 'ASC']]
    });

    const materials = await Material.findAll({
        attributes: ['material_id', 'name'],
        order: [['name', 'ASC']]
    });

    // Get price range
    const priceRange = await Product.findOne({
        attributes: [
            [sequelize.fn('MIN', sequelize.col('base_price')), 'min_price'],
            [sequelize.fn('MAX', sequelize.col('base_price')), 'max_price']
        ]
    });

    return {
        categories,
        colors,
        sizes,
        materials,
        price_range: {
            min: parseFloat(priceRange?.dataValues?.min_price) || 0,
            max: parseFloat(priceRange?.dataValues?.max_price) || 0
        }
    };
};

module.exports = {
    getProducts,
    searchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getFilterOptions
};