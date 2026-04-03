module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      user_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      phone_number: {
        type: Sequelize.STRING(15),
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: true // Nullable for social login users
      },
      auth_provider: {
        type: Sequelize.STRING(50),
        defaultValue: 'local' // local, google, facebook
      },
      auth_provider_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      avatar_url: {
        type: Sequelize.TEXT
      },
      gender: {
        type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER')
      },
      date_of_birth: {
        type: Sequelize.DATEONLY
      },
      preferences: {
        type: Sequelize.JSON
        // Example: {"size": "M", "style": "vintage", "height": 170, "weight": 60}
      },
      loyalty_points: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      tier_level: {
        type: Sequelize.ENUM('BRONZE', 'SILVER', 'GOLD', 'DIAMOND'), // Changed to ENUM for better control, or kept as String if flexible
        defaultValue: 'BRONZE'
      },
      role: {
        type: Sequelize.ENUM('CUSTOMER', 'ADMIN', 'STAFF'),
        defaultValue: 'CUSTOMER'
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'BANNED', 'PENDING'),
        defaultValue: 'ACTIVE'
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      last_login_at: {
        type: Sequelize.DATE
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};