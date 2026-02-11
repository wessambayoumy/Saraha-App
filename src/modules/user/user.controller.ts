import { Router } from "express";
import * as userService from "./user.service.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const userRouter: Router = Router();

userRouter.get("/getAllUsers", userService.getAllUsers);

//tasks
userRouter.post("/signUp", userService.signUp);
userRouter.post("/signIn", userService.signIn);
userRouter.patch("/", authMiddleware, userService.updateUser);
userRouter.delete("/", authMiddleware, userService.deleteLoggedInUser);
userRouter.get("/", authMiddleware, userService.getLoggedInUser);
export default userRouter;
