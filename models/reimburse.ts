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
    tableName: "reimburse",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
})
export class reimburse extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    declare reimburse_id: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
        allowNull: true
    })
    declare approve: boolean;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    })
    declare amount: number;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare approvedAt: Date;

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