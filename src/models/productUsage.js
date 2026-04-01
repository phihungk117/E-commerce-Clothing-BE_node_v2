'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ProductUsage extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ProductUsage.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
            ProductUsage.belongsTo(models.Usage, {
                foreignKey: 'usage_id',
                as: 'usage'
            });
        }
    }
    ProductUsage.init({
        product_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        usage_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'ProductUsage',
        tableName: 'ProductUsages',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
    });
    return ProductUsage;
};
