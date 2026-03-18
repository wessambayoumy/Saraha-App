import { resolve } from "node:path";
import dotenv from "dotenv";
import { StringValue } from "ms";

const envFile = process.env.NODE_ENV === "prod" ? ".env.prod" : ".env.dev";

dotenv.config({ path: resolve("config/", envFile) });

export const env = {
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGO_URI as string,
  saltRounds: Number(process.env.SALT_ROUNDS),
  jwtExpiry: process.env.JWT_EXPIRY as StringValue,
  jwtAdminSecret: process.env.JWT_SIGNATURE_ADMIN as string,
  jwtUserSecret: process.env.JWT_SIGNATURE_USER as string,
  jwtIssuer: process.env.JWT_ISSUER as string,
  encryptionKey: process.env.ENCRYPTION_KEY as string,
  emailUser: process.env.EMAIL_USER as string,
  emailPass: process.env.EMAIL_PASS as string,
  emailSecret: process.env.EMAIL_SECRET as string,
  redisUri: process.env.REDIS_URI as string,
  rateLimitCount: Number(process.env.RATE_LIMIT_COUNT),
  rateLimitTime: Number(process.env.RATE_LIMIT_TIME),
  corsOrigins: process.env.CORS_ORIGINS?.split(",") as string[],
};
