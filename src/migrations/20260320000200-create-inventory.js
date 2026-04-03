'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Inventories', {
      inventory_id: {
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
      on_hand: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reserved: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addConstraint('Inventories', {
      fields: ['warehouse_id', 'variant_id'],
      type: 'unique',
      name: 'unique_inventory_per_warehouse_variant'
    });

    await queryInterface.addIndex('Inventories', ['warehouse_id']);
    await queryInterface.addIndex('Inventories', ['variant_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Inventories');
  }
};
