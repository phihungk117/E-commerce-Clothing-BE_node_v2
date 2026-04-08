const { ShippingMethod, ShippingZone, Address, sequelize } = require('../models');

/** Region codes stored on ShippingZone.region (seeded). */
const ZONE_REGION = {
  HCM_INNER: 'HCM_INNER',
  HCM_OUTER: 'HCM_OUTER',
  NATIONAL: 'NATIONAL',
};

class ShippingService {
  getShippingMethodZoneModel() {
    return sequelize.models.ShippingMethodZone || sequelize.models.ShippingMethodZones;
  }

  /**
   * Normalize Vietnamese text for loose matching (no diacritics, lower case).
   */
  normalizeAddressText(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Classify delivery area from address parts → ShippingZone.region code.
   */
  classifyAddressRegion({ city, district, shipping_address }) {
    const blob = this.normalizeAddressText(`${city} ${district} ${shipping_address}`);
    const cityN = this.normalizeAddressText(city);

    const isHcm =
      cityN.includes('ho chi minh') ||
      cityN.includes('tp hcm') ||
      cityN.includes('tp ho chi minh') ||
      cityN.includes('thanh pho ho chi minh') ||
      cityN === 'hcm' ||
      blob.includes('tp ho chi minh') ||
      blob.includes('ho chi minh');

    if (!isHcm) {
      return ZONE_REGION.NATIONAL;
    }

    const distN = this.normalizeAddressText(district);
    const outerKeywords = ['cu chi', 'hoc mon', 'nha be', 'can gio', 'binh chanh'];
    const isOuter =
      outerKeywords.some((k) => distN.includes(k) || blob.includes(k));

    if (isOuter) return ZONE_REGION.HCM_OUTER;
    return ZONE_REGION.HCM_INNER;
  }

  /**
   * Resolve shipping_zone_id from city / district / full address string.
   */
  async inferShippingZoneIdFromAddress({ city, district, shipping_address }) {
    const code = this.classifyAddressRegion({ city, district, shipping_address });
    const z = await ShippingZone.findOne({
      where: { region: code, is_active: true },
    });
    return z?.shipping_zone_id ?? null;
  }

  /**
   * Bước 1: Lấy fee từ ShippingMethodZone (methodId + zoneId).
   * Bước 2: Nếu orderSubtotal >= free_shipping_threshold của ShippingMethod → 0.
   * Bước 3: Ngược lại trả về fee từ bảng trung gian (hoặc fallback).
   * @returns {Promise<number>}
   */
  async calculateFinalShippingFee(orderSubtotal, methodId, zoneId) {
    const sub = parseFloat(orderSubtotal) || 0;
    const fallback = parseFloat(process.env.DEFAULT_SHIPPING_FEE || '0', 10) || 0;

    if (!methodId || !zoneId) {
      return fallback;
    }

    const ShippingMethodZone = this.getShippingMethodZoneModel();
    if (!ShippingMethodZone) return fallback;

    const method = await ShippingMethod.findByPk(methodId);
    if (!method || !method.is_active) {
      return fallback;
    }

    const thresholdRaw = method.free_shipping_threshold;
    const threshold =
      thresholdRaw != null && thresholdRaw !== ''
        ? parseFloat(thresholdRaw)
        : null;
    if (threshold != null && !Number.isNaN(threshold) && sub >= threshold) {
      return 0;
    }

    const row = await ShippingMethodZone.findOne({
      where: { shipping_method_id: methodId, shipping_zone_id: zoneId },
    });

    if (!row) {
      const base = parseFloat(method.base_fee || 0);
      return Number.isNaN(base) ? fallback : Math.max(0, base);
    }

    let fee = parseFloat(row.fee);
    if (Number.isNaN(fee)) fee = 0;
    return Math.max(0, fee);
  }

  /**
   * Checkout / order: resolve zone from explicit ids, saved address, or geographic hints; then calculate fee.
   * @param {number} orderSubtotal - merchandise subtotal before coupon
   * @param {string} [methodId]
   * @param {string} [zoneId]
   * @param {object} [hints]
   * @param {string} [hints.user_id]
   * @param {string} [hints.address_id]
   * @param {string} [hints.city]
   * @param {string} [hints.district]
   * @param {string} [hints.shipping_address]
   */
  async resolveOrderShippingFee(orderSubtotal, methodId, zoneId, hints = {}) {
    let resolvedZoneId = zoneId || null;
    const {
      user_id: userId,
      address_id: addressId,
      city: hintCity,
      district: hintDistrict,
      shipping_address: hintLine,
    } = hints;

    let city = hintCity;
    let district = hintDistrict;
    let shippingAddress = hintLine;

    if (!resolvedZoneId && addressId && userId) {
      const addr = await Address.findOne({
        where: { address_id: addressId, user_id: userId },
      });
      if (addr) {
        city = city || addr.city;
        district = district || addr.district;
        shippingAddress =
          shippingAddress ||
          [addr.street_address, addr.ward, addr.district, addr.city]
            .filter(Boolean)
            .join(', ');
      }
    }

    if (!resolvedZoneId) {
      resolvedZoneId = await this.inferShippingZoneIdFromAddress({
        city,
        district,
        shipping_address: shippingAddress,
      });
    }

    if (!resolvedZoneId) {
      const nat = await ShippingZone.findOne({
        where: { region: ZONE_REGION.NATIONAL, is_active: true },
      });
      resolvedZoneId = nat?.shipping_zone_id ?? null;
    }

    let resolvedMethodId = methodId || null;
    if (!resolvedMethodId) {
      const m = await ShippingMethod.findOne({
        where: { is_active: true },
        order: [['created_at', 'ASC']],
      });
      resolvedMethodId = m?.shipping_method_id ?? null;
    }

    return this.calculateFinalShippingFee(
      orderSubtotal,
      resolvedMethodId,
      resolvedZoneId
    );
  }

  async createShippingMethod(data) {
    return ShippingMethod.create(data);
  }

  async getShippingMethods(activeOnly = true) {
    const where = activeOnly ? { is_active: true } : {};
    return ShippingMethod.findAll({
      where,
      include: [{ model: ShippingZone, as: 'zones', through: { attributes: ['fee', 'estimated_days'] } }],
      order: [['created_at', 'ASC']]
    });
  }

  async getShippingMethodById(id) {
    return ShippingMethod.findByPk(id, {
      include: [{ model: ShippingZone, as: 'zones', through: { attributes: ['fee', 'estimated_days'] } }]
    });
  }

  async updateShippingMethod(id, data) {
    const method = await ShippingMethod.findByPk(id);
    if (!method) throw new Error('Shipping method not found');
    await method.update(data);
    return method;
  }

  async deleteShippingMethod(id) {
    const method = await ShippingMethod.findByPk(id);
    if (!method) throw new Error('Shipping method not found');
    await method.destroy();
    return { message: 'Shipping method deleted' };
  }

  // Shipping Zones
  async createShippingZone(data) {
    return ShippingZone.create(data);
  }

  async getShippingZones(activeOnly = true) {
    const where = activeOnly ? { is_active: true } : {};
    return ShippingZone.findAll({ where, order: [['created_at', 'ASC']] });
  }

  async getShippingZoneById(id) {
    return ShippingZone.findByPk(id);
  }

  async updateShippingZone(id, data) {
    const zone = await ShippingZone.findByPk(id);
    if (!zone) throw new Error('Shipping zone not found');
    await zone.update(data);
    return zone;
  }

  async deleteShippingZone(id) {
    const zone = await ShippingZone.findByPk(id);
    if (!zone) throw new Error('Shipping zone not found');
    await zone.destroy();
    return { message: 'Shipping zone deleted' };
  }

  async getShippingZonesByMethod(shippingMethodId) {
    const ShippingMethodZone = this.getShippingMethodZoneModel();
    if (!ShippingMethodZone) {
      throw new Error('ShippingMethodZone model is not initialized');
    }

    const methodZones = await ShippingMethodZone.findAll({
      where: { shipping_method_id: shippingMethodId }
    });
    return methodZones;
  }

  async calculateShippingFee(methodId, zoneId) {
    const ShippingMethodZone = this.getShippingMethodZoneModel();
    if (!ShippingMethodZone) {
      throw new Error('ShippingMethodZone model is not initialized');
    }

    const methodZone = await ShippingMethodZone.findOne({
      where: { shipping_method_id: methodId, shipping_zone_id: zoneId }
    });
    return methodZone;
  }

  async assignZoneToMethod(methodId, zoneId, fee, estimatedDays) {
    const ShippingMethodZone = this.getShippingMethodZoneModel();
    if (!ShippingMethodZone) {
      throw new Error('ShippingMethodZone model is not initialized');
    }

    const [record, created] = await ShippingMethodZone.findOrCreate({
      where: { shipping_method_id: methodId, shipping_zone_id: zoneId },
      defaults: {
        shipping_method_id: methodId,
        shipping_zone_id: zoneId,
        fee,
        estimated_days: estimatedDays
      }
    });

    if (!created) {
      await record.update({ fee, estimated_days: estimatedDays });
    }

    return record;
  }
}

module.exports = new ShippingService();
