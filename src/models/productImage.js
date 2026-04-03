'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ProductImage extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ProductImage.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
            ProductImage.belongsTo(models.Color, {
                foreignKey: 'color_id',
                as: 'color'
            });
        }
    }
    ProductImage.init({
        image_id: {
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
            allowNull: true
        },
        image_url: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                isUrl: true
            }
        },
        alt_text: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        is_thumbnail: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        sort_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'ProductImage',
        tableName: 'ProductImages',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
    });
    return ProductImage;
};
