'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductImages', {
      image_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'product_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      color_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Colors',
          key: 'color_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      alt_text: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Mô tả ảnh cho SEO'
      },
      is_thumbnail: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    // Indexes
    await queryInterface.addIndex('ProductImages', ['product_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProductImages');
  }
};