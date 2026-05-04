'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { name: 'admin' });
  }
};
