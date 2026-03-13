import userModel from "../../db/models/user/user.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnAuthorizedError,
} from "../../common/middlewares/index.js";
import * as dbService from "../../db/db.service.js";
import { env } from "../../config/env.service.js";
import {
  signToken,
  encrypt,
  sendEmail,
  verifyToken,
  hash,
  compareHash,
  JwtDetails,
} from "../../common/utils/index.js";
import { providerEnum, roleEnum } from "../../common/enums/user.enums.js";
import { OAuth2Client } from "google-auth-library";
import { Request } from "express";
import { authenticator } from "@otplib/preset-default";
import { redis } from "../../db/redis/redis.service.js";
import jwt from "jsonwebtoken";

export const getAllUsers = async () => {
  const users = await dbService.find({ model: userModel });
  if (!users.length) {
    throw new NotFoundError("No users found");
  }
  return users;
};

export const getUserProfile = async (req: Request) => {
  const { profileName } = req.params;
  console.log(profileName);

  const user = await dbService
    .findOne({
      model: userModel,
      filter: { profileName },
    })
    .select("age gender profilePicture profileName userName views");
  if (!user) throw new NotFoundError("User not found");
  user.views++;
  return user;
};

export const shareProfileLink = async (req: Request) => {
  const userId = req.user._id;
  const user = await dbService.findById({ model: userModel, id: userId });
  console.log(req);

  return `${env.jwtIssuer}${req.path}/${user?.profileName}`;
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
    profileName,
  } = req.body;

  if (await dbService.findOne({ model: userModel, filter: { email } }))
    throw new ConflictError("User Already Exists");

  if (password !== rePassword) throw new ConflictError("Passwords don't match");

  const hashedPassword = hash(password);

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
      profileName,
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

  if (await redis.get("denyLogin")) {
    throw new UnAuthorizedError(
      `Too many failed attempts. Try after ${await redis.ttl("denyLogin")} seconds`,
    );
  }

  if (!compareHash(password, user.password!)) {
    (await redis.exists("loginAttempts"))
      ? await redis.incrBy("loginAttempts", 1)
      : await redis.set("loginAttempts", 1);

    if (Number(await redis.get("loginAttempts")) >= 5) {
      await redis.set("denyLogin", 1, {
        expiration: { type: "EX", value: 60 * 5 },
      });
      await redis.del("loginAttempts");
    }

    await user.save();

    throw new UnAuthorizedError("Invalid email or password");
  }

  await user.save();

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

export const signOut = async (req: Request) => {
  let token = req.token;
  let { jti } = jwt.decode(token) as JwtDetails;
  await redis.set(`revokeId:${jti}`, 1, {
    expiration: { type: "EX", value: 30 * 60 },
  });
  console.log({ jti });
};

export const signOutFromAll = async (req: Request) => {
  req.user.signOutDate = new Date();
  await req.user.save();
};

export const enable2FA = async (req: Request) => {
  const userId = req.user._id;

  const user = await dbService
    .findById({ model: userModel, id: userId })
    .select("+twoFactorSecret");
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
    `Your 2FA Verification Code`,
    `<h3>Your OTP code is: ${otp}</h3>`,
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
    token: otp.trim(),
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

  if (!compareHash(currentPassword, user.password!)) {
    throw new UnAuthorizedError("Current password is incorrect");
  }
  if (newPassword !== reNewPassword) {
    throw new ConflictError("New passwords don't match");
  }
  user.password = hash(newPassword);

  await user.save();
  return user;
};

export const resetPassword = async (req: Request) => {
  const { email } = req.body;
  const user = await dbService.findOne({ model: userModel, filter: { email } });
  if (!user) throw new NotFoundError("User not found");
  const tempPassword = Math.random().toString(36).slice(-8);
  user.password = hash(tempPassword);
  await user.save();
  await sendEmail(
    user.email,
    "Password Reset",
    `<h3>Your temporary password is: ${tempPassword}</h3>`,
  );
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

export const updateUser = async (req: Request) => {
  const userId = req.user._id;
  if (req.body.password || req.body.email) {
    throw new BadRequestError("Cannot update email or password here");
  }
  return await dbService.updateOne({
    model: userModel,
    filter: { userId },
    update: { ...req.body },
  });
};

export const deleteUser = async (req: Request) => {
  const userId = req.user._id;
  return await dbService.deleteOne({ model: userModel, filter: { userId } });
};
