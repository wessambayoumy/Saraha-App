import { ObjectId } from "mongoose";

export interface INote {
  title: string;
  content: string;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
