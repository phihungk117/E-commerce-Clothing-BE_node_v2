const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getPagination = (query = {}) => {
  const page = toInt(query.page, 1);
  const limit = toInt(query.limit, 10);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

const getPaginationMeta = (totalItems, page, limit) => ({
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
  currentPage: page,
  itemsPerPage: limit,
});

module.exports = {
  getPagination,
  getPaginationMeta,
};
