/**
 * Pagination Utility
 * Reusable pagination helper for all list APIs
 */

const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

const getPaginationMeta = (count, page, limit) => {
    const totalPages = Math.ceil(count / limit);
    return {
        page,
        limit,
        total: count,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
    };
};

const paginate = async (model, query, options = {}) => {
    const { page, limit, offset } = getPagination(query);
    const { where = {}, include = [], order = [['created_at', 'DESC']], attributes } = options;

    const { count, rows } = await model.findAndCountAll({
        where,
        limit,
        offset,
        order,
        include,
        attributes,
        distinct: true
    });

    return {
        data: rows,
        pagination: getPaginationMeta(count, page, limit)
    };
};

module.exports = {
    getPagination,
    getPaginationMeta,
    paginate
};
