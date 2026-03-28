import "reflect-metadata";
import { Sequelize } from "sequelize-typescript";
import { attendance } from "../../../models/attendance";
import { departement } from "../../../models/departements";
import { leave_management } from "../../../models/leave_management";
import { payroll } from "../../../models/payroll";
import { penalty } from "../../../models/penalty";
import { reimburse } from "../../../models/reimburse";
import { staff_detail } from "../../../models/staff_details";
import { user } from "../../../models/user";

const databaseUrl = process.env.DATABASE_URL;

export const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: "postgres",
      logging: false,
      models: [attendance, departement, leave_management, payroll, penalty, reimburse, staff_detail, user],
      dialectOptions:
        process.env.DB_SSL === "true"
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            }
          : undefined,
    })
  : new Sequelize({
      database: process.env.DB_NAME || "postgres",
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASS || "postgres",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      dialect: "postgres",
      logging: false,
      models: [attendance, departement, leave_management, payroll, penalty, reimburse, staff_detail, user],
    });
