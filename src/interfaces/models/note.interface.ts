import { Types } from "mongoose";


export interface INote {
  message: string;
  image?:string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
