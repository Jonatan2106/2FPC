'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staff_details', {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      QR: { 
        type: Sequelize.STRING 
      },
      role: { 
        type: Sequelize.ENUM('Manager', 'Staff'), 
        allowNull: false 
      },
      hire_date: { 
        type: Sequelize.DATE 
      },
      departement_id: {
        type: Sequelize.UUID,
        references: { model: 'departements', key: 'departement_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('staff_details'); 
  }
};