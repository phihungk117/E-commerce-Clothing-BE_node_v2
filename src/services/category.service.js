const { Category, Product } = require('../models');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

/**
 * Get all categories as tree structure
 */
const getCategories = async (query) => {
    const { page, limit, offset } = getPagination(query);
    
    const { count, rows } = await Category.findAndCountAll({
        where: { parent_id: null },
        include: [
            {
                model: Category,
                as: 'children',
                include: [
                    {
                        model: Category,
                        as: 'children'
                    }
                ]
            }
        ],
        order: [['name', 'ASC']],
        limit,
        offset,
        distinct: true
    });

    return {
        categories: rows,
        pagination: getPaginationMeta(count, page, limit)
    };
};

/**
 * Get category by ID with products
 */
const getCategoryById = async (categoryId, query) => {
    const { page, limit, offset } = getPagination(query);
    
    const category = await Category.findByPk(categoryId, {
        include: [
            {
                model: Category,
                as: 'parent',
                attributes: ['category_id', 'name', 'slug']
            },
            {
                model: Category,
                as: 'children',
                attributes: ['category_id', 'name', 'slug', 'image', 'is_active']
            }
        ]
    });

    if (!category) {
        const error = new Error('Category not found');
        error.status = 404;
        throw error;
    }

    // Get products with pagination
    const { count, rows: products } = await Product.findAndCountAll({
        where: { category_id: categoryId },
        attributes: ['product_id', 'name', 'base_price', 'gender', 'age_group', 'created_at'],
        order: [['created_at', 'DESC']],
        limit,
        offset
    });

    return {
        category,
        products,
        pagination: getPaginationMeta(count, page, limit)
    };
};

/**
 * Create new category
 */
const createCategory = async (data) => {
    // Check if parent exists
    if (data.parent_id) {
        const parent = await Category.findByPk(data.parent_id);
        if (!parent) {
            const error = new Error('Parent category not found');
            error.status = 404;
            throw error;
        }
    }

    // Check duplicate slug
    if (data.slug) {
        const existingSlug = await Category.findOne({ where: { slug: data.slug } });
        if (existingSlug) {
            const error = new Error('Category slug already exists');
            error.status = 400;
            throw error;
        }
    }

    const category = await Category.create(data);
    return category;
};

/**
 * Update category
 */
const updateCategory = async (categoryId, data) => {
    const category = await Category.findByPk(categoryId);
    if (!category) {
        const error = new Error('Category not found');
        error.status = 404;
        throw error;
    }

    // Check duplicate slug if updating
    if (data.slug && data.slug !== category.slug) {
        const existingSlug = await Category.findOne({ where: { slug: data.slug } });
        if (existingSlug) {
            const error = new Error('Category slug already exists');
            error.status = 400;
            throw error;
        }
    }

    // Prevent circular parent reference
    if (data.parent_id && data.parent_id === categoryId) {
        const error = new Error('Category cannot be its own parent');
        error.status = 400;
        throw error;
    }

    await category.update(data);
    return category;
};

/**
 * Delete category (soft delete)
 */
const deleteCategory = async (categoryId) => {
    const category = await Category.findByPk(categoryId, {
        include: [
            { model: Category, as: 'children' },
            { model: Product, as: 'products' }
        ]
    });

    if (!category) {
        const error = new Error('Category not found');
        error.status = 404;
        throw error;
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
        const error = new Error('Cannot delete category with subcategories');
        error.status = 400;
        throw error;
    }

    // Check if category has products
    if (category.products && category.products.length > 0) {
        const error = new Error('Cannot delete category with products');
        error.status = 400;
        throw error;
    }

    await category.destroy();
    return { message: 'Category deleted successfully' };
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};