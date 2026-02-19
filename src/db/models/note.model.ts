import mongoose, { Model, model, Schema, Types } from "mongoose";
import userModel from "./user.model.js";
import { INote } from "../../interfaces/models/note.interface.js";

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      trim: true,
      require: [true, "First name is required"],
      minLength: 3,
      maxLength: 20,
    },
    content: {
      type: String,
      trim: true,
      require: [true, "Last name is required"],
      minLength: 3,
      maxLength: 500,
    },

    userId: {
      type: Types.ObjectId,
      ref: userModel,
      required: [true, "UserId is required"],
    },
    image:{
      type:String,
      validate: {
        validator: function (value: string):boolean {
          const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
          return urlRegex.test(value);
        },
        message: "Invalid image URL",
      },

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
