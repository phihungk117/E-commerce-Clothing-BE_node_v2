'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ShippingMethod extends Model {
    static associate(models) {
      ShippingMethod.belongsToMany(models.ShippingZone, {
        through: 'ShippingMethodZones',
        foreignKey: 'shipping_method_id',
        as: 'zones'
      });
    }
  }

  ShippingMethod.init({
    shipping_method_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    base_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    free_shipping_threshold: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    estimated_days: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ShippingMethod',
    tableName: 'ShippingMethods',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ShippingMethod;
};