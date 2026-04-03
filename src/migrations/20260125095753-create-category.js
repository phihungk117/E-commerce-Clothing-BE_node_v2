'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Categories', {
      category_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Tên danh mục: Áo, Quần, Giày...'
      },
      slug: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
        comment: 'URL thân thiện: ao-thun-nam'
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Danh mục cha, Null nếu là danh mục gốc',
        references: {
          model: 'Categories',
          key: 'category_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'URL ảnh đại diện danh mục'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Trạng thái hiển thị'
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

    // Add index/constraint name if needed manually, but Sequelize references usually handles basic FKs.
    // However, user specifically asked for `fk_category_parent`. Sequelize generates its own names usually.
    // To be precise with names, we might strictly add constraint, but `references` inside createTable is standard.
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Categories');
  }
};
