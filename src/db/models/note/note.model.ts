import mongoose, { Model, model, Schema, Types } from "mongoose";
import userModel from "../user/user.model.js";
import { INote } from "../../../interfaces/models/index.js";

const noteSchema = new Schema<INote>(
  {
    message: {
      type: String,
      trim: true,
      require: [true, "Message is required"],
      minLength: 3,
      maxLength: 150,
    },
    userId: {
      type: Types.ObjectId,
      ref: userModel,
      required: [true, "UserId is required"],
    },
    image: String,
  },

  {
    strict: true,
    timestamps: true,
  },
);

const noteModel: Model<INote> =
  mongoose.models.notes || model("notes", noteSchema);

export default noteModel;
