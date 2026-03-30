'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Coupons', {
            coupon_id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            code: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true,
                comment: 'Mã nhập: TET2025, FREESHIP...'
            },
            description: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            discount_type: {
                type: Sequelize.ENUM('percentage', 'fixed_amount'),
                allowNull: false
            },
            discount_value: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            min_order_value: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0,
                comment: 'Giá trị đơn hàng tối thiểu để dùng mã'
            },
            max_discount_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
                comment: 'Giảm tối đa (quan trọng với mã %)'
            },
            usage_limit: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                comment: 'Tổng số lần mã có thể dùng (Toàn hệ thống)'
            },
            usage_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                comment: 'Số lần đã dùng thực tế'
            },
            per_user_limit: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
                comment: 'Mỗi user được dùng bao nhiêu lần'
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
                defaultValue: true
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
        await queryInterface.dropTable('Coupons');
    }
};
