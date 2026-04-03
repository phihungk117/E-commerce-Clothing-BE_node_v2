'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Order.belongsTo(models.Coupon, {
        foreignKey: 'coupon_id',
        as: 'coupon'
      });
      Order.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'items'
      });
      Order.hasMany(models.Payment, {
        foreignKey: 'order_id',
        as: 'payments'
      });
    }
  }

  Order.init({
    order_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    order_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    subtotal_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    shipping_fee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    discount_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    order_status: {
      type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED'),
      defaultValue: 'PENDING'
    },
    coupon_id: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['coupon_id'] }
    ]
  });

  return Order;
};
