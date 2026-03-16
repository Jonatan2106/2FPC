'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('penalty', {
      penalty_id: { 
        type: Sequelize.UUID, 
        primaryKey: true, 
        defaultValue: Sequelize.UUIDV4 
      },
      category: { 
        type: Sequelize.ENUM('unpaid_cuti', 'broken_stuff', 'late', 'other') 
      },
      note: { 
        type: Sequelize.STRING 
      },
      amount: { 
        type: Sequelize.INTEGER 
      },
      penaltyAt: { 
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
      }
    });
  },
  async down(queryInterface, Sequelize) { 
    await queryInterface.dropTable('penalty'); 
  }
};