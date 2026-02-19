import express from "express";
import dbConnection from "./db/connection.js";
import userRouter from "./modules/user/user.controller.js";
import { env } from "./config/env.service.js";
import { successResponseInterceptor } from "./common/middlewares/success.middleware.js";
import {
  globalErrorHandler,
  NotFoundError,
} from "./common/middlewares/error.middleware.js";
import noteRouter from "./modules/note/note.controller.js";
import cors from "cors";
const app = express();
const PORT = env.port;

const bootstrap = () => {
  app.use(cors(), express.json());
  app.use(successResponseInterceptor);

  app.get("/", (_req, res: express.Response) => {
    res.json({ message: "Hello from TypeScript + Express!" });
  });

  dbConnection();

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
