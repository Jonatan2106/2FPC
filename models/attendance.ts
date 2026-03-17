import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import { staff_detail } from "./staff_details";

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

    @ForeignKey(() => staff_detail)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    declare user_id: string;

    @BelongsTo(() => staff_detail, {
        foreignKey: "user_id", targetKey: "user_id"
    })
    declare staff_data: staff_detail;
}