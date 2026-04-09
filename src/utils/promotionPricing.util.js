const { Op } = require('sequelize');
const { Promotion, Product } = require('../models');

/**
 * Apply one promotion rule to a unit price (variant or base list price).
 */
function applyPromotionToUnitPrice(unitPrice, promo) {
  const p = parseFloat(unitPrice);
  if (!Number.isFinite(p) || p <= 0) return p;
  const dt = String(promo.discount_type || '').toLowerCase();
  const dv = parseFloat(promo.discount_value);
  if (!Number.isFinite(dv) || dv < 0) return p;
  if (dt === 'percentage') return Math.max(0, p * (1 - dv / 100));
  if (dt === 'fixed_amount') return Math.max(0, p - dv);
  return p;
}

/**
 * Best (lowest) price after evaluating all linked promotions against the same list price.
 */
function bestUnitPriceAfterPromotions(unitPrice, promotions) {
  if (!promotions || promotions.length === 0) return unitPrice;
  const u = parseFloat(unitPrice);
  if (!Number.isFinite(u) || u <= 0) return unitPrice;
  let best = u;
  for (const pr of promotions) {
    const n = applyPromotionToUnitPrice(u, pr);
    if (n < best) best = n;
  }
  return best;
}

/**
 * Map product_id -> list of { discount_type, discount_value } for currently active promotions.
 */
async function loadPromotionRulesByProductIds(productIds, queryOptions = {}) {
  const unique = [...new Set((productIds || []).filter(Boolean))];
  const map = new Map();
  for (const id of unique) map.set(id, []);

  if (unique.length === 0) return map;

  const now = new Date();
  const promotions = await Promotion.findAll({
    where: {
      is_active: true,
      start_date: { [Op.lte]: now },
      end_date: { [Op.gte]: now },
    },
    include: [
      {
        model: Product,
        as: 'products',
        attributes: ['product_id'],
        where: { product_id: { [Op.in]: unique } },
        through: { attributes: [] },
        required: true,
      },
    ],
    ...queryOptions,
  });

  for (const promo of promotions) {
    const pj = promo.toJSON();
    const rule = {
      discount_type: promo.discount_type,
      discount_value: parseFloat(promo.discount_value),
    };
    for (const p of pj.products || []) {
      const pid = p.product_id;
      if (map.has(pid)) map.get(pid).push(rule);
    }
  }

  return map;
}

function normalizePromotionListForApi(rows) {
  return (rows || []).map((p) => ({
    promotion_id: p.promotion_id,
    name: p.name,
    discount_type: p.discount_type,
    discount_value: parseFloat(p.discount_value),
  }));
}

/**
 * Replace Sequelize `promotions` include with public `active_promotions` + optional card `promotional_pricing`.
 */
function attachProductPromotionalPricing(json) {
  const raw = json.promotions;
  if (!raw || !Array.isArray(raw) || raw.length === 0) {
    json.active_promotions = [];
    delete json.promotions;
    return;
  }

  json.active_promotions = normalizePromotionListForApi(raw);
  delete json.promotions;

  const promos = json.active_promotions;
  const variants = json.variants || [];
  const base = parseFloat(json.base_price);
  let ref = NaN;
  if (variants[0]?.price != null && variants[0].price !== '') {
    ref = parseFloat(variants[0].price);
  }
  if (!Number.isFinite(ref) || ref <= 0) {
    ref = Number.isFinite(base) ? base : NaN;
  }
  if (!Number.isFinite(ref) || ref <= 0) return;

  const best = bestUnitPriceAfterPromotions(ref, promos);
  if (best < ref - 0.005) {
    json.promotional_pricing = {
      original_price: Math.round(ref),
      sale_price: Math.round(best),
    };
  }
}

module.exports = {
  applyPromotionToUnitPrice,
  bestUnitPriceAfterPromotions,
  loadPromotionRulesByProductIds,
  attachProductPromotionalPricing,
};
