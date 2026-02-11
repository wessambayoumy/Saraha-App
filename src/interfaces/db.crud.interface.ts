import type {
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  PipelineStage,
  QueryFilter,
  CreateOptions,
  ObjectId,
} from "mongoose";
export interface ICreateUserDTO {
  fName: string;
  lName: string;
  email: string;
  password: string;
  phoneNumber: string;
  age: number;
}
export interface ICreateNoteDTO {
  title: string;
  content: string;
  userId: ObjectId;
}
export interface ICreateDoc<TSchema> {
  model: Model<TSchema>;
  data: ICreateNoteDTO | ICreateUserDTO;
  options?: CreateOptions;
}

export interface IFindDoc<T> {
  model: Model<T>;
  filter?: QueryFilter<T>;
  projection?: ProjectionType<T>;
  options?: QueryOptions<T>;
}

export interface IFindByIdDoc<T> {
  model: Model<T>;
  id: string;
  projection?: ProjectionType<T>;
  options?: QueryOptions<T>;
}

export interface IUpdateDoc<TSchema> {
  model: Model<TSchema>;
  filter?: QueryFilter<TSchema>;
  update: UpdateQuery<TSchema>;
  options?: QueryOptions<TSchema>;
}

export interface IDeleteDoc<TSchema> {
  model: Model<TSchema>;
  filter?: QueryFilter<TSchema>;
  options?: QueryOptions<TSchema>;
}

export interface IAggregateDoc<T> {
  model: Model<T>;
  pipeline: PipelineStage[];
}
