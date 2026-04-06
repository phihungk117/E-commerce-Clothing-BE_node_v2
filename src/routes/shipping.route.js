const express = require('express');
const { ShippingMethod, ShippingZone, ShippingMethodZone } = require('../models');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const methods = await ShippingMethod.findAll({ where: { is_active: true } });
    return res.status(200).json({ data: methods, shippingMethods: methods });
  } catch (error) {
    return next(error);
  }
});

router.get('/zones', async (_req, res, next) => {
  try {
    const zones = await ShippingZone.findAll({ where: { is_active: true } });
    return res.status(200).json({ data: zones, shippingZones: zones });
  } catch (error) {
    return next(error);
  }
});

router.post('/calculate', async (req, res, next) => {
  try {
    const { shipping_method_id, zone_id, subtotal = 0 } = req.body || {};

    const method = await ShippingMethod.findByPk(shipping_method_id);
    if (!method || !method.is_active) {
      return res.status(404).json({ message: 'Shipping method not found' });
    }

    if (zone_id) {
      const zone = await ShippingZone.findByPk(zone_id);
      if (!zone || !zone.is_active) {
        return res.status(404).json({ message: 'Shipping zone not found' });
      }

      const supported = await ShippingMethodZone.findOne({
        where: { shipping_method_id, shipping_zone_id: zone_id },
      });
      if (!supported) {
        return res.status(400).json({ message: 'Shipping method is not available for selected zone' });
      }
    }

    const subtotalNum = Number(subtotal || 0);
    let fee = Number(method.base_fee || 0);
    if (method.free_shipping_threshold && subtotalNum >= Number(method.free_shipping_threshold)) {
      fee = 0;
    }

    return res.status(200).json({
      data: {
        fee,
        estimated_days: method.estimated_days,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
