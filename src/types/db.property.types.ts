import { Model } from "mongoose";
import { ICreateGoogleUserDTO, ICreateSystemUserDTO } from "../interfaces/index.js";

export type CreateUserDTO = ICreateSystemUserDTO | ICreateGoogleUserDTO;

export type FindProperties<T> = Parameters<Model<T>["find"]>;
export type FindByIdProperties<T> = Parameters<Model<T>["findById"]>;
export type UpdateProperties<T> = Parameters<Model<T>["updateMany"]>;
export type DeleteProperties<T> = Parameters<Model<T>["deleteMany"]>;
export type AggregateProperties<T> = Parameters<Model<T>["aggregate"]>;
export type CountProperties<T> = Parameters<Model<T>["countDocuments"]>;

