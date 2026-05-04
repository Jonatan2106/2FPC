'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'admin',
      email: 'admin@company.local',
      password: 'admin123',
      type: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('users', [{
      user_id: '550e8400-e29b-41d4-a716-446655441233',
      name: 'admin1',
      email: 'admin1@company.local',
      password: 'admin1234',
      type: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { name: 'admin' });
    await queryInterface.bulkDelete('users', { name: 'admin1' });
  }
};
