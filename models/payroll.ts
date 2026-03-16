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
}