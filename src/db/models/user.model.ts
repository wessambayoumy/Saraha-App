import mongoose, { Model, model, Schema } from "mongoose";
import { IUser } from "../../interfaces/models/user.interface.js";
import { genderEnum } from "../../common/enums/gender.enum.js";
import { providerEnum } from "../../common/enums/provider.enum.js";
import { roleEnum } from "../../common/enums/role.enum.js";

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
      require: [
        function name(this: IUser): boolean {
          return this.provider === providerEnum.system;
        },
        "Please enter a strong password",
      ],
      select: false,
     },

    phoneNumber: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      
    },

    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default: Object.values(genderEnum)[0],
    },
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: Object.values(providerEnum)[0],
    },
    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: Object.values(roleEnum)[0],
    },
    
    confirmed: Boolean,
    profilePicture: String,
  },
  {
    strict: true,
    timestamps: true,
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
