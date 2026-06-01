'use strict';

import bcrypt from "bcrypt";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const hashedPassword = await bcrypt.hash('staff123', 10);

      const departmentSeeds = [
        {
          departement_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          departmentCode: 'IT',
          manager: {
            user_id: 'd13b7400-e29b-41d4-a716-446655441001',
            name: 'Anita Pratama',
            email: 'anita.pratama@2fpc.local',
            salary: 8500000
          },
          staff: [
            {
              user_id: 'd13b7400-e29b-41d4-a716-446655441002',
              name: 'Dimas Wicaksono',
              email: 'dimas.wicaksono@2fpc.local',
              salary: 5500000
            },
            {
              user_id: 'd13b7400-e29b-41d4-a716-446655441003',
              name: 'Rina Setiawan',
              email: 'rina.setiawan@2fpc.local',
              salary: 5600000
            },
            {
              user_id: 'd13b7400-e29b-41d4-a716-446655441004',
              name: 'Farhan Akbar',
              email: 'farhan.akbar@2fpc.local',
              salary: 5400000
            }
          ]
        },
        {
          departement_id: 'b2b5f1f1-7c5c-4d5c-9c5c-5c5c5c5c5c5c',
          departmentCode: 'HR',
          manager: {
            user_id: 'd13b7400-e29b-41d4-a716-446655441005',
            name: 'Sari Dewi',
            email: 'sari.dewi@2fpc.local',
            salary: 8300000
          },
          staff: [
            {
              user_id: 'd13b7400-e29b-41d4-a716-446655441006',
              name: 'Nabila Putri',
              email: 'nabila.putri@2fpc.local',
              salary: 5200000
            },
            {
              user_id: 'd13b7400-e29b-41d4-a716-446655441007',
              name: 'Yusuf Hidayat',
              email: 'yusuf.hidayat@2fpc.local',
              salary: 5100000
            },
            {
              user_id: 'd13b7400-e29b-41d4-a716-446655441008',
              name: 'Clara Anjani',
              email: 'clara.anjani@2fpc.local',
              salary: 5300000
            }
          ]
        },
        {
          departement_id: 'c3c5f1f1-7c5c-4d5c-9c5c-5c5c5c5c5c5c',
          departmentCode: 'FIN',
          manager: {
            user_id: 'd13b7400-e29b-41d4-a716-446655441009',
            name: 'Andi Kurniawan',
            email: 'andi.kurniawan@2fpc.local',
            salary: 8800000
          },
          staff: [
            {
              user_id: 'd13b7400-e29b-41d4-a716-446655441010',
              name: 'Monica Salim',
              email: 'monica.salim@2fpc.local',
              salary: 5700000
            },
            {
              user_id: 'd13b7400-e29b-41d4-a716-446655441011',
              name: 'Arif Ramadhan',
              email: 'arif.ramadhan@2fpc.local',
              salary: 5600000
            },
            {
              user_id: 'd13b7400-e29b-41d4-a716-446655441012',
              name: 'Tania Maharani',
              email: 'tania.maharani@2fpc.local',
              salary: 5500000
            }
          ]
        }
      ];

      const now = new Date();
      const userData = departmentSeeds.flatMap((departmentSeed) => [
        {
          user_id: departmentSeed.manager.user_id,
          name: departmentSeed.manager.name,
          email: departmentSeed.manager.email,
          password: hashedPassword,
          type: 'Staff',
          salary: departmentSeed.manager.salary,
          createdAt: now,
          updatedAt: now
        },
        ...departmentSeed.staff.map((staffMember) => ({
          user_id: staffMember.user_id,
          name: staffMember.name,
          email: staffMember.email,
          password: hashedPassword,
          type: 'Staff',
          salary: staffMember.salary,
          createdAt: now,
          updatedAt: now
        }))
      ]);

      const staffData = departmentSeeds.flatMap((departmentSeed) => [
        {
          user_id: departmentSeed.manager.user_id,
          // name and departement_name will be stored in staff_details for easier display
          name: departmentSeed.manager.name,
          departement_name: departmentSeed.departmentCode,
          hire_date: now,
          role: 'Manager',
          departement_id: departmentSeed.departement_id,
          createdAt: now,
          updatedAt: now
        },
        ...departmentSeed.staff.map((staffMember, index) => ({
          user_id: staffMember.user_id,
          name: staffMember.name,
          departement_name: departmentSeed.departmentCode,
          hire_date: now,
          role: 'Staff',
          departement_id: departmentSeed.departement_id,
          createdAt: now,
          updatedAt: now
        }))
      ]);

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
      'd13b7400-e29b-41d4-a716-446655441001',
      'd13b7400-e29b-41d4-a716-446655441002',
      'd13b7400-e29b-41d4-a716-446655441003',
      'd13b7400-e29b-41d4-a716-446655441004',
      'd13b7400-e29b-41d4-a716-446655441005',
      'd13b7400-e29b-41d4-a716-446655441006',
      'd13b7400-e29b-41d4-a716-446655441007',
      'd13b7400-e29b-41d4-a716-446655441008',
      'd13b7400-e29b-41d4-a716-446655441009',
      'd13b7400-e29b-41d4-a716-446655441010',
      'd13b7400-e29b-41d4-a716-446655441011',
      'd13b7400-e29b-41d4-a716-446655441012'
    ];
    await queryInterface.bulkDelete('staff_details', { user_id: userIds });
    await queryInterface.bulkDelete('users', { user_id: userIds });
  }
};