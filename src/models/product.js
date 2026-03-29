'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Product.belongsTo(models.Category, {
                foreignKey: 'category_id',
                as: 'category'
            });
            Product.belongsTo(models.Material, {
                foreignKey: 'material_id',
                as: 'material'
            });
            Product.hasMany(models.ProductVariant, {
                foreignKey: 'product_id',
                as: 'variants'
            });
            Product.hasMany(models.ProductImage, {
                foreignKey: 'product_id',
                as: 'images'
            });
            Product.belongsToMany(models.Usage, {
                through: models.ProductUsage,
                foreignKey: 'product_id',
                otherKey: 'usage_id',
                as: 'usages'
            });
            Product.belongsToMany(models.Promotion, {
                through: models.PromotionProduct,
                foreignKey: 'product_id',
                otherKey: 'promotion_id',
                as: 'promotions'
            });
            Product.hasMany(models.Review, {
                foreignKey: 'product_id',
                as: 'reviews'
            });
            Product.hasMany(models.Wishlist, {
                foreignKey: 'product_id',
                as: 'wishlists'
            });
        }
    }
    Product.init({
        product_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        category_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        material_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Tên sản phẩm',
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Mô tả chi tiết'
        },
        base_price: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            comment: 'Giá gốc niêm yết',
            validate: {
                min: 0
            }
        },
        gender: {
            type: DataTypes.ENUM('MALE', 'FEMALE', 'UNISEX'),
            allowNull: false,
            comment: 'Giới tính'
        },
        age_group: {
            type: DataTypes.ENUM('ADULT', 'TEEN', 'KID', 'BABY'),
            allowNull: false,
            comment: 'Độ tuổi'
        }
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'Products',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    });
    return Product;
};