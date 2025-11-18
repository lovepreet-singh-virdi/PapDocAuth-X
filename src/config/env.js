import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 4000,

  MONGO_URI: process.env.MONGO_URI,

  SQL_DIALECT: process.env.SQL_DIALECT,
  SQL_HOST: process.env.SQL_HOST,
  SQL_PORT: process.env.SQL_PORT,
  SQL_DB: process.env.SQL_DB,
  SQL_USER: process.env.SQL_USER,
  SQL_PASS: process.env.SQL_PASS,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  HASH_SECRET: process.env.HASH_SECRET,

  FRONTEND_URL: process.env.FRONTEND_URL
};
