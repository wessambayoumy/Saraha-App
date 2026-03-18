import mongoose, { Model, model, Schema, Types } from "mongoose";
import userModel from "../user/user.model.js";
import { INote } from "../../../interfaces/models/index.js";

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
      minLength: 1,
      maxLength: 100,
    },
    content: {
      type: String,
      trim: true,
      required: [true, "Content is required"],
      minLength: 1,
      maxLength: 1000,
    },
    attachments: {
      type: [String],
      default: [],
    },
    userId: {
      type: Types.ObjectId,
      ref: userModel,
      required: [true, "UserId is required"],
    },
  },

  {
    strict: true,
    timestamps: true,
  },
);

const noteModel: Model<INote> =
  mongoose.models.notes || model("notes", noteSchema);

export default noteModel;
