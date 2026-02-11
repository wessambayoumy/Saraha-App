import jwt from "jsonwebtoken";
import { env } from "../../../config/env.js";
import { Types } from "mongoose";

export interface JwtPayload {
  userId: Types.ObjectId;
  token_v: number;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiry });
};

export const verifyToken = <T = JwtPayload>(token: string): T => {
  return jwt.verify(token, env.jwtSecret) as T;
};

