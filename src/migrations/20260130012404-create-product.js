'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      product_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'category_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      material_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Materials',
          key: 'material_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Tên sản phẩm'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mô tả chi tiết'
      },
      base_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Giá gốc niêm yết (Java BigDecimal)'
      },
      gender: {
        type: Sequelize.ENUM('MALE', 'FEMALE', 'UNISEX'),
        allowNull: false,
        comment: 'Giới tính (Mapped to Java Enum)'
      },
      age_group: {
        type: Sequelize.ENUM('ADULT', 'TEEN', 'KID', 'BABY'),
        allowNull: false,
        comment: 'Độ tuổi'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};
