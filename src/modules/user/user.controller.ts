import { Router } from "express";
import {
  authMiddleware,
  validationMiddleware,
} from "../../common/middlewares/index.js";
import { userValidation, userService } from "./../index.js";
import { multerMiddleware } from "../../common/middlewares/multer.middleware.js";

export const userRouter: Router = Router();

//GET

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

// POST

userRouter.post(
  "/signUp",
  multerMiddleware({ customPath: "images/profilePicture" }).single(
    "profilePicture",
  ),
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
    const data = await userService.signIn(req);
    res.status(200).json(data);
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
  "/verifyOtp",
  validationMiddleware(userValidation.verify2FASchema),
  async (req, res) => {
    await userService.verifyOtp(req.body.otp, req.body.otpName, req.body.email);
    res.status(200).json({ message: "2FA verified successfully" });
  },
);

// PATCH

userRouter.patch(
  "/updatePassword",
  authMiddleware,
  validationMiddleware(userValidation.updatePasswordSchema),
  async (req, res) => {
    const user = await userService.updatePassword(req);
    res.status(200).json({ message: "Password updated successfully", user });
  },
);

//PUT

userRouter.put(
  "/updateUser",
  authMiddleware,
  multerMiddleware({ customPath: "images/profilePicture" }).single(
    "profilePicture",
  ),
  validationMiddleware(userValidation.updateUser),
  async (req, res) => {
    const user = await userService.updateUser(req);
    console.log(user.age);

    res.status(200).json({ message: "User updated successfully", user });
  },
);

userRouter.put(
  "/resetPassword",
  validationMiddleware(userValidation.resetPasswordSchema),
  async (req, res) => {
    await userService.resetPassword(req.body.email);
    res.status(200).json({ message: "Password reset successfully" });
  },
);

// DELETE

userRouter.delete("/deleteUser", authMiddleware, async (req, res) => {
  await userService.deleteUser(req);
  res.status(200).json({ message: "Password reset successfully" });
});

export default userRouter;
