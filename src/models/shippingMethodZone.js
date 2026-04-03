'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ShippingMethodZone extends Model {
    static associate(models) {
      ShippingMethodZone.belongsTo(models.ShippingMethod, {
        foreignKey: 'shipping_method_id',
        as: 'method'
      });

      ShippingMethodZone.belongsTo(models.ShippingZone, {
        foreignKey: 'shipping_zone_id',
        as: 'zone'
      });
    }
  }

  ShippingMethodZone.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    shipping_method_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    shipping_zone_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    estimated_days: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ShippingMethodZone',
    tableName: 'ShippingMethodZones',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['shipping_method_id'] },
      { fields: ['shipping_zone_id'] },
      { unique: true, fields: ['shipping_method_id', 'shipping_zone_id'] }
    ]
  });

  return ShippingMethodZone;
};