'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ShippingZone extends Model {
    static associate(models) {
      ShippingZone.belongsToMany(models.ShippingMethod, {
        through: 'ShippingMethodZones',
        foreignKey: 'shipping_zone_id',
        as: 'methods'
      });
    }
  }

  ShippingZone.init({
    shipping_zone_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    region: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ShippingZone',
    tableName: 'ShippingZones',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ShippingZone;
};