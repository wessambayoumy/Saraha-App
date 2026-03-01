import { resolve } from "node:path";
import dotenv from "dotenv";
import { StringValue } from "ms";

const envFile = process.env.NODE_ENV === "prod" ? ".env.prod" : ".env.dev";

dotenv.config({ path: resolve("src/config/", envFile) });

export const env = {
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGO_URI as string,
  saltRounds: Number(process.env.SALT_ROUNDS),
  jwtExpiry: process.env.JWT_EXPIRY as StringValue,
  jwtAdminSecret: process.env.JWT_SIGNATURE_ADMIN as string,
  jwtUserSecret: process.env.JWT_SIGNATURE_USER as string,
  jwtIssuer: process.env.JWT_ISSUER as string,
  encryptionKey: process.env.ENCRYPTION_KEY as string,
};
