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
    tableName: "attendance",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
})
export class attendance extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    declare attendance_id: string;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare clock_in: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare clock_out: Date;

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