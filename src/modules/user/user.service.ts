import bcrypt from "bcrypt";
import userModel from "../../db/models/user/user.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnAuthorizedError,
} from "../../common/middlewares/index.js";
import * as dbService from "../../db/db.service.js";
import { env } from "../../config/env.service.js";
import { signToken, encrypt, sendEmail, verifyToken } from "../../common/utils/index.js";
import { providerEnum, roleEnum } from "../../common/enums/user.enums.js";
import { OAuth2Client } from "google-auth-library";
import { Request } from "express";
import { authenticator } from "@otplib/preset-default";

export const getAllUsers = async () => {
  const users = await dbService.find({ model: userModel });
  if (!users.length) {
    throw new NotFoundError("No users found");
  }
  return users;
};

let views = 0;
export const getUserProfile = async () => {
  const user = await dbService.findOne({
    model: userModel,
  });
  if (!user) throw new NotFoundError("User not found");
  views++;
  return { user, views };
};

export const signUp = async (req: Request) => {
  const {
    userName,
    email,
    password,
    rePassword,
    phoneNumber,
    age,
    gender,
    role,
  } = req.body;

  if (await dbService.findOne({ model: userModel, filter: { email } }))
    throw new ConflictError("User Already Exists");

  if (password !== rePassword) throw new ConflictError("Passwords don't match");

  const hashedPassword = await bcrypt.hash(password, env.saltRounds);

  return await dbService.create({
    model: userModel,
    data: {
      userName,
      email,
      password: hashedPassword,
      phoneNumber: encrypt(phoneNumber),
      age,
      gender,
      role,
    },
  });
};

export const signUpWithGoogle = async (req: Request) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience:
      "915394953197-19q5e2uqink77n0e393oe9gaf1d8t4ko.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();

  if (!payload) throw new BadRequestError("Invalid Google token");
  const { email, email_verified, picture, name } = payload;

  let user = await dbService.findOne({
    model: userModel,
    filter: { email, provider: providerEnum.google },
  });

  user ??
    (await dbService.create({
      model: userModel,
      data: {
        userName: name,
        email,
        provider: providerEnum.google,
        confirmed: email_verified,
        profilePicture: picture,
      },
    }));

  const token = signToken(
    { userId: user!._id, email: user!.email },
    env.jwtUserSecret,
  );
  return token;
};

export const signIn = async (req: Request) => {
  const { email, password } = req.body;

  const user = await dbService
    .findOne({
      model: userModel,
      filter: { email, provider: providerEnum.system },
    })
    .select("+password");

  if (!user) {
    throw new UnAuthorizedError("Invalid email or password");
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new UnAuthorizedError(
      "Too many failed attempts. Try after 5 minutes",
    );
  }

  if (!bcrypt.compareSync(password, user.password!)) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
      user.loginAttempts = 0;
    }

    await user.save();
    throw new UnAuthorizedError("Invalid email or password");
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();
  if (user.twoFactorEnabled) {
    verify2FA(req);
  }

  const accessToken = signToken(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    user.role === roleEnum.admin ? env.jwtAdminSecret : env.jwtUserSecret,
    { audience: user.role },
  );

  return accessToken;
};

export const enable2FA = async (req: Request) => {
  const userId = req.user._id;

  const user = await dbService.findById({ model: userModel, id: userId });
  if (!user) throw new NotFoundError("User not found");

  if (user.twoFactorEnabled) {
    throw new ConflictError("2FA already enabled");
  }

  const secret = authenticator.generateSecret();

  user.twoFactorSecret = secret;
  await user.save();

  const otp = authenticator.generate(secret);

  await sendEmail(
    user.email,
    "Your 2FA Verification Code",
    `Your OTP code is: ${otp}`,
  );
};

export const verify2FA = async (req: Request) => {
  const { otp } = req.body;
  const userId = req.user._id;

  const user = await dbService
    .findById({ model: userModel, id: userId })
    .select("+twoFactorSecret");

  if (!user || !user.twoFactorSecret) {
    throw new BadRequestError("2FA not initiated");
  }

  const isValid = authenticator.verify({
    token: otp,
    secret: user.twoFactorSecret,
  });

  if (!isValid) {
    throw new UnAuthorizedError("Invalid OTP");
  }

  user.twoFactorEnabled = true;
  await user.save();
};

export const updatePassword = async (req: Request) => {
  const { currentPassword, newPassword, reNewPassword } = req.body;
  const userId = req.user._id;
  const user = await dbService
    .findById({ model: userModel, id: userId })
    .select("+password");
  if (!user) throw new NotFoundError("User not found");

  if (!bcrypt.compareSync(currentPassword, user.password!)) {
    throw new UnAuthorizedError("Current password is incorrect");
  }
  if (newPassword !== reNewPassword) {
    throw new ConflictError("New passwords don't match");
  }
  user.password = await bcrypt.hash(newPassword, env.saltRounds);

  await user.save();
  return user;
};

export const resetPassword = async (req: Request) => {
  const { email } = req.body;
  const user = await dbService.findOne({ model: userModel, filter: { email } });
  if (!user) throw new NotFoundError("User not found");
  const tempPassword = Math.random().toString(36).slice(-8);
  user.password = await bcrypt.hash(tempPassword, env.saltRounds);
  await user.save();
  await sendEmail(
    user.email,
    "Password Reset",
    `Your temporary password is: ${tempPassword}`,
  );
  updatePassword(req);
};

export const confirmEmail = async (req: Request) => {
  const { token } = req.params as { token: string };

  const payload = verifyToken(token, env.emailSecret);

  const user = await dbService.findById({
    model: userModel,
    id: payload.userId,
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.confirmed = true;
  await user.save();


};