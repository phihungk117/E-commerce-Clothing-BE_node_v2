'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Cart, {
        foreignKey: 'cart_id',
        as: 'cart'
      });
      CartItem.belongsTo(models.ProductVariant, {
        foreignKey: 'variant_id',
        as: 'variant'
      });
    }
  }

  CartItem.init({
    cart_item_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    cart_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 }
    }
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'CartItems',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        unique: true,
        fields: ['cart_id', 'variant_id'],
        name: 'unique_cart_variant'
      }
    ]
  });

  return CartItem;
};
