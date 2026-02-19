import { genderEnum } from "../../common/enums/gender.enum.js";
import { providerEnum } from "../../common/enums/provider.enum.js";
import { roleEnum } from "../../common/enums/role.enum.js";

export interface IUser {
  fName: string;
  lName: string;
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  profilePicture?: string;
  age: number;
  gender: genderEnum;
  provider: providerEnum;
  role: roleEnum;
  confirmed: boolean;
}
