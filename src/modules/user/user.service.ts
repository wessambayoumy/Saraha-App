import express from "express";
import bcrypt from "bcrypt";
import userModel from "../../db/models/user.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnAuthorizedError,
} from "../../middlewares/error.middleware.js";
import * as dbService from "./../../db/db.services.js";
import { env } from "../../config/env.js";
import { signToken } from "../../common/utils/security/json.web.token.js";

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
  const { fName, lName, email, password, rePassword, phoneNumber, age } =
    req.body;
  const passwordRegex: RegExp =
    /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;

  if (await dbService.findOne({ model: userModel, filter: { email } }))
    throw new ConflictError("User Already Exists");

  if (!passwordRegex.test(password))
    throw new BadRequestError(
      ` Password must satisfy all of the following conditions: At least 1 number (0-9) At least 1 uppercase letters At least 1 lowercase letters At least 1 non-alpha numeric number password is 8-16 characters with no spaces`,
    );
  if (password !== rePassword) throw new ConflictError("Passwords don't match");

  const hashedPassword = await bcrypt.hash(password, env.saltRounds);

  const user = await dbService.create({
    model: userModel,
    data: { fName, lName, email, password: hashedPassword, phoneNumber, age },
  });

  res.status(201).json({ message: "user created successfully", user });
};

//2
export const signIn: express.RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = await dbService.findOne({ model: userModel, filter: { email } });

  if (!user) {
    throw new NotFoundError("Invalid email or password");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    throw new UnAuthorizedError("Invalid email or password");
  }

  const token = signToken({ userId: user._id, token_v: user.token_v });

  return res.json({ token });
};

//3
export const updateUser: express.RequestHandler = async (req, res) => {
  const { password, ...updatedFields } = req.body;
  if (password) throw new BadRequestError("Password cannot be updated");
  if (updatedFields.email)
    if (
      await dbService.findOne({
        model: userModel,
        filter: { email: updatedFields.email },
      })
    )
      throw new ConflictError("Email already exists ");

  const user = await userModel.updateOne({}, { ...updatedFields });
  return res.json({ message: "user updated successfully", user });
};

//4
export const deleteLoggedInUser: express.RequestHandler = async (req, res) => {
  await userModel.findByIdAndDelete(req.userId);

  return res.json({ message: "user deleted successfully" });
};

//5
export const getLoggedInUser: express.RequestHandler = async (req, res) => {
  const user = await userModel.findById(req.userId);

  return res.json({ user });
};
