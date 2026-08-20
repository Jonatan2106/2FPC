'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Hapus kolom di departements
    await queryInterface.removeColumn('departements', 'password');
    await queryInterface.removeColumn('departements', 'address');
    await queryInterface.removeColumn('departements', 'website');
    await queryInterface.removeColumn('departements', 'logo_url');
    await queryInterface.removeColumn('departements', 'description');
    await queryInterface.removeColumn('departements', 'industry');

    // 2. Tambah kolom di payrolls
    await queryInterface.addColumn('payroll', 'generated_by', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.addColumn('payroll', 'paid_by', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Fungsi ini untuk mengembalikan (Undo) perubahan jika terjadi kesalahan
    await queryInterface.addColumn('departements', 'password', { type: Sequelize.STRING, allowNull: false, defaultValue: '123' });
    await queryInterface.addColumn('departements', 'address', { type: Sequelize.STRING });
    await queryInterface.addColumn('departements', 'website', { type: Sequelize.STRING });
    await queryInterface.addColumn('departements', 'logo_url', { type: Sequelize.STRING });
    await queryInterface.addColumn('departements', 'description', { type: Sequelize.TEXT });
    await queryInterface.addColumn('departements', 'industry', { type: Sequelize.STRING });

    await queryInterface.removeColumn('payrolls', 'generated_by');
    await queryInterface.removeColumn('payrolls', 'paid_by');
  }
};