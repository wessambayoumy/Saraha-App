import {
  IAggregateDoc,
  ICountDocs,
  ICreateDoc,
  IDeleteDoc,
  IFindByIdDoc,
  IFindDoc,
  IUpdateDoc,
} from "../interfaces/db.crud.interface.js";

export const create = <T>({ model, data, options }: ICreateDoc<T>) => {
  const doc = new model(data);
  return doc.save(options);
};

export const findOne = <T>({
  model,
  filter,
  projection,
  options,
}: IFindDoc<T>) => {
  return model.findOne(filter, projection, options);
};

export const find = <T>({
  model,
  filter,
  projection,
  options,
}: IFindDoc<T>) => {
  return model.find(filter, projection, options);
};

export const findById = <T>({
  model,
  id,
  projection,
  options,
}: IFindByIdDoc<T>) => {
  return model.findById(id, projection, options);
};

export const updateOne = <T>({
  model,
  filter,
  update,
  options,
}: IUpdateDoc<T>) => {
  return model.updateOne(filter ?? {}, update, options);
};

export const updateMany = <T>({
  model,
  filter,
  update,
  options,
}: IUpdateDoc<T>) => {
  return model.updateMany(filter ?? {}, update, options);
};

export const deleteOne = <T>({ model, filter, options }: IDeleteDoc<T>) => {
  return model.deleteOne(filter, options);
};

export const deleteMany = <T>({ model, filter, options }: IDeleteDoc<T>) => {
  return model.deleteMany(filter, options);
};

export const countDocuments = <T>({ model, filter }: ICountDocs<T>) => {
  return model.countDocuments(filter);
};

export const aggregate = <T>({
  model,
  pipeline,
  options,
}: IAggregateDoc<T>) => {
  return model.aggregate(pipeline, options);
};
