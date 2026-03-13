import { Router } from "express";
import {
  authMiddleware,
  BadRequestError,
  validationMiddleware,
} from "../../common/middlewares/index.js";
import { userValidation, userService } from "./../index.js";
import { multerMiddleware } from "../../common/middlewares/multer.middleware.js";

export const userRouter: Router = Router();
userRouter.get("/getAllUsers", async (_req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json({ UsersCount: users.length, users });
});

userRouter.get(
  "/profile/:profileName",
  validationMiddleware(userValidation.getUserProfileSchema),
  async (req, res) => {
    const user = await userService.getUserProfile(req);

    return res.json({ user });
  },
);

userRouter.get("/profileLink", authMiddleware, async (req, res) => {
  const link = await userService.shareProfileLink(req);
  res.json({ message: "link sent successfully", link });
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
userRouter.post("/signOut", authMiddleware, async (req, res) => {
  await userService.signOut(req);
  res.status(200).json({ message: "signed out successfully" });
});
userRouter.post("/signOut/allDevices", authMiddleware, async (req, res) => {
  await userService.signOutFromAll(req);
  res.status(200).json({ message: "signed out successfully" });
});

userRouter.post("/2FA/enable", authMiddleware, async (req, res) => {
  await userService.enable2FA(req);
  res.status(200).json({ message: "2FA token sent successfully" });
});
userRouter.post(
  "/2FA/verify",
  authMiddleware,
  validationMiddleware(userValidation.verify2FASchema),
  async (req, res) => {
    await userService.verify2FA(req);
    res.status(200).json({ message: "2FA verified successfully" });
  },
);

userRouter.get(
  "/confirmEmail/:token",
  validationMiddleware(userValidation.confirmEmailSchema),
  async (req, res) => {
    await userService.confirmEmail(req);
    res.status(200).json({ message: "Email confirmed successfully" });
  },
);

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

userRouter.patch(
  "/updatePassword",
  authMiddleware,
  validationMiddleware(userValidation.updatePasswordSchema),
  async (req, res) => {
    const user = await userService.updatePassword(req);
    res.status(200).json({ message: "Password updated successfully", user });
  },
);

userRouter.patch(
  "/updateUser",
  authMiddleware,
  validationMiddleware(userValidation.updateUser),
  async (req, res) => {
    const user = await userService.updateUser(req);
    res.status(200).json({ message: "User updated successfully", user });
  },
);

userRouter.put(
  "/resetPassword",
  validationMiddleware(userValidation.resetPasswordSchema),
  async (req, res) => {
    await userService.resetPassword(req);
    res.status(200).json({ message: "Password reset successfully" });
  },
);

userRouter.put("/deleteUser", async (req, res) => {
  await userService.deleteUser(req);
  res.status(200).json({ message: "Password reset successfully" });
});

export default userRouter;
