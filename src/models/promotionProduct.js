'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PromotionProduct extends Model {
        /**
         * Helper method for defining associations.
         */
        static associate(models) {
            // define association here
            PromotionProduct.belongsTo(models.Promotion, {
                foreignKey: 'promotion_id',
                as: 'promotion'
            });
            PromotionProduct.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
        }
    }
    PromotionProduct.init({
        promotion_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        product_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'PromotionProduct',
        tableName: 'PromotionProducts',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
    });
    return PromotionProduct;
};
