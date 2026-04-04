import userModel from "../../db/models/user/user.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnAuthorizedError,
} from "../../common/middlewares/index.js";
import * as dbService from "../../db/db.service.js";
import { env } from "../../../config/env.service.js";
import {
  signToken,
  encrypt,
  hash,
  compareHash,
  JwtDetails,
  generatePassword,
} from "../../common/utils/index.js";
import { providerEnum, roleEnum } from "../../common/enums/user.enums.js";
import { OAuth2Client } from "google-auth-library";
import { Request } from "express";
import { redis } from "../../db/redis/redis.service.js";
import jwt from "jsonwebtoken";
import EventEmitter from "node:events";

const event = new EventEmitter();

//GET

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

// POST

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

  let profilePicture = "";

  if (req.file)
    profilePicture = `${env.jwtIssuer}/${req.file.destination}/${req.file.filename}`;

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
      profilePicture,
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

  if (user.twoFactorEnabled) {
    event.emit(`signInOtp/${user._id}`, user.email);
    return { message: "verification otp sent to your email" };
  } else {
    const accessToken = signToken(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      user.role === roleEnum.admin ? env.jwtAdminSecret : env.jwtUserSecret,
      { audience: user.role },
    );
    await user.save();
    return {
      message: "signed in successfully",
      accessToken,
    };
  }
};

export const signOut = async (req: Request) => {
  let token = req.token;
  let { jti } = jwt.decode(token) as { jti: string };

  await redis.set(`revokeId:${jti}`, 1, {
    expiration: { type: "EX", value: 7 * 24 * 60 * 60 },
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

  await user.save();
  console.log("mn 2wlha keda?");
  event.emit(`enable2FA/${user._id}`, user.email);
};

export const verifyOtp = async (
  otp: string,
  otpName: string,
  email: string,
) => {
  const user = await dbService.findOne({ model: userModel, filter: { email } });

  if (!user) throw new NotFoundError("user not found");

  const redisOtp = await redis.get(otpName);
  if (!redisOtp) throw new BadRequestError("otp not sent");
  if (!compareHash(otp, redisOtp)) throw new UnAuthorizedError("Incorrect otp");
  let data = {};
  switch (otpName) {
    case `enable2FA/${user._id}`: {
      user.twoFactorEnabled = true;
      data = { message: `2FA enabled successfully` };
      break;
    }
    case `signInOtp/${user._id}`: {
      data = { message: `Signed in successfully` };
      break;
    }
    case `forgetPassword/${user._id}`: {
      const temp = generatePassword();
      user.password = hash(temp);
      data = {
        message: `Use this temporary password to update your password.`,
        temp,
      };
      break;
    }
  }
  await user.save();
  return data;
};

// PATCH

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

//PUT

export const resetPassword = async (email: string) => {
  const user = await dbService.findOne({ model: userModel, filter: { email } });
  if (!user) throw new NotFoundError("user not found");

  event.emit(`forgetPassword/${user._id}`, email);
};

export const updateUser = async (req: Request) => {
  const { userName, phoneNumber, age, gender, profileName, email, password } =
    req.body;

  if (password || email)
    throw new BadRequestError("Cannot update email or password here");

  let updatedUser = await dbService.findById({
    model: userModel,
    id: req.user._id,
  });

  let profilePicture = "";

  if (req.file) {
    profilePicture = `${env.jwtIssuer}/${req.file.destination}/${req.file.filename}`;
    updatedUser!.profilePicture = profilePicture;
  }

  userName && (updatedUser!.userName = userName);
  phoneNumber && (updatedUser!.phoneNumber = encrypt(phoneNumber));
  age && (updatedUser!.age = age);
  gender && (updatedUser!.gender = gender);
  profileName && (updatedUser!.profileName = profileName);

  if (
    !userName &&
    !phoneNumber &&
    !age &&
    !gender &&
    !profileName &&
    !profilePicture
  )
    throw new BadRequestError("no fields changed");

  return await updatedUser!.save();
};

// DELETE

export const deleteUser = async (req: Request) => {
  const userId = req.user._id;
  return await dbService.deleteOne({ model: userModel, filter: { userId } });
};
