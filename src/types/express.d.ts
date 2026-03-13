import { Types } from "mongoose";
import { IUser } from "../interfaces/models/user.interface.ts";
import { HydratedDocument } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user: HydratedDocument<IUser>;
      token: string;
    }
  }
}

export {};
