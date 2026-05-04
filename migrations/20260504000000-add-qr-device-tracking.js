'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'qr_code', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      comment: 'Unique QR code for the user (changes daily)'
    });

    await queryInterface.addColumn('users', 'qr_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when QR expires (reset at 00:00)'
    });

    await queryInterface.addColumn('users', 'device_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Device identifier (phone IMEI or generated ID)'
    });

    await queryInterface.addColumn('users', 'device_login_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: 'Date when device logged in (for preventing multi-account login)'
    });

    await queryInterface.addColumn('users', 'last_login_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Last login timestamp'
    });

    // Create index for faster QR lookups
    await queryInterface.addIndex('users', ['qr_code']);
    await queryInterface.addIndex('users', ['device_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', ['device_id']);
    await queryInterface.removeIndex('users', ['qr_code']);
    
    await queryInterface.removeColumn('users', 'last_login_at');
    await queryInterface.removeColumn('users', 'device_login_date');
    await queryInterface.removeColumn('users', 'device_id');
    await queryInterface.removeColumn('users', 'qr_expires_at');
    await queryInterface.removeColumn('users', 'qr_code');
  }
};
