'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leaveManagement', {
      leave_id: { 
        type: Sequelize.UUID, 
        primaryKey: true, 
        defaultValue: Sequelize.UUIDV4 
      },
      cuti: { 
        type: Sequelize.BOOLEAN, 
        defaultValue: false 
      },
      reason: { 
        type: Sequelize.STRING 
      },
      approvedAt: { 
        type: Sequelize.DATE 
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('leaveManagement'); 
  }
};