import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import { user } from "./user";

@Table({
    tableName: "payroll",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
})
export class payroll extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    declare payroll_id: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    declare total_income: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    declare base_salary: number | null;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    declare total_penalty: number | null;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    declare total_reimburse: number | null;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    declare leave_deduction: number | null;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare payroll_period_key: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare payroll_period_label: string | null;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare payroll_period_start: Date | null;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare payroll_period_end: Date | null;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    declare payroll_cutoff_days: number | null;

    @Column({
        type: DataType.JSONB,
        allowNull: true
    })
    declare breakdown: unknown;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare paidAt: Date;

    @ForeignKey(() => user)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    declare user_id: string;

    @BelongsTo(() => user, {
        foreignKey: "user_id", targetKey: "user_id"
    })
    declare user_data: user;

    @ForeignKey(() => user) // Asumsi nama model user Anda adalah User
    @Column({ type: DataType.UUID, allowNull: true })
    declare generated_by: string | null;

    @ForeignKey(() => user)
    @Column({ type: DataType.UUID, allowNull: true })
    declare paid_by: string | null;

    // Definisikan relasinya (Alias)
    @BelongsTo(() => user, 'generated_by')
    declare generator: user;

    @BelongsTo(() => user, 'paid_by')
    declare payer: user;
}