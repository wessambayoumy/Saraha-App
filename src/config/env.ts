import "dotenv/config";

//Deployed for learning purposes

export const env = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGO_URI as string,
  saltRounds: Number(process.env.SALT_ROUNDS ?? 12),
  jwtExpiry: Number(process.env.JWT_EXPIRY ?? 3600),
  jwtSecret: process.env.JWT_SECRET as string,
  //encryptionKey: process.env.ENCRYPTION_KEY
};
