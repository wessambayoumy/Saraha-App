import { RequestHandler } from "express";
import { Types } from "mongoose";
import { UnAuthorizedError } from "./error.middleware.js";
import {
  JwtPayload,
  verifyToken,
} from "../common/utils/security/json.web.token.js";
import userModel from "../db/models/user.model.js";

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnAuthorizedError("Token is required");
  }

  const token = authHeader.split(" ")[1];

  const payload = verifyToken<JwtPayload>(token);

  const user = await userModel.findById(payload.userId);
  if (!user) throw new UnAuthorizedError("User doesn't exist");

  if (user.token_v !== payload.token_v)
    throw new UnAuthorizedError("Token has been revoked");

  if (!Types.ObjectId.isValid(payload.userId)) {
    throw new UnAuthorizedError("Invalid token payload");
  }
  req.userId = new Types.ObjectId(payload.userId);

  next();
};
