import app from "./app";
import { sequelize } from "./config/sequelize";

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    app.listen(port, host, () => {
      console.log(`Backend running on http://${host}:${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend", error);
    process.exit(1);
  }
};

void startServer();
