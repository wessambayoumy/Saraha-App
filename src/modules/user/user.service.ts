import express from "express";
import bcrypt from "bcrypt";
import userModel from "../../db/models/user.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnAuthorizedError,
} from "../../common/middlewares/error.middleware.js";
import * as dbService from "./../../db/db.services.js";
import { env } from "../../config/env.service.js";
import { signToken } from "../../common/utils/security/json.web.token.js";
import { encrypt } from "../../common/utils/security/encryption.js";
import { providerEnum } from "../../common/enums/provider.enum.js";
import { OAuth2Client } from "google-auth-library";

// 0
export const getAllUsers: express.RequestHandler = async (_req, res) => {
  const users = await dbService.find({ model: userModel });

  if (!users.length) {
    throw new NotFoundError("No users found");
  }
  res.status(200).json({ UsersCount: users.length, users });
};

//1
export const signUp: express.RequestHandler = async (req, res) => {
  const {
    fName,
    lName,
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

  const passwordRegex =
    /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
  if (!passwordRegex.test(password)) {
    throw new BadRequestError(
      `Password must satisfy all of the following conditions: At least 1 number (0-9) At least 1 uppercase letters At least 1 lowercase letters At least 1 non-alpha numeric number password is 8-16 characters with no spaces`,
    );
  }
  if (password !== rePassword) throw new ConflictError("Passwords don't match");

  const hashedPassword = await bcrypt.hash(password, env.saltRounds);

  const user = await dbService.create({
    model: userModel,
    data: {
      fName,
      lName,
      email,
      password: hashedPassword,
      phoneNumber: encrypt(phoneNumber),
      age,
      gender,
      role,
    },
  });

  res.status(201).json({ message: "user created successfully", user });
};

//2
export const signIn: express.RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = await dbService.findOne({
    model: userModel,
    filter: { email, provider: providerEnum.system },
  });

  if (!user) {
    throw new NotFoundError("Invalid email or password");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    throw new UnAuthorizedError("Invalid email or password");
  }

  const accessToken = signToken({ userId: user._id });

  return res.json({ accessToken });
};

//3
export const updateUser: express.RequestHandler = async (req, res) => {
  const {
    fName,
    lName,
    email,
    password,
    rePassword,
    phoneNumber,
    age,
    gender,
  } = req.body;
  if (password) throw new BadRequestError("Password cannot be updated");
  if (email)
    if (
      await dbService.findOne({
        model: userModel,
        filter: { email },
      })
    )
      throw new ConflictError("Email already exists ");

  const user = await dbService.updateOne({
    model: userModel,
    update: {
      fName,
      lName,
      email,
      password,
      rePassword,
      phoneNumber: encrypt(phoneNumber),
      age,
      gender,
    },
  });
  return res.json({ message: "user updated successfully", user });
};

//4
export const deleteLoggedInUser: express.RequestHandler = async (req, res) => {
  const userId = req.user._id;
  const user = await dbService.findById({ model: userModel, id: { userId } });
  await dbService.deleteOne({ model: userModel, filter: { user } });
  return res.json({ message: "user deleted successfully" });
};

//5
export const getLoggedInUser: express.RequestHandler = async (req, res) => {
  const userId = req.user._id;
  const user = await dbService.findById({ model: userModel, id: { userId } });

  return res.json({ user });
};

//6
export const getLoggedInUserProfile: express.RequestHandler = async (
  req,
  res,
) => res.json({ user: req.user });

export const signUpWithGoogle: express.RequestHandler = async (req, res) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience:
      "915394953197-19q5e2uqink77n0e393oe9gaf1d8t4ko.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  console.log(payload);

  if (!payload) throw new BadRequestError("Invalid Google token");
  const { email, email_verified, picture, name } = payload;

  let user = await dbService.findOne({
    model: userModel,
    filter: { email, provider: providerEnum.google },
  });
  if (!user) {
    //dbService type error
    user = await userModel.create({
      fName: name?.split(" ")[0] || "",
      lName: name?.split(" ")[1] || "",
      email,
      provider: providerEnum.google,
      confirmed: email_verified,
      profilePicture: picture,
    });
  }
  const token = signToken({ userId: user._id, email: user.email });
  return res.json({ token });
};
