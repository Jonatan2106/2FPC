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
  tableName: "leaveManagement",
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: "updatedAt",
})
export class leave_management extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  declare leave_id: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true
  })
  declare cuti: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare reason: string;

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
