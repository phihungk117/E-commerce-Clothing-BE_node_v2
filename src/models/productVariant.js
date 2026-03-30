'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ProductVariant extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ProductVariant.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
            ProductVariant.belongsTo(models.Color, {
                foreignKey: 'color_id',
                as: 'color'
            });
            ProductVariant.belongsTo(models.Size, {
                foreignKey: 'size_id',
                as: 'size'
            });
            ProductVariant.hasMany(models.CartItem, {
                foreignKey: 'variant_id',
                as: 'cartItems'
            });
            ProductVariant.hasMany(models.OrderItem, {
                foreignKey: 'variant_id',
                as: 'orderItems'
            });
            ProductVariant.hasMany(models.Inventory, {
                foreignKey: 'variant_id',
                as: 'inventories'
            });
            ProductVariant.hasMany(models.StockMovement, {
                foreignKey: 'variant_id',
                as: 'stockMovements'
            });
        }
    }
    ProductVariant.init({
        variant_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        color_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        size_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        sku: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isUrl: true
            }
        },
        original_price: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            validate: { min: 0 }
        },
        price: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            validate: { min: 0 }
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: { min: 0 }
        },
        weight: {
            type: DataTypes.FLOAT,
            allowNull: true,
            validate: { min: 0 }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'ProductVariant',
        tableName: 'ProductVariants',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
            {
                unique: true,
                fields: ['sku']
            },
            {
                name: 'product_variant_unique',
                unique: true,
                fields: ['product_id', 'color_id', 'size_id']
            }
        ]
    });
    return ProductVariant;
};