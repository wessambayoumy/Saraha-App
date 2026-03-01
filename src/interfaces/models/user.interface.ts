import {
  genderEnum,
  providerEnum,
  roleEnum,
} from "../../common/enums/user.enums.js";

export interface IUser {
  fName: string;
  lName: string;
  userName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  profilePicture?: string;
  age?: number;
  gender: genderEnum;
  provider: providerEnum;
  role: roleEnum;
  confirmed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
