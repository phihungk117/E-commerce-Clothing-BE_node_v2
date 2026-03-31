'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Promotions', {
            promotion_id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
                comment: 'Tên CT: Sale Giáng Sinh, Xả kho...'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            discount_type: {
                type: Sequelize.ENUM('percentage', 'fixed_amount'),
                allowNull: false,
                comment: 'Giảm theo % hay số tiền cố định'
            },
            discount_value: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                comment: 'Giá trị giảm (Vd: 20 là 20%, 50000 là 50k)'
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                comment: 'Tắt mở chương trình thủ công'
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
        await queryInterface.dropTable('Promotions');
    }
};
