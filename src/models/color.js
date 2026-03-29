'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Color extends Model {
        /**
         * Helper method for defining associations.
         */
        static associate(models) {
            // define association here
            Color.hasMany(models.ProductVariant, {
                foreignKey: 'color_id',
                as: 'variants'
            });
            Color.hasMany(models.ProductImage, {
                foreignKey: 'color_id',
                as: 'images'
            });
        }
    }
    Color.init({
        color_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        hex_code: {
            type: DataTypes.STRING(7),
            allowNull: true,
            validate: {
                is: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ // Simple hex validation
            }
        }
    }, {
        sequelize,
        modelName: 'Color',
        tableName: 'Colors',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
    });
    return Color;
};
