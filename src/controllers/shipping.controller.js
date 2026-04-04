const shippingService = require('../services/shipping.service');

class ShippingController {
  async getShippingMethods(req, res, next) {
    try {
      const { active = 'true' } = req.query;
      const methods = await shippingService.getShippingMethods(active === 'true');
      res.status(200).json({ shippingMethods: methods });
    } catch (error) {
      next(error);
    }
  }

  async getShippingMethodById(req, res, next) {
    try {
      const { methodId } = req.params;
      const method = await shippingService.getShippingMethodById(methodId);
      if (!method) {
        return res.status(404).json({ message: 'Shipping method not found' });
      }
      res.status(200).json({ shippingMethod: method });
    } catch (error) {
      next(error);
    }
  }

  async calculateShipping(req, res, next) {
    try {
      const { methodId, zoneId } = req.body;
      const result = await shippingService.calculateShippingFee(methodId, zoneId);
      res.status(200).json(result || { fee: 0, estimated_days: null });
    } catch (error) {
      next(error);
    }
  }

  // Admin methods
  async createShippingMethod(req, res, next) {
    try {
      const method = await shippingService.createShippingMethod(req.body);
      res.status(201).json({ message: 'Shipping method created', method });
    } catch (error) {
      next(error);
    }
  }

  async updateShippingMethod(req, res, next) {
    try {
      const { methodId } = req.params;
      const method = await shippingService.updateShippingMethod(methodId, req.body);
      res.status(200).json({ message: 'Shipping method updated', method });
    } catch (error) {
      next(error);
    }
  }

  async deleteShippingMethod(req, res, next) {
    try {
      const { methodId } = req.params;
      const result = await shippingService.deleteShippingMethod(methodId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getShippingZones(req, res, next) {
    try {
      const { active = 'true' } = req.query;
      const zones = await shippingService.getShippingZones(active === 'true');
      res.status(200).json({ shippingZones: zones });
    } catch (error) {
      next(error);
    }
  }

  async createShippingZone(req, res, next) {
    try {
      const zone = await shippingService.createShippingZone(req.body);
      res.status(201).json({ message: 'Shipping zone created', zone });
    } catch (error) {
      next(error);
    }
  }

  async updateShippingZone(req, res, next) {
    try {
      const { zoneId } = req.params;
      const zone = await shippingService.updateShippingZone(zoneId, req.body);
      res.status(200).json({ message: 'Shipping zone updated', zone });
    } catch (error) {
      next(error);
    }
  }

  async deleteShippingZone(req, res, next) {
    try {
      const { zoneId } = req.params;
      const result = await shippingService.deleteShippingZone(zoneId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMethodZones(req, res, next) {
    try {
      const { methodId } = req.params;
      const zones = await shippingService.getShippingZonesByMethod(methodId);
      res.status(200).json({ zones });
    } catch (error) {
      next(error);
    }
  }

  async assignZoneToMethod(req, res, next) {
    try {
      const { methodId } = req.params;
      const { zoneId, fee, estimated_days } = req.body;
      const mapping = await shippingService.assignZoneToMethod(methodId, zoneId, fee, estimated_days);
      res.status(200).json({ message: 'Zone assigned to method', mapping });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ShippingController();