import app from "./app";
import { sequelize } from "./config/sequelize";
import path from "path";


const port = Number(process.env.PORT || 8080);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    console.log("DB NAME:", process.env.DATABASE_NAME);
    console.log("DB HOST:", process.env.DATABASE_HOST);

    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend", error);
    process.exit(1);
  }
};

void startServer();
