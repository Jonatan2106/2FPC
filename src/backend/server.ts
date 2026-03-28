import app from "./app";
import { sequelize } from "./config/sequelize";

const port = Number(process.env.PORT || 8080);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend", error);
    process.exit(1);
  }
};

void startServer();
