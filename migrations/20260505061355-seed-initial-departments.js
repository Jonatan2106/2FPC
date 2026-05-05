'use strict';

import bcrypt from "bcrypt";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    try {
      const hashedPassword = await bcrypt.hash('dept123', 10);

      const departmentData = [
        {
          // UUID v4 yang valid
          departement_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          company_name: 'Information Technology',
          company_email: 'it@2fpc.local',
          password: hashedPassword,
          address: 'Gedung A, Lantai 4',
          website: 'https://it.2fpc.local',
          logo_url: 'https://placehold.co/200x200?text=IT+Dept',
          description: 'Technical support, development, and infrastructure.',
          industry: 'Technology',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          departement_id: 'b2b5f1f1-7c5c-4d5c-9c5c-5c5c5c5c5c5c',
          company_name: 'Human Resources',
          company_email: 'hr@2fpc.local',
          password: hashedPassword,
          address: 'Gedung A, Lantai 2',
          website: 'https://hr.2fpc.local',
          logo_url: 'https://placehold.co/200x200?text=HR+Dept',
          description: 'Recruitment, employee relations, and payroll.',
          industry: 'Human Resources',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          departement_id: 'c3c5f1f1-7c5c-4d5c-9c5c-5c5c5c5c5c5c',
          company_name: 'Finance & Accounting',
          company_email: 'finance@2fpc.local',
          password: hashedPassword,
          address: 'Gedung B, Lantai 1',
          website: 'https://finance.2fpc.local',
          logo_url: 'https://placehold.co/200x200?text=Finance',
          description: 'Financial planning, reporting, and budgeting.',
          industry: 'Finance',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      for (const dept of departmentData) {
        const [existingDept] = await queryInterface.sequelize.query(
          'SELECT * FROM departements WHERE company_email = ?',
          { replacements: [dept.company_email], type: Sequelize.QueryTypes.SELECT }
        );

        if (!existingDept) {
          await queryInterface.bulkInsert('departements', [dept]);
        }
      }
      console.log('Departments seeded successfully');
    } catch (error) {
      console.error('Error inserting dummy departments:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const ids = [
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'b2b5f1f1-7c5c-4d5c-9c5c-5c5c5c5c5c5c',
      'c3c5f1f1-7c5c-4d5c-9c5c-5c5c5c5c5c5c'
    ];
    await queryInterface.bulkDelete('departements', { departement_id: ids });
  }
};