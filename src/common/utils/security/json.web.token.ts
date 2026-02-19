import jwt from "jsonwebtoken";
import type { SignOptions, VerifyOptions } from "jsonwebtoken";

import { Types } from "mongoose";
import { v4 } from "uuid";
import { env } from "../../../config/env.service.js";
import { roleEnum } from "../../enums/role.enum.js";

export interface JwtPayload {
  userId: Types.ObjectId;
  email?: string;
  role?: roleEnum;
}

export const signToken = (
  payload: JwtPayload,
  options: SignOptions = { expiresIn: env.jwtExpiry, jwtid: v4() },
): string => {
  return jwt.sign(payload, env.jwtSecret, options);
};

export const verifyToken = <T = JwtPayload>(
  token: string,
  options?: VerifyOptions,
): T => {
  return jwt.verify(token, env.jwtSecret, options) as T;
};
