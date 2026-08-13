'use strict';

import { randomUUID } from "crypto";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const now = new Date();

      const targetUsers = [
        'd13b7400-e29b-41d4-a716-446655441002',
        'd13b7400-e29b-41d4-a716-446655441003',
        'd13b7400-e29b-41d4-a716-446655441006',
        'd13b7400-e29b-41d4-a716-446655441007',
        'd13b7400-e29b-41d4-a716-446655441010',
        'd13b7400-e29b-41d4-a716-446655441011'
      ];

      const reimburseData = [];
      const leaveData = [];
      const penaltyData = [];

      for (let i = 0; i < targetUsers.length; i++) {
        const uid = targetUsers[i];

        reimburseData.push({
          reimburse_id: randomUUID(),
          approve: i % 2 === 0,
          amount: (i + 1) * 100000 + 50000,
          evidence: `receipt_${i + 1}.jpg`,
          approvedAt: i % 2 === 0 ? now : null,
          user_id: uid,
          createdAt: now,
          updatedAt: now
        });

        leaveData.push({
          leave_id: randomUUID(),
          cuti: i % 2 === 1,
          reason: i % 2 === 1 ? 'Medical leave' : 'Personal leave',
          approvedAt: i % 2 === 1 ? now : null,
          user_id: uid,
          createdAt: now,
          updatedAt: now
        });

        penaltyData.push({
          penalty_id: randomUUID(),
          category: i % 3 === 1 ? 'broken_stuff' : 'other',
          note: `Auto-generated penalty #${i + 1}`,
          amount: (i + 1) * 25000,
          penaltyAt: now,
          user_id: uid,
          createdAt: now
        });
      }

      await queryInterface.bulkInsert('reimburse', reimburseData, { transaction });
      await queryInterface.bulkInsert('leaveManagement', leaveData, { transaction });
      await queryInterface.bulkInsert('penalty', penaltyData, { transaction });

      await transaction.commit();
      console.log('Dummy reimburse/leave/penalty inserted for selected staff');
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Error inserting dummy extras:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const targetUsers = [
      'd13b7400-e29b-41d4-a716-446655441002',
      'd13b7400-e29b-41d4-a716-446655441003',
      'd13b7400-e29b-41d4-a716-446655441006',
      'd13b7400-e29b-41d4-a716-446655441007',
      'd13b7400-e29b-41d4-a716-446655441010',
      'd13b7400-e29b-41d4-a716-446655441011'
    ];

    await queryInterface.bulkDelete('reimburse', { user_id: targetUsers });
    await queryInterface.bulkDelete('leaveManagement', { user_id: targetUsers });
    await queryInterface.bulkDelete('penalty', { user_id: targetUsers });
  }
};