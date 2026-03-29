const inventoryService = require('../services/inventory.service');

class InventoryController {
  async getInventory(req, res, next) {
    try {
      const { page = 1, limit = 20, warehouseId, variantId, lowStockThreshold } = req.query;
      const result = await inventoryService.listInventory({
        page: Number(page),
        limit: Number(limit),
        warehouseId,
        variantId,
        lowStockThreshold
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async adjustInventory(req, res, next) {
    try {
      const { inventoryId } = req.params;
      const { delta, note } = req.body;
      const actorId = req.user?.user_id || null;
      const item = await inventoryService.adjustInventory(inventoryId, { delta, note, actorId });
      res.status(200).json({ message: 'Inventory adjusted', inventory: item });
    } catch (error) {
      next(error);
    }
  }

  async getMovements(req, res, next) {
    try {
      const { page = 1, limit = 20, variantId, warehouseId, movementType } = req.query;
      const result = await inventoryService.listMovements({
        page: Number(page),
        limit: Number(limit),
        variantId,
        warehouseId,
        movementType
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
