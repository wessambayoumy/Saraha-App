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
import { signToken, encrypt } from "../../common/utils/index.js";
import { providerEnum, roleEnum } from "../../common/enums/user.enums.js";
import { OAuth2Client } from "google-auth-library";
import { Request } from "express";

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

export const signIn = async (req: Request) => {
  const { email, password } = req.body;
  const user = await dbService
    .findOne({
      model: userModel,
      filter: { email, provider: providerEnum.system },
    })
    .select(`+password`);

  if (!user) {
    throw new NotFoundError("Invalid email or password");
  }

  if (!bcrypt.compareSync(password, user.password!)) {
    throw new UnAuthorizedError("Invalid email or password");
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
