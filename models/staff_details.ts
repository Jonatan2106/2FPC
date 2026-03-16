import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { user } from "./user";
import { departement } from "./Departements";

@Table({
  tableName: "staff_details",
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: "updatedAt",
})
export class staff_detail extends Model {
  @ForeignKey(() => user)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  declare user_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare QR: string;

  @Column({
    type: DataType.ENUM("Manager", "Staff"),
    allowNull: false
  })
  declare role: "Manager" | "Staff";

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare hire_date: Date;

  @ForeignKey(() => departement)
  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  declare departement_id: string;

  @BelongsTo(() => user, {
    foreignKey: "user_id",
    targetKey: "user_id"

  })
  declare user_data: user;

  @BelongsTo(() => departement, {
    foreignKey: "departement_id",
    targetKey: "departement_id"

  })
  declare departement_data: departement;
}