const { Product, Category, Material, ProductImage, ProductVariant, Color, Size, Inventory } = require('../models');
const { Op } = require('sequelize');

/** Nhóm ảnh theo color_id; ảnh không gắn màu (null) vào bucket `default`. */
function buildImagesByColor(images) {
    if (!Array.isArray(images)) return [];
    const buckets = new Map();
    for (const img of images) {
        const key = img.color_id || '__default__';
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(img);
    }
    const out = [];
    for (const [key, imgs] of buckets) {
        imgs.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        const colorId = key === '__default__' ? null : key;
        const first = imgs[0];
        out.push({
            color_id: colorId,
            color: first?.color || null,
            images: imgs.map((i) => ({
                image_id: i.image_id,
                image_url: i.image_url,
                alt_text: i.alt_text,
                is_thumbnail: i.is_thumbnail,
                sort_order: i.sort_order,
                color_id: i.color_id,
            })),
        });
    }
    return out;
}

/** Màu duy nhất từ biến thể (để FE render swatch). */
function uniqueColorsFromVariants(variants) {
    const seen = new Map();
    for (const v of variants || []) {
        const c = v.color;
        if (c?.color_id && !seen.has(c.color_id)) seen.set(c.color_id, c);
    }
    return Array.from(seen.values());
}

/** Gắn ảnh đại diện từ variant (nếu có) vào nhóm cùng màu — bổ sung khi chưa có ProductImage. */
function mergeVariantCoverImages(json) {
    const byColor = json.images_by_color;
    if (!Array.isArray(byColor) || !Array.isArray(json.variants)) return;
    for (const v of json.variants) {
        if (!v?.image || !v.color_id) continue;
        let group = byColor.find((g) => g.color_id === v.color_id);
        if (!group) {
            group = {
                color_id: v.color_id,
                color: v.color || null,
                images: [],
            };
            byColor.push(group);
        }
        const dup = group.images.some((i) => i.image_url === v.image);
        if (!dup) {
            group.images.unshift({
                image_url: v.image,
                variant_id: v.variant_id,
                source: 'variant_cover',
                is_thumbnail: group.images.length === 0,
            });
        }
    }
}

function enrichProductPayload(product) {
    const json = typeof product.toJSON === 'function' ? product.toJSON() : { ...product };
    if (Array.isArray(json.images)) {
        json.images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }
    json.images_by_color = buildImagesByColor(json.images);
    json.colors = uniqueColorsFromVariants(json.variants);
    mergeVariantCoverImages(json);
    return json;
}

const imageInclude = {
    model: ProductImage,
    as: 'images',
    separate: true,
    order: [
        ['sort_order', 'ASC'],
        ['created_at', 'ASC'],
    ],
    attributes: ['image_id', 'product_id', 'color_id', 'image_url', 'alt_text', 'is_thumbnail', 'sort_order', 'created_at'],
    include: [
        {
            model: Color,
            as: 'color',
            attributes: ['color_id', 'name', 'hex_code'],
            required: false,
        },
    ],
};

const variantInclude = {
    model: ProductVariant,
    as: 'variants',
    required: false,
    include: [
        {
            model: Color,
            as: 'color',
            attributes: ['color_id', 'name', 'hex_code'],
        },
        {
            model: Size,
            as: 'size',
            attributes: ['size_id', 'name'],
        },
        {
            model: Inventory,
            as: 'inventories',
            attributes: ['on_hand', 'reserved'],
        },
    ],
};

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
        sort_order = 'DESC',
    } = query;

    const offset = (page - 1) * limit;
    const where = {};
    const variantWhere = {};

    if (name) {
        where[Op.or] = [
            { name: { [Op.like]: `%${name}%` } },
            { description: { [Op.like]: `%${name}%` } },
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

    const variantIncludeQuery = {
        ...variantInclude,
        include: [...variantInclude.include],
    };

    if (color_id) {
        variantWhere.color_id = color_id;
    }
    if (size_id) {
        variantWhere.size_id = size_id;
    }

    if (Object.keys(variantWhere).length > 0) {
        variantIncludeQuery.where = variantWhere;
        variantIncludeQuery.required = true;
    }

    const { count, rows } = await Product.findAndCountAll({
        where,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        order: [[sort_by, sort_order]],
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'name'],
            },
            {
                model: Material,
                as: 'material',
                attributes: ['material_id', 'name'],
            },
            imageInclude,
            variantIncludeQuery,
        ],
        distinct: true,
    });

    let products = rows;
    if (in_stock === 'true' || out_of_stock === 'true') {
        products = products.filter((product) => {
            const hasStock = product.variants?.some((v) =>
                (v.inventories ?? []).some((inv) => (inv.on_hand ?? 0) > 0)
            );
            if (in_stock === 'true' && out_of_stock === 'true') return true;
            if (in_stock === 'true') return hasStock;
            if (out_of_stock === 'true') return !hasStock;
            return true;
        });
    }

    const formattedProducts = products.map((product) => enrichProductPayload(product));

    return {
        products: formattedProducts,
        pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            total: count,
            total_pages: Math.ceil(count / limit),
        },
    };
};

/**
 * Chi tiết sản phẩm: đầy đủ ảnh (theo màu), biến thể, nhóm images_by_color.
 * Query: color_id — trả thêm gallery cho màu đó (ảnh ProductImage + variant cover).
 */
const getProductById = async (id, query = {}) => {
    const { color_id: filterColorId } = query;

    const product = await Product.findByPk(id, {
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'name'],
            },
            {
                model: Material,
                as: 'material',
                attributes: ['material_id', 'name'],
            },
            imageInclude,
            variantInclude,
        ],
    });

    if (!product) {
        const err = new Error('Product not found');
        err.status = 404;
        throw err;
    }

    const json = enrichProductPayload(product);

    if (filterColorId) {
        const group = json.images_by_color.find((g) => g.color_id === filterColorId);
        json.images_for_color = group?.images || [];
        json.selected_color_id = filterColorId;
    }

    return json;
};

const searchProducts = async (query) => {
    const merged = { ...query };
    if (query.q && !query.name) {
        merged.name = query.q;
    }
    return getProducts(merged);
};

const getFilterOptions = async () => ({
    message: 'Use GET /categories and product list filters',
    filters: ['category_id', 'color_id', 'size_id', 'gender', 'age_group', 'min_price', 'max_price'],
});

const createProduct = async () => {
    throw new Error('createProduct: implement or use admin API');
};

const updateProduct = async () => {
    throw new Error('updateProduct: implement or use admin API');
};

const deleteProduct = async () => {
    throw new Error('deleteProduct: implement or use admin API');
};

module.exports = {
    getProducts,
    getProductById,
    searchProducts,
    getFilterOptions,
    createProduct,
    updateProduct,
    deleteProduct,
};
