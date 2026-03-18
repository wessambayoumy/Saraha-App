import { Types } from "mongoose";

export interface INote {
  title: string;
  content: string;
  attachments?: string[];
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
