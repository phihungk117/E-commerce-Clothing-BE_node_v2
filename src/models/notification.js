'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  Notification.init({
    notification_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('ORDER', 'PROMOTION', 'SYSTEM', 'REVIEW'),
      defaultValue: 'SYSTEM'
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'Notifications',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['user_id', 'is_read'] }
    ]
  });

  return Notification;
};