'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Promotion extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Promotion.belongsToMany(models.Product, {
                through: models.PromotionProduct,
                foreignKey: 'promotion_id',
                otherKey: 'product_id',
                as: 'products'
            });
        }
    }
    Promotion.init({
        promotion_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        discount_type: {
            type: DataTypes.ENUM('percentage', 'fixed_amount'),
            allowNull: false
        },
        discount_value: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            validate: {
                min: 0
            }
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
        modelName: 'Promotion',
        tableName: 'Promotions',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
    });
    return Promotion;
};
