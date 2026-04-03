'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Coupon extends Model {
        /**
         * Helper method for defining associations.
         */
        static associate(models) {
            // define association here
            Coupon.hasMany(models.CouponUsage, {
                foreignKey: 'coupon_id',
                as: 'usages'
            });
            Coupon.hasMany(models.Order, {
                foreignKey: 'coupon_id',
                as: 'orders'
            });
        }
    }
    Coupon.init({
        coupon_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        discount_type: {
            type: DataTypes.ENUM('percentage', 'fixed_amount'),
            allowNull: false
        },
        discount_value: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            validate: { min: 0 }
        },
        min_order_value: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            validate: { min: 0 }
        },
        max_discount_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            validate: { min: 0 }
        },
        usage_limit: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: { min: 0 }
        },
        usage_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: { min: 0 }
        },
        per_user_limit: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            validate: { min: 1 }
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Coupon',
        tableName: 'Coupons',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
    });
    return Coupon;
};
