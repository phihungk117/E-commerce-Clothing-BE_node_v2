'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Cart.hasMany(models.CartItem, {
        foreignKey: 'cart_id',
        as: 'items'
      });
      Cart.belongsTo(models.Coupon, {
        foreignKey: 'coupon_id',
        as: 'coupon'
      });
    }
  }

  Cart.init({
    cart_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      unique: true
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    coupon_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Coupons',
        key: 'coupon_id'
      }
    }
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'Carts',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return Cart;
};
