import { NextFunction, Request, Response } from "express";
import { UnAuthorizedError } from "../error.middleware.js";
import { roleEnum } from "../../enums/role.enum.js";

export const authorizationMiddleware = (roles:roleEnum[] = []) => {
  return async (req: Request, _res:Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) 
      throw new UnAuthorizedError("UnAuthorized");

    next();
  };
};
