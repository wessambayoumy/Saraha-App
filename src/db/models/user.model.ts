import mongoose, { Model, model, Schema } from "mongoose";
import { IUser } from "../../interfaces/models/user.interface.js";

const userSchema = new Schema<IUser>(
  {
    fName: {
      type: String,
      trim: true,
      require: [true, "First name is required"],
      minLength: 3,
      maxLength: 20,
    },
    lName: {
      type: String,
      trim: true,
      require: [true, "Last name is required"],
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      require: [true, "Email is required"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,10}$/,
        "invalid email format",
      ],
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      require: [true, "Please enter a strong password"],
    },

    phoneNumber: {
      type: String,
      trim: true,
      required: [true, "Phone Number is required"],
    },

    age: {
      type: Number,
      trim: true,
      required: [true, "Age is required"],
      validate: {
        validator: function (age) {
          return age >= 18 && age <= 60;
        },
        message: "Sorry, only adults under 60 are permitted",
      },
    },
    token_v: {
      type: Number,
      default: 0,
    },
  },

  {
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("userName").get(function () {
  return `${this.fName}_${this.lName}`;
});

const userModel: Model<IUser> =
  mongoose.models.users || model("users", userSchema);

export default userModel;
