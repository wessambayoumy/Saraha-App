import jwt from "jsonwebtoken";
import type { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";

import { Types } from "mongoose";
import { v4 } from "uuid";
import { env } from "../../../config/env.service.js";
import { roleEnum } from "../../enums/user.enums.js";

export interface JwtPayload {
  userId: Types.ObjectId;
  email?: string;
  role?: roleEnum;
}

export const signToken = (
  payload: JwtPayload,
  secret: Secret,
  options: SignOptions = {
    expiresIn: env.jwtExpiry,
    jwtid: v4(),
    issuer: env.jwtIssuer,
  },
): string => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = <T = JwtPayload>(
  token: string,
  secret: Secret,
  options?: VerifyOptions,
): T => {
  return jwt.verify(token, secret, options) as T;
};
