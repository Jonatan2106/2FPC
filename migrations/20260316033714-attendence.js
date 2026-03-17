'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendance', {
      attendance_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      clock_in: { 
        type: Sequelize.DATE 
      },
      clock_out: { 
        type: Sequelize.DATE 
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'staff_details', key: 'user_id' },
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
    await queryInterface.dropTable('attendance'); 
  }
};