import mongoose from "mongoose";
import { env } from "../config/env.service.js";

const dbConnection = async () => {
  await mongoose
    .connect(env.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    })
    .then(() => {
      console.log("Database Connected Successfully ✅");
    })
    .catch((error) => {
      console.error("Database Connection Failed ❌", { error });
    });
};
export default dbConnection;
