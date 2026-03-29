'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CouponUsage extends Model {
        /**
         * Helper method for defining associations.
         */
        static associate(models) {
            // define association here
            CouponUsage.belongsTo(models.Coupon, {
                foreignKey: 'coupon_id',
                as: 'coupon'
            });
            CouponUsage.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }
    CouponUsage.init({
        usage_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        coupon_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        discount_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            validate: { min: 0 }
        },
        used_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'CouponUsage',
        tableName: 'CouponUsages',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
    });
    return CouponUsage;
};
