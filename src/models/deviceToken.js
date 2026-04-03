'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeviceToken extends Model {
    static associate(models) {
      DeviceToken.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  DeviceToken.init({
    device_token_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    platform: {
      type: DataTypes.ENUM('WEB', 'ANDROID', 'IOS'),
      defaultValue: 'WEB'
    },
    token: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'DeviceToken',
    tableName: 'DeviceTokens',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['user_id', 'token'] }
    ]
  });

  return DeviceToken;
};