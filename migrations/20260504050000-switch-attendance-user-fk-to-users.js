'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE attendance
      DROP CONSTRAINT IF EXISTS attendance_user_id_fkey;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE attendance
      ADD CONSTRAINT attendance_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(user_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE attendance
      DROP CONSTRAINT IF EXISTS attendance_user_id_fkey;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE attendance
      ADD CONSTRAINT attendance_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES staff_details(user_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE;
    `);
  },
};