import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
    tableName: "users",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
})
export class user extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    declare user_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare password: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare alamat: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare nomor_telepon: string;

    @Column({
        type: DataType.ENUM("Admin", "Staff"),
        allowNull: false
    })
    declare type: "Admin" | "Staff";

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare foto: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    declare salary: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        comment: 'Unique QR code for the user (changes daily)'
    })
    declare qr_code: string | null;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        comment: 'Timestamp when QR expires'
    })
    declare qr_expires_at: Date | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        comment: 'Device identifier (phone IMEI or generated ID)'
    })
    declare device_id: string | null;

    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
        comment: 'Date when device logged in'
    })
    declare device_login_date: string | null;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        comment: 'Last login timestamp'
    })
    declare last_login_at: Date | null;
}