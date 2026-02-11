import {
  IAggregateDoc,
  ICreateDoc,
  IDeleteDoc,
  IFindByIdDoc,
  IFindDoc,
  IUpdateDoc,
} from "../interfaces/db.crud.interface.js";

export const create = <TSchema>({
  model,
  data,
  options = {},
}: ICreateDoc<TSchema>) => {
  const doc = new model(data);
  return doc.save(options);
};

export const findOne = <T>({
  model,
  filter = {},
  projection = {},
  options = {},
}: IFindDoc<T>) => {
  return model.findOne(filter, projection, options);
};

export const find = <T>({
  model,
  filter = {},
  projection = {},
  options = {},
}: IFindDoc<T>) => {
  return model.find(filter, projection, options);
};

export const findById = <T>({
  model,
  id,
  projection = {},
  options = {},
}: IFindByIdDoc<T>) => {
  return model.findById(id, projection, options);
};

export const updateOne = <TSchema>({
  model,
  filter,
  update,
  options,
}: IUpdateDoc<TSchema>) => {
  return model.updateOne(filter, update, options);
};

export const updateMany = <TSchema, T>({
  model,
  filter,
  update,
  options,
}: IUpdateDoc<TSchema>) => {
  return model.updateMany(filter, update, options ?? {});
};

export const deleteOne = <TSchema>({
  model,
  filter,
  options,
}: IDeleteDoc<TSchema>) => {
  return model.deleteOne(filter, options);
};

export const deleteMany = <TSchema>({
  model,
  filter,
  options,
}: IDeleteDoc<TSchema>) => {
  return model.deleteMany(filter, options);
};

export const countDocuments = <T>({ model, filter = {} }: IFindDoc<T>) => {
  return model.countDocuments(filter);
};

export const aggregate = <T>({ model, pipeline }: IAggregateDoc<T>) => {
  return model.aggregate(pipeline);
};
