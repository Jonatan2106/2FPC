require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });

module.exports = {
  development: {
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'Pole2108',
    database: process.env.DATABASE_NAME || '2FPC',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5433,
    dialect: process.env.DATABASE_DIALECT || 'postgres',
  },
};
