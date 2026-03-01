import { Types } from "mongoose";
import { UnAuthorizedError } from "../response/error.middleware.js";
import {
  JwtPayload,
  verifyToken,
} from "../../utils/security/json.web.token.js";
import userModel from "../../../db/models/user/user.model.js";
import { RequestHandler } from "express";
import { findById } from "../../../db/db.service.js";
import jwt, { Secret } from "jsonwebtoken";
import { env } from "../../../config/env.service.js";
import { roleEnum } from "../../enums/user.enums.js";

export const authMiddleware: RequestHandler = async (
  req,
  _res,
  next,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnAuthorizedError("Token is required");
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.decode(token) as JwtPayload ;
  console.log(decoded.role);
  
  let signature: Secret ='';
  decoded?.role === roleEnum.admin
    ? (signature = env.jwtAdminSecret)
    : (signature = env.jwtUserSecret);
  const payload = verifyToken<JwtPayload>(token, signature);
    console.log("User ID from payload:",typeof payload.userId);

  const user = await findById({
    model: userModel,
    id: payload.userId,
    
  });
  if (!user) throw new UnAuthorizedError("User doesn't exist");

  if (!Types.ObjectId.isValid(payload.userId)) {
    throw new UnAuthorizedError("Invalid token payload");
  }
  req.user = user;

 next();
};
