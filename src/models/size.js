'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Size extends Model {
        /**
         * Helper method for defining associations.
         */
        static associate(models) {
            // define association here
            Size.hasMany(models.ProductVariant, {
                foreignKey: 'size_id',
                as: 'variants'
            });
        }
    }
    Size.init({
        size_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        type: {
            type: DataTypes.ENUM('clothing', 'footwear', 'accessory'),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Size',
        tableName: 'Sizes',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
            {
                unique: true,
                fields: ['name', 'type']
            }
        ]
    });
    return Size;
};
