'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductVariants', {
      variant_id: {
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
        allowNull: false,
        references: {
          model: 'Colors',
          key: 'color_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      size_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Sizes',
          key: 'size_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      sku: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Mã kho duy nhất: AOTHUN-DO-M'
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'URL ảnh đại diện cho biến thể này'
      },
      original_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Giá gốc nhập vào (nếu khác base_price)'
      },
      price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Giá bán riêng của variant, nếu null thì dùng base_price'
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: { min: 0 },
        comment: 'Số lượng tồn kho thực tế'
      },
      weight: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Cân nặng (kg) để tính ship'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Trạng thái kinh doanh'
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

    // Indexes for optimization
    await queryInterface.addIndex('ProductVariants', ['product_id']);
    await queryInterface.addIndex('ProductVariants', ['sku']);

    await queryInterface.addConstraint('ProductVariants', {
      fields: ['product_id', 'color_id', 'size_id'],
      type: 'unique',
      name: 'unique_product_variant_combination'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProductVariants');
  }
};
