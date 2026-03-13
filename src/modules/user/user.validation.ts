import joi from "joi";
import {
  genderEnum,
  providerEnum,
  roleEnum,
} from "../../common/enums/user.enums.js";

const passwordRegex =
  /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\s:])([^\s]){8,16}$/;

export const systemSignUpSchema = {
  body: joi
    .object({
      userName: joi.string().trim().min(6).max(40),
      profileName: joi.string().trim().alphanum().min(5).max(40).required(),
      email: joi.string().email().required(),
      password: joi
        .string()
        .regex(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\s:])([^\s]){8,16}$/)
        .trim()
        .required(),
      rePassword: joi
        .string()
        .regex(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\s:])([^\s]){8,16}$/)
        .trim()
        .required(),
      phoneNumber: joi.string(),
      age: joi.number(),
      gender: joi.string().valid(...Object.values(genderEnum)),
      role: joi.string().valid(...Object.values(roleEnum)),
    })
    .required(),
};
export const googleSignUpSchema = {
  body: joi
    .object({
      userName: joi.string().required().trim().min(6).max(40),
      profileName: joi.string().required().trim().alphanum().min(5).max(40),
      email: joi.string().required().email(),
      provider: joi.string().valid(...Object.values(providerEnum)),
      confirmed: joi.boolean(),
      profilePicture: joi.string(),
    })
    .required(),
};

export const signInSchema = {
  body: joi
    .object({
      email: joi.string().email().required(),
      password: joi
        .string()
        .regex(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/)
        .trim()
        .required(),
    })
    .required(),
};

export const updateUser = {
  body: joi
    .object({
      userName: joi.string().trim().min(6).max(40),
      profileName: joi.string().trim().alphanum().min(5).max(40).required(),
      phoneNumber: joi.string(),
      age: joi.number(),
      gender: joi.string().valid(...Object.values(genderEnum)),
      role: joi.string().valid(...Object.values(roleEnum)),
    })
    .required(),
};

export const getUserProfileSchema = {
  params: joi
    .object({
      profileName: joi.string().trim().required(),
    })
    .required(),
};

export const verify2FASchema = {
  body: joi
    .object({
      otp: joi.string().trim().length(6).pattern(/^\d+$/).required(),
    })
    .required(),
};

export const updatePasswordSchema = {
  body: joi
    .object({
      currentPassword: joi.string().regex(passwordRegex).trim().required(),
      newPassword: joi.string().regex(passwordRegex).trim().required(),
      reNewPassword: joi.string().regex(passwordRegex).trim().required(),
    })
    .required(),
};

export const resetPasswordSchema = {
  body: joi
    .object({
      email: joi.string().email().required(),
    })
    .required(),
};

export const confirmEmailSchema = {
  params: joi
    .object({
      token: joi.string().trim().required(),
    })
    .required(),
};
