import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT || 5000,

  mongoUri: process.env.MONGO_URI,

  postgres: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  hashSecret: process.env.HASH_SECRET || "default_chain_secret",
};
