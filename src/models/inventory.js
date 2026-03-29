'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.Warehouse, {
        foreignKey: 'warehouse_id',
        as: 'warehouse'
      });
      Inventory.belongsTo(models.ProductVariant, {
        foreignKey: 'variant_id',
        as: 'variant'
      });
    }
  }

  Inventory.init({
    inventory_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    warehouse_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    on_hand: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 }
    },
    reserved: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 }
    }
  }, {
    sequelize,
    modelName: 'Inventory',
    tableName: 'Inventories',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        unique: true,
        fields: ['warehouse_id', 'variant_id'],
        name: 'unique_inventory_per_warehouse_variant'
      },
      { fields: ['warehouse_id'] },
      { fields: ['variant_id'] }
    ]
  });

  return Inventory;
};
