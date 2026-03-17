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
    tableName: "penalty",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
})
export class penalty extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    declare penalty_id: string;

    @Column({
        type: DataType.ENUM("unpaid_cuti", "broken_stuff", "late", "other"),
        allowNull: true,
    })
    declare category: "unpaid_cuti" | "broken_stuff" | "late" | "other";

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare note: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    declare amount: number;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare penaltyAt: Date;

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
