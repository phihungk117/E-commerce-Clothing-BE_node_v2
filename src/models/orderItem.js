'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      OrderItem.belongsTo(models.ProductVariant, {
        foreignKey: 'variant_id',
        as: 'variant'
      });
    }
  }

  OrderItem.init({
    order_item_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    total_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: { min: 0 }
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'OrderItems',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['order_id'] },
      { fields: ['variant_id'] }
    ]
  });

  return OrderItem;
};
