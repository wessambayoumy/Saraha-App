import type {
  Model,
  CreateOptions,
  AggregateOptions,
  QueryFilter,
  Types,
} from "mongoose";
import * as propertyTypes from "../types/db.property.types.js";

export interface ICreateUserDTO {
  fName: string;
  lName: string;
  email: string;
  password: string;
  phoneNumber: string;
  age: number;
  confirmed?: boolean;
  provider?: string;
  gender?: string;
  role?: string;
}

export interface ICreateNoteDTO {
  title: string;
  content: string;
  userId: Types.ObjectId;
}

export interface ICreateDoc<T> {
  model: Model<T>;
  data: ICreateNoteDTO | ICreateUserDTO;
  options?: CreateOptions;
}

export interface IFindDoc<T> {
  model: Model<T>;
  filter?: QueryFilter<T>;
  projection?: propertyTypes.FindProperties<T>[1];
  options?: propertyTypes.FindProperties<T>[2];
}

export interface IFindByIdDoc<T> {
  model: Model<T>;
  id: propertyTypes.FindByIdProperties<T>[0];
  projection?: propertyTypes.FindByIdProperties<T>[1];
  options?: propertyTypes.FindByIdProperties<T>[2];
}

export interface IUpdateDoc<T> {
  model: Model<T>;
  filter?: QueryFilter<T>;
  update: propertyTypes.UpdateProperties<T>[1];
  options?: propertyTypes.UpdateProperties<T>[2];
}

export interface IDeleteDoc<T> {
  model: Model<T>;
  filter?: QueryFilter<T>;
  options?: propertyTypes.DeleteProperties<T>[1];
}

export interface IAggregateDoc<T> {
  model: Model<T>;
  pipeline: propertyTypes.AggregateProperties<T>[0];
  options?: AggregateOptions;
}

export interface ICountDocs<T> {
  model: Model<T>;
  filter?: QueryFilter<T>;
  options?: propertyTypes.CountProperties<T>[1];
}
