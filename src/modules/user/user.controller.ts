import { Router } from "express";
import { authenticationMiddleware } from "../../common/middlewares/auth/authentication.middleware.js";
import * as userService from "./user.service.js";
import { authorizationMiddleware } from "../../common/middlewares/auth/authorization.middleware.js";
import { roleEnum } from "../../common/enums/role.enum.js";
const userRouter: Router = Router();

userRouter.get("/getAllUsers", userService.getAllUsers);

userRouter.post("/signUp", userService.signUp);
userRouter.post("/signUpWithGoogle", userService.signUpWithGoogle);
userRouter.post("/signIn", userService.signIn);
userRouter.patch("/", authenticationMiddleware, userService.updateUser);
userRouter.delete(
  "/",
  authenticationMiddleware,
  authorizationMiddleware([roleEnum.admin]),
  userService.deleteLoggedInUser,
);
userRouter.get("/", authenticationMiddleware, userService.getLoggedInUser);
userRouter.get(
  "/profile",
  authenticationMiddleware,
  authorizationMiddleware([roleEnum.admin]),
  userService.getLoggedInUserProfile,
);

export default userRouter;
