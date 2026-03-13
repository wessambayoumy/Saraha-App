import mongoose, { Model, model, Schema } from "mongoose";
import { IUser } from "../../../interfaces/models/index.js";
import {
  genderEnum,
  providerEnum,
  roleEnum,
} from "../../../common/enums/user.enums.js";

const userSchema = new Schema<IUser>(
  {
    fName: {
      type: String,
      trim: true,
      required: true,
      minLength: 3,
      maxLength: 20,
    },

    lName: {
      type: String,
      trim: true,
      required: true,
      minLength: 3,
      maxLength: 20,
    },

    profileName: {
      type: String,
      required: true,
      unique: [true, "Profile name must be unique"],
      trim: true,
      minLength: 5,
      maxLength: 40,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      trim: true,
      select: false,
      required: [
        function (): boolean {
          return this.provider === providerEnum.system;
        },
        "Please enter a strong password",
      ],
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

    views: {
      type: Number,
      default: 0,
    },

    confirmed: {
      type: Boolean,
      default: false,
    },
    
    signOutDate: Date,

    profilePicture: String,

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
  },
  {
    strict: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema
  .virtual("userName")
  .set(function (value: string) {
    const [fName, lName] = value.split("_");
    this.fName = fName;
    this.lName = lName;
  })
  .get(function () {
    return `${this.fName}_${this.lName}`;
  });

userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24,
    partialFilterExpression: { confirmed: false },
  },
);

const userModel: Model<IUser> =
  mongoose.models.users || model("users", userSchema);

export default userModel;
