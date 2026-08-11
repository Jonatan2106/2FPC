'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payroll', 'base_salary', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('payroll', 'total_penalty', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('payroll', 'total_reimburse', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('payroll', 'leave_deduction', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('payroll', 'payroll_period_key', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('payroll', 'payroll_period_label', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('payroll', 'payroll_period_start', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('payroll', 'payroll_period_end', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('payroll', 'payroll_cutoff_days', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('payroll', 'breakdown', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('payroll', 'breakdown');
    await queryInterface.removeColumn('payroll', 'payroll_cutoff_days');
    await queryInterface.removeColumn('payroll', 'payroll_period_end');
    await queryInterface.removeColumn('payroll', 'payroll_period_start');
    await queryInterface.removeColumn('payroll', 'payroll_period_label');
    await queryInterface.removeColumn('payroll', 'payroll_period_key');
    await queryInterface.removeColumn('payroll', 'leave_deduction');
    await queryInterface.removeColumn('payroll', 'total_reimburse');
    await queryInterface.removeColumn('payroll', 'total_penalty');
    await queryInterface.removeColumn('payroll', 'base_salary');
  }
};