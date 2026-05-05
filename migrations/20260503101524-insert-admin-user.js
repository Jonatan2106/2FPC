'use strict';

import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid'; // Pastikan kamu punya library uuid atau ganti manual stringnya

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminData = [
        {
          user_id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Super Admin',
          email: 'super.admin@company.local',
          password: hashedPassword,
          type: 'Admin',
          salary: 15000000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          user_id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Admin Finance',
          email: 'finance.admin@company.local',
          password: hashedPassword,
          type: 'Admin',
          salary: 10000000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          user_id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Admin HR',
          email: 'hr.admin@company.local',
          password: hashedPassword,
          type: 'Admin',
          salary: 10000000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          user_id: '550e8400-e29b-41d4-a716-446655440004',
          name: 'Admin Operations',
          email: 'ops.admin@company.local',
          password: hashedPassword,
          type: 'Admin',
          salary: 9000000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          user_id: '550e8400-e29b-41d4-a716-446655440005',
          name: 'Admin IT Support',
          email: 'it.admin@company.local',
          password: hashedPassword,
          type: 'Admin',
          salary: 11000000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Cek satu per satu untuk menghindari duplikat email saat re-run migration
      for (const admin of adminData) {
        const [existingUser] = await queryInterface.sequelize.query(
          'SELECT * FROM users WHERE email = ?',
          { replacements: [admin.email], type: Sequelize.QueryTypes.SELECT }
        );

        if (!existingUser) {
          await queryInterface.bulkInsert('users', [admin]);
          console.log(`Admin ${admin.name} inserted successfully`);
        } else {
          console.log(`Admin with email ${admin.email} already exists, skipping...`);
        }
      }

    } catch (error) {
      console.error('Error inserting dummy admins:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Menghapus data berdasarkan daftar email dummy
    const emails = [
      'super.admin@company.local',
      'finance.admin@company.local',
      'hr.admin@company.local',
      'ops.admin@company.local',
      'it.admin@company.local'
    ];
    await queryInterface.bulkDelete('users', { email: emails });
  }
};