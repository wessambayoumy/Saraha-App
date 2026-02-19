import { Types } from "mongoose";


export interface INote {
  title: string;
  content: string;
  image:string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
