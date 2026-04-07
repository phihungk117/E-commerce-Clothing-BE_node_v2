const {
    Product,
    Category,
    Material,
    ProductImage,
    ProductVariant,
    Color,
    Size,
    Inventory,
    CartItem,
    sequelize,
} = require('../models');
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

function toBoolean(v) {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') {
        const x = v.trim().toLowerCase();
        return x === 'true' || x === '1' || x === 'yes';
    }
    return false;
}

function isNonEmptyString(v) {
    return typeof v === 'string' && v.trim().length > 0;
}

function toNumberOrNull(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
}

function fail(message, status = 400) {
    const err = new Error(message);
    err.status = status;
    throw err;
}

async function ensureCategoryExists(categoryId, options = {}) {
    if (!categoryId) return;
    const category = await Category.findByPk(categoryId, options);
    if (!category) fail('Category not found', 404);
}

async function ensureMaterialExists(materialId, options = {}) {
    if (!materialId) return;
    const material = await Material.findByPk(materialId, options);
    if (!material) fail('Material not found', 404);
}

async function ensureColorExists(colorId, options = {}) {
    if (!colorId) return;
    const color = await Color.findByPk(colorId, options);
    if (!color) fail('Color not found', 404);
}

async function ensureSizeExists(sizeId, options = {}) {
    if (!sizeId) return;
    const size = await Size.findByPk(sizeId, options);
    if (!size) fail('Size not found', 404);
}

function normalizeCreatePayload(data = {}) {
    const payload = {
        category_id: data.category_id,
        material_id: data.material_id ?? null,
        name: data.name,
        description: data.description ?? null,
        base_price: data.base_price,
        gender: data.gender,
        age_group: data.age_group,
    };

    if (!payload.category_id) fail('category_id is required');
    if (!isNonEmptyString(payload.name)) fail('name is required');
    if (payload.base_price === undefined || payload.base_price === null || payload.base_price === '') {
        fail('base_price is required');
    }

    const p = toNumberOrNull(payload.base_price);
    if (!Number.isFinite(p) || p < 0) fail('base_price must be a non-negative number');

    const allowedGender = new Set(['MALE', 'FEMALE', 'UNISEX']);
    if (!allowedGender.has(String(payload.gender || '').toUpperCase())) {
        fail('gender must be one of MALE, FEMALE, UNISEX');
    }

    const allowedAgeGroup = new Set(['ADULT', 'TEEN', 'KID', 'BABY']);
    if (!allowedAgeGroup.has(String(payload.age_group || '').toUpperCase())) {
        fail('age_group must be one of ADULT, TEEN, KID, BABY');
    }

    payload.base_price = p;
    payload.gender = String(payload.gender).toUpperCase();
    payload.age_group = String(payload.age_group).toUpperCase();
    if (payload.material_id === '') payload.material_id = null;

    return payload;
}

function normalizeUpdatePayload(data = {}) {
    const payload = {};

    if (data.category_id !== undefined) payload.category_id = data.category_id;
    if (data.material_id !== undefined) payload.material_id = data.material_id || null;
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.gender !== undefined) payload.gender = String(data.gender).toUpperCase();
    if (data.age_group !== undefined) payload.age_group = String(data.age_group).toUpperCase();
    if (data.base_price !== undefined) {
        const p = toNumberOrNull(data.base_price);
        if (!Number.isFinite(p) || p < 0) fail('base_price must be a non-negative number');
        payload.base_price = p;
    }

    if (payload.name !== undefined && !isNonEmptyString(payload.name)) fail('name cannot be empty');

    if (payload.gender !== undefined) {
        const allowedGender = new Set(['MALE', 'FEMALE', 'UNISEX']);
        if (!allowedGender.has(payload.gender)) fail('gender must be one of MALE, FEMALE, UNISEX');
    }

    if (payload.age_group !== undefined) {
        const allowedAgeGroup = new Set(['ADULT', 'TEEN', 'KID', 'BABY']);
        if (!allowedAgeGroup.has(payload.age_group)) fail('age_group must be one of ADULT, TEEN, KID, BABY');
    }

    return payload;
}

function normalizeVariantsInput(variants) {
    if (variants === undefined || variants === null) return [];
    if (!Array.isArray(variants)) fail('variants must be an array');

    return variants.map((v, idx) => {
        if (!v || typeof v !== 'object') fail(`variants[${idx}] must be an object`);
        if (!v.color_id) fail(`variants[${idx}].color_id is required`);
        if (!v.size_id) fail(`variants[${idx}].size_id is required`);
        if (!isNonEmptyString(v.sku)) fail(`variants[${idx}].sku is required`);

        const price = v.price === undefined || v.price === null || v.price === '' ? null : Number(v.price);
        const originalPrice = v.original_price === undefined || v.original_price === null || v.original_price === '' ? null : Number(v.original_price);
        const stockQty = v.stock_quantity === undefined || v.stock_quantity === null || v.stock_quantity === '' ? 0 : Number(v.stock_quantity);
        const weight = v.weight === undefined || v.weight === null || v.weight === '' ? null : Number(v.weight);

        if (price !== null && (!Number.isFinite(price) || price < 0)) fail(`variants[${idx}].price must be a non-negative number`);
        if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < 0)) fail(`variants[${idx}].original_price must be a non-negative number`);
        if (!Number.isFinite(stockQty) || stockQty < 0) fail(`variants[${idx}].stock_quantity must be a non-negative number`);
        if (weight !== null && (!Number.isFinite(weight) || weight < 0)) fail(`variants[${idx}].weight must be a non-negative number`);

        return {
            color_id: v.color_id,
            size_id: v.size_id,
            sku: String(v.sku).trim(),
            image: v.image || null,
            original_price: originalPrice,
            price,
            stock_quantity: Math.floor(stockQty),
            weight,
            is_active: v.is_active === undefined ? true : toBoolean(v.is_active),
        };
    });
}

function normalizeImagesInput(images) {
    if (images === undefined || images === null) return [];
    if (!Array.isArray(images)) fail('images must be an array');

    return images.map((img, idx) => {
        if (!img || typeof img !== 'object') fail(`images[${idx}] must be an object`);
        if (!isNonEmptyString(img.image_url)) fail(`images[${idx}].image_url is required`);

        return {
            image_url: String(img.image_url).trim(),
            alt_text: img.alt_text ?? null,
            color_id: img.color_id || null,
            is_thumbnail: toBoolean(img.is_thumbnail),
            sort_order: img.sort_order === undefined || img.sort_order === null || img.sort_order === ''
                ? idx
                : Number(img.sort_order),
        };
    });
}

function ensureUniqueVariantsOrFail(variants = []) {
    const combo = new Set();
    const skuSet = new Set();

    for (const v of variants) {
        const key = `${v.color_id}__${v.size_id}`;
        if (combo.has(key)) fail('Duplicate variant combination (color_id + size_id) in payload');
        combo.add(key);

        const skuKey = String(v.sku).toLowerCase();
        if (skuSet.has(skuKey)) fail('Duplicate SKU in variants payload');
        skuSet.add(skuKey);
    }
}

async function ensureVariantRefsExist(variants = [], options = {}) {
    for (const v of variants) {
        await ensureColorExists(v.color_id, options);
        await ensureSizeExists(v.size_id, options);
    }
}

async function ensureImageRefsExist(images = [], options = {}) {
    for (const img of images) {
        if (img.color_id) await ensureColorExists(img.color_id, options);
    }
}

async function getMainWarehouseId(options = {}) {
    let warehouse = await sequelize.models.Warehouse.findOne({
        where: { code: 'MAIN' },
        paranoid: false,
        ...options,
    });

    if (!warehouse) {
        warehouse = await sequelize.models.Warehouse.create(
            {
                name: 'Default Warehouse',
                code: 'MAIN',
                address: 'N/A',
                is_active: true,
            },
            options,
        );
    } else if (warehouse.deleted_at) {
        await warehouse.restore(options);
        if (!warehouse.is_active) {
            await warehouse.update({ is_active: true }, options);
        }
    }

    return warehouse.warehouse_id;
}

const createProduct = async (data = {}) => {
    const payload = normalizeCreatePayload(data);
    const variants = normalizeVariantsInput(data.variants);
    const images = normalizeImagesInput(data.images);

    ensureUniqueVariantsOrFail(variants);

    const productId = await sequelize.transaction(async (transaction) => {
        const tx = { transaction };

        await ensureCategoryExists(payload.category_id, tx);
        await ensureMaterialExists(payload.material_id, tx);
        await ensureVariantRefsExist(variants, tx);
        await ensureImageRefsExist(images, tx);

        if (variants.length > 0) {
            const skus = variants.map((v) => v.sku);
            const skuExists = await ProductVariant.findOne({ where: { sku: { [Op.in]: skus } }, ...tx });
            if (skuExists) fail(`SKU already exists: ${skuExists.sku}`, 400);
        }

        const product = await Product.create(payload, tx);

        if (variants.length > 0) {
            const warehouseId = await getMainWarehouseId(tx);
            for (const v of variants) {
                const createdVariant = await ProductVariant.create(
                    {
                        ...v,
                        product_id: product.product_id,
                    },
                    tx,
                );

                await Inventory.create(
                    {
                        warehouse_id: warehouseId,
                        variant_id: createdVariant.variant_id,
                        on_hand: v.stock_quantity || 0,
                        reserved: 0,
                    },
                    tx,
                );
            }
        }

        if (images.length > 0) {
            const hasThumb = images.some((img) => img.is_thumbnail);
            const normalizedImages = hasThumb
                ? images
                : images.map((img, idx) => ({ ...img, is_thumbnail: idx === 0 }));

            for (const img of normalizedImages) {
                await ProductImage.create(
                    {
                        ...img,
                        product_id: product.product_id,
                    },
                    tx,
                );
            }
        }

        return product.product_id;
    });

    return getProductById(productId);
};

const updateProduct = async (id, data = {}) => {
    const payload = normalizeUpdatePayload(data);

    const updatedId = await sequelize.transaction(async (transaction) => {
        const tx = { transaction };
        const product = await Product.findByPk(id, tx);
        if (!product) fail('Product not found', 404);

        if (payload.category_id !== undefined) {
            await ensureCategoryExists(payload.category_id, tx);
        }
        if (payload.material_id !== undefined && payload.material_id !== null) {
            await ensureMaterialExists(payload.material_id, tx);
        }

        if (Object.keys(payload).length > 0) {
            await product.update(payload, tx);
        }

        return product.product_id;
    });

    return getProductById(updatedId);
};

const deleteProduct = async (id) => {
    await sequelize.transaction(async (transaction) => {
        const tx = { transaction };

        const product = await Product.findByPk(id, {
            ...tx,
            include: [
                {
                    model: ProductVariant,
                    as: 'variants',
                    required: false,
                },
                {
                    model: ProductImage,
                    as: 'images',
                    required: false,
                },
            ],
        });

        if (!product) fail('Product not found', 404);

        const variantIds = (product.variants || []).map((v) => v.variant_id);

        if (variantIds.length > 0) {
            const inCartCount = await CartItem.count({ where: { variant_id: { [Op.in]: variantIds } }, ...tx });
            if (inCartCount > 0) {
                fail('Cannot delete product: one or more variants are still in carts', 409);
            }
        }

        await product.destroy(tx);
    });

    return { message: 'Product deleted successfully' };
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
