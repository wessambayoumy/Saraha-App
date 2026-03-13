import { Types } from "mongoose";
import { UnAuthorizedError } from "./index.js";
import { JwtDetails, verifyToken } from "../utils/index.js";
import userModel from "../../db/models/user/user.model.js";
import { RequestHandler } from "express";
import { findById } from "../../db/db.service.js";
import jwt, { Secret } from "jsonwebtoken";
import { env } from "../../config/env.service.js";
import { roleEnum } from "../enums/user.enums.js";
import { redis } from "../../db/redis/redis.service.js";

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer "))
    throw new UnAuthorizedError("Token is required");

  const token = authHeader.split(" ")[1];

  const decoded = jwt.decode(token) as JwtDetails;

  let signature: Secret = "";
  if (decoded?.role === roleEnum.admin) signature = env.jwtAdminSecret;
  else signature = env.jwtUserSecret;

  const payload = verifyToken<JwtDetails>(token, signature);

  const user = await findById({
    model: userModel,
    id: payload.userId,
  });
  if (!user) throw new UnAuthorizedError("User doesn't exist");

  if (!Types.ObjectId.isValid(payload.userId))
    throw new UnAuthorizedError("Invalid token payload");

  if (
    user.signOutDate?.getTime() > decoded.iat! * 1000 ||
    (await redis.get(`revokeId:${decoded.jti}`))
  )
    throw new UnAuthorizedError("Token Revoked");

  req.user = user;
  req.token = token;

  next();
};
