'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
    }
  }

  Payment.init({
    payment_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    payment_method: {
      type: DataTypes.ENUM('COD', 'VNPAY'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    payment_status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'),
      defaultValue: 'PENDING'
    },
    transaction_code: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    payment_time: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['order_id'] }
    ]
  });

  return Payment;
};
