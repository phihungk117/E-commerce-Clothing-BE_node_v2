'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(models) {
      Wishlist.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Wishlist.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }

  Wishlist.init({
    wishlist_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Wishlist',
    tableName: 'Wishlists',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { unique: true, fields: ['user_id', 'product_id'] }
    ]
  });

  return Wishlist;
};