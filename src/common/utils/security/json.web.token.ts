import jwt from "jsonwebtoken";
import type { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { Types } from "mongoose";
import { v4 } from "uuid";
import { env } from "../../../config/env.service.js";
import { roleEnum } from "../../enums/user.enums.js";

export interface JwtDetails {
  userId: Types.ObjectId;
  email?: string;
  role?: roleEnum;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  jti?: string;
}

export const signToken = (
  payload: JwtDetails,
  secret: Secret,
  options?: SignOptions,
): string =>
  jwt.sign(payload, secret, {
    ...options,
    expiresIn: env.jwtExpiry,
    jwtid: v4(),
    issuer: env.jwtIssuer,
  });

export const verifyToken = <T = JwtDetails>(
  token: string,
  secret: Secret,
  options?: VerifyOptions,
): T => jwt.verify(token, secret, options) as T;
