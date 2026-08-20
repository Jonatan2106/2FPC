import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "departements",
    timestamps: true,
    underscored: true
})
export class departement extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    declare departement_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare company_name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    declare company_email: string;
}