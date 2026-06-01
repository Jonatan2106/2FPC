'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      name: { 
        type: Sequelize.STRING, 
        allowNull: false 
      },
      email: { 
        type: Sequelize.STRING, 
        allowNull: false, unique: true 
      },
      password: { 
        type: Sequelize.STRING, 
        allowNull: false 
      },
      alamat: { 
        type: Sequelize.STRING 
      },
      nomor_telepon: { 
        type: Sequelize.STRING 
      },
      type: { 
        type: Sequelize.ENUM('Admin', 'Staff'), 
        allowNull: false 

      },
      foto: { 
        type: Sequelize.TEXT, 
        allowNull: true 

      },
      salary: { 
        type: Sequelize.INTEGER 

      },
      qr_code: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      qr_expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      device_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      device_login_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: { 
        type: Sequelize.DATE, 
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 

      },
      updatedAt: { 
        type: Sequelize.DATE, 
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 
      }
    });
  },
  async down(queryInterface, Sequelize) { 
    await queryInterface.dropTable('users'); 
  }
};