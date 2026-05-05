'use strict';

import bcrypt from "bcrypt";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const hashedPassword = await bcrypt.hash('staff123', 10);
      
      // 1. Data untuk tabel 'users' menggunakan valid UUID
      const userData = [
        {
          user_id: 'd13b7400-e29b-41d4-a716-446655440001',
          name: 'Budi Santoso',
          email: 'budi@company.local',
          password: hashedPassword,
          type: 'Staff',
          salary: 5000000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          user_id: 'd13b7400-e29b-41d4-a716-446655440002',
          name: 'Siti Aminah',
          email: 'siti@company.local',
          password: hashedPassword,
          type: 'Staff',
          salary: 7000000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // 2. Data untuk tabel 'staff_details' 
      // department_id disesuaikan dengan UUID Departemen IT dan HR yang tadi berhasil di-migrate
      const staffData = [
        {
          user_id: 'd13b7400-e29b-41d4-a716-446655440001',
          QR: 'QR_BUDI_001',
          hire_date: new Date(),
          role: 'Staff',
          departement_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // IT
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          user_id: 'd13b7400-e29b-41d4-a716-446655440002',
          QR: 'QR_SITI_002',
          hire_date: new Date(),
          role: 'Manager',
          departement_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // HR
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await queryInterface.bulkInsert('users', userData, { transaction });
      await queryInterface.bulkInsert('staff_details', staffData, { transaction });

      await transaction.commit();
      console.log('Staff users and profiles inserted successfully');
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Error inserting staff data:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const userIds = [
      'd13b7400-e29b-41d4-a716-446655440001', 
      'd13b7400-e29b-41d4-a716-446655440002'
    ];
    await queryInterface.bulkDelete('staff_details', { user_id: userIds });
    await queryInterface.bulkDelete('users', { user_id: userIds });
  }
};