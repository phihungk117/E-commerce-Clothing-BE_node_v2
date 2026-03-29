const { Inventory, StockMovement, ProductVariant, Product, Warehouse } = require('../models');
const { Op } = require('sequelize');

class InventoryService {
  async listInventory({ page = 1, limit = 20, warehouseId, variantId, lowStockThreshold } = {}) {
    const where = {};
    if (warehouseId) where.warehouse_id = warehouseId;
    if (variantId) where.variant_id = variantId;
    if (lowStockThreshold != null) where.on_hand = { [Op.lte]: Number(lowStockThreshold) };

    const { count, rows } = await Inventory.findAndCountAll({
      where,
      include: [
        { model: Warehouse, as: 'warehouse' },
        { model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }
      ],
      order: [['updated_at', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      items: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }

  async adjustInventory(inventoryId, { delta, note = null, actorId = null }) {
    const inventory = await Inventory.findByPk(inventoryId);
    if (!inventory) throw new Error('Inventory not found');

    const nextOnHand = Number(inventory.on_hand) + Number(delta);
    if (nextOnHand < 0) throw new Error('Resulting stock cannot be negative');

    await inventory.update({ on_hand: nextOnHand });

    await StockMovement.create({
      warehouse_id: inventory.warehouse_id,
      variant_id: inventory.variant_id,
      movement_type: 'ADJUST',
      quantity: Math.abs(Number(delta)),
      reference_type: 'MANUAL',
      note: note || `Manual adjust by ${delta}`,
      created_by: actorId || null
    });

    return inventory;
  }

  async listMovements({ page = 1, limit = 20, variantId, warehouseId, movementType } = {}) {
    const where = {};
    if (variantId) where.variant_id = variantId;
    if (warehouseId) where.warehouse_id = warehouseId;
    if (movementType) where.movement_type = movementType;

    const { count, rows } = await StockMovement.findAndCountAll({
      where,
      include: [
        { model: Warehouse, as: 'warehouse' },
        { model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      movements: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }
}

module.exports = new InventoryService();
