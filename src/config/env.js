import dotenv from "dotenv";
dotenv.config(); // Load .env BEFORE reading anything

export const env = {
  port: process.env.PORT || 4000,

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

  allowSuperadminRegistration:
    process.env.ALLOW_SUPERADMIN_REGISTRATION || "false",

  setupKey: process.env.SETUP_KEY || null
};

console.log("DEBUG MONGO URI:", process.env.MONGO_URI);
