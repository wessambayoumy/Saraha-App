import { Types } from "mongoose";
import { UnAuthorizedError } from "./error.middleware.js";
import {
  JwtPayload,
  verifyToken,
} from "../../common/utils/security/json.web.token.js";
import userModel from "../../db/models/user.model.js";
import { RequestHandler } from "express";
import { findById } from "../../db/db.services.js";

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnAuthorizedError("Token is required");
  }

  const token = authHeader.split(" ")[1];

  const payload = verifyToken<JwtPayload>(token);

  const user = await findById({
    model: userModel,
    id: { userId: payload.userId },
  });
  if (!user) throw new UnAuthorizedError("User doesn't exist");

  if (!Types.ObjectId.isValid(payload.userId)) {
    throw new UnAuthorizedError("Invalid token payload");
  }
  req.userId = new Types.ObjectId(payload.userId);

  next();
};
