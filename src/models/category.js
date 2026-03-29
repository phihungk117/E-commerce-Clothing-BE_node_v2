'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Category.hasMany(models.Category, {
                as: 'children',
                foreignKey: 'parent_id'
            });
            Category.belongsTo(models.Category, {
                as: 'parent',
                foreignKey: 'parent_id'
            });
            Category.hasMany(models.Product, {
                foreignKey: 'category_id',
                as: 'products'
            });
        }
    }
    Category.init({
        category_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        slug: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        parent_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Category',
        tableName: 'Categories',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
    });
    return Category;
};