'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sizes', {
      size_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'S, M, L, XL, 39, 40...'
      },
      type: {
        type: Sequelize.ENUM('clothing', 'footwear', 'accessory'),
        allowNull: false,
        comment: 'Phân loại size cho quần áo hay giày dép'
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

    // Add unique constraint for (name, type)
    await queryInterface.addConstraint('Sizes', {
      fields: ['name', 'type'],
      type: 'unique',
      name: 'unique_size_name_type'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sizes');
  }
};
