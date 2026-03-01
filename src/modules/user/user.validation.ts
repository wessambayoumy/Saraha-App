import joi from "joi";
import {
  genderEnum,
  providerEnum,
  roleEnum,
} from "../../common/enums/user.enums.js";

export const systemSignUpSchema = {
  body: joi
    .object({
      userName: joi.string().required().trim().min(6).max(40),
      email: joi.string().required().email(),
      password: joi
        .string()
        .required()
        .regex(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/)
        .trim(),
      rePassword: joi
        .string()
        .required()
        .regex(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/)
        .trim(),
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
      email: joi.string().required().email(),
      provider: joi.string().valid(...Object.values(providerEnum)),
      confirmed: joi.boolean().allow(true),
      profilePicture: joi.string(),
    })
    .required(),
};

export const signInSchema = {
  body: joi
    .object({
      email: joi.string().required().email(),
      password: joi
        .string()
        .required()
        .regex(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/)
        .trim(),
    })
    .required(),
};
