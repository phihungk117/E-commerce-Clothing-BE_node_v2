'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Address, { foreignKey: 'user_id', as: 'addresses' });
      User.hasMany(models.CouponUsage, { foreignKey: 'user_id', as: 'couponUsages' });
      User.hasOne(models.Cart, { foreignKey: 'user_id', as: 'cart' });
      User.hasMany(models.Order, { foreignKey: 'user_id', as: 'orders' });
    }
  }
  User.init({
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone_number: {
      type: DataTypes.STRING(15),
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: true
    },
    auth_provider: {
      type: DataTypes.STRING(50),
      defaultValue: 'local'
    },
    auth_provider_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    avatar_url: DataTypes.TEXT,
    gender: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    date_of_birth: DataTypes.DATEONLY,
    preferences: DataTypes.JSON,
    loyalty_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tier_level: {
      type: DataTypes.ENUM('BRONZE', 'SILVER', 'GOLD', 'DIAMOND'),
      defaultValue: 'BRONZE'
    },
    role: {
      type: DataTypes.ENUM('CUSTOMER', 'ADMIN', 'STAFF'),
      defaultValue: 'CUSTOMER'
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'BANNED', 'PENDING'),
      defaultValue: 'ACTIVE'
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    last_login_at: DataTypes.DATE,
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email_verification_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email_verification_expires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users', // Force table name to match migration
    underscored: true, // This will automatically map updatedAt to updated_at and createdAt to created_at
    timestamps: true,
    paranoid: true, // Enable soft delete
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at' // Map deletedAt to snake_case column
  });
  return User;
};
