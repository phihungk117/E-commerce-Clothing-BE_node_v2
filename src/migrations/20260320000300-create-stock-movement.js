'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('StockMovements', {
      movement_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      warehouse_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Warehouses',
          key: 'warehouse_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      variant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ProductVariants',
          key: 'variant_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      movement_type: {
        type: Sequelize.ENUM('IN', 'OUT', 'ADJUST', 'RESERVE', 'RELEASE', 'RETURN'),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reference_type: {
        type: Sequelize.ENUM('ORDER', 'PURCHASE', 'RETURN', 'MANUAL'),
        allowNull: true
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('StockMovements', ['warehouse_id']);
    await queryInterface.addIndex('StockMovements', ['variant_id']);
    await queryInterface.addIndex('StockMovements', ['reference_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('StockMovements');
  }
};
