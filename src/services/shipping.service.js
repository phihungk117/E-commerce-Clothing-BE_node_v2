const { ShippingMethod, ShippingZone, sequelize } = require('../models');

class ShippingService {
  getShippingMethodZoneModel() {
    return sequelize.models.ShippingMethodZone || sequelize.models.ShippingMethodZones;
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