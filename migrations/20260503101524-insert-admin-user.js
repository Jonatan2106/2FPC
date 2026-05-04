'use strict';

import bcrypt from "bcrypt";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    try {
      const existingAdmin = await queryInterface.sequelize.query(
        'SELECT * FROM users WHERE email = ?',
        { replacements: ['admin@company.local'], type: Sequelize.QueryTypes.SELECT }
      );

      if (existingAdmin.length === 0) {
        // 🔐 hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await queryInterface.bulkInsert('users', [{
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'admin',
          email: 'admin@company.local',
          password: hashedPassword,
          type: 'Admin',
          createdAt: new Date(),
          updatedAt: new Date()
        }]);

        console.log('Admin user inserted successfully');
      } else {
        console.log('Admin user already exists');
      }
    } catch (error) {
      console.error('Error inserting admin user:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { name: 'admin' });
  }
};