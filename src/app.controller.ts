import express from "express";
import dbConnection from "./db/connection.js";
import userRouter from "./modules/user/user.controller.js";
import { env } from "./config/env.service.js";
import {
  successResponseInterceptor,
  globalErrorHandler,
  NotFoundError,
} from "./common/middlewares/index.js";
import noteRouter from "./modules/note/note.controller.js";
import cors from "cors";
import { redisConection } from "./db/redis/redis.connection.js";

const bootstrap = async () => {
  const app = express();
  const PORT = env.port;

  app.use(cors(), express.json(), express.static("uploads"));
  app.use(successResponseInterceptor);

  app.get("/", (_req, res: express.Response) => {
    res.json({ message: "Hello from TypeScript + Express!" });
  });

  await dbConnection();
  await redisConection();
  app.use("/users", userRouter);
  app.use("/notes", noteRouter);
  app.use("{/*demo}", (req: express.Request, _res) => {
    throw new NotFoundError(`Route not found: ${req.originalUrl}`);
  });

  app.use(globalErrorHandler);

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

export default bootstrap;
