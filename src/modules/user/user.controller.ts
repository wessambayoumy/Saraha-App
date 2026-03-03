import { Router } from "express";
import {
  authMiddleware,
  BadRequestError,
  validationMiddleware,
} from "../../common/middlewares/index.js";
import { userValidation, userService } from "./index.js";
import { multerMiddleware } from "../../common/middlewares/multer.middleware.js";

const userRouter: Router = Router();

userRouter.get("/getAllUsers", async (_req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json({ UsersCount: users.length, users });
});

userRouter.get("/profile", async (_req, res) => {
  const user = await userService.getUserProfile();
  const userInfo = {
    age: user.user.age,
    gender: user.user.gender,
    profilePicture: user.user.profilePicture,
    userName: user.user.userName,
  };

  return res.json({ user: userInfo, views: user.views });
});

userRouter.post(
  "/signUp",
  validationMiddleware(userValidation.systemSignUpSchema),
  async (req, res) => {
    const user = await userService.signUp(req);
    res.status(201).json({ message: "user created successfully", user });
  },
);
userRouter.post(
  "/signUpWithGoogle",
  validationMiddleware(userValidation.googleSignUpSchema),
  async (req, res) => {
    const token = await userService.signUpWithGoogle(req);
    res.status(201).json({ message: "user created successfully", token });
  },
);

userRouter.post(
  "/signIn",
  validationMiddleware(userValidation.signInSchema),
  async (req, res) => {
    const token = await userService.signIn(req);
    res.status(200).json({ message: "signed in successfully", token });
  },
);
//2 factr authentication
userRouter.post("/2FA/enable", authMiddleware, async (req, res) => {
  await userService.enable2FA(req);
  res.status(200).json({ message: "2FA token sent successfully" });
});
userRouter.post("/2FA/verify", authMiddleware, async (req, res) => {
  await userService.verify2FA(req);
  res.status(200).json({ message: "2FA verified successfully" });
});

userRouter.get("/confirmEmail/:token", async (req, res) => {
  await userService.confirmEmail(req);
  res.status(200).json({ message: "Email confirmed successfully" });
});

userRouter.post(
  "/images",
  multerMiddleware({ customPath: "images/profilePicture" }).single("image"),
  async (req, res) => {
    const imagePath = req.file?.path;
    if (!imagePath) {
      return new BadRequestError("Image upload failed");
    }
    res.status(200).json({ message: "Image uploaded successfully", imagePath });
  },
);

userRouter.patch("/updatePassword", authMiddleware, async (req, res) => {
  const user = await userService.updatePassword(req);
  res.status(200).json({ message: "Password updated successfully", user });
});
userRouter.put("/resetPassword", async (req, res) => {
  await userService.resetPassword(req);
  res.status(200).json({ message: "Password reset successfully" });
});

export default userRouter;
