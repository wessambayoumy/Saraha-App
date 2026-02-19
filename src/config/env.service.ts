import { resolve } from "node:path";
import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "prod" ? ".env.prod" : ".env.dev";

dotenv.config({ path: resolve("src/config/", envFile) });

export const env = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGO_URI as string,
  saltRounds: Number(process.env.SALT_ROUNDS ?? 12),
  jwtExpiry: Number(process.env.JWT_EXPIRY ?? 60 * 60 * 24 * 7),
  jwtSecret: process.env.JWT_SECRET as string,
  encryptionKey: process.env.ENCRYPTION_KEY as string,
};
