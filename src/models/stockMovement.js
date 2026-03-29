'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StockMovement extends Model {
    static associate(models) {
      StockMovement.belongsTo(models.Warehouse, {
        foreignKey: 'warehouse_id',
        as: 'warehouse'
      });
      StockMovement.belongsTo(models.ProductVariant, {
        foreignKey: 'variant_id',
        as: 'variant'
      });
    }
  }

  StockMovement.init({
    movement_id: {
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
    movement_type: {
      type: DataTypes.ENUM('IN', 'OUT', 'ADJUST', 'RESERVE', 'RELEASE', 'RETURN'),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    reference_type: {
      type: DataTypes.ENUM('ORDER', 'PURCHASE', 'RETURN', 'MANUAL'),
      allowNull: true
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'StockMovement',
    tableName: 'StockMovements',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['warehouse_id'] },
      { fields: ['variant_id'] },
      { fields: ['reference_id'] }
    ]
  });

  return StockMovement;
};
