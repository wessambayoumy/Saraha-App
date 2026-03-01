
import {
  IAggregateDoc,
  ICountDocs,
  ICreateDoc,
  IDeleteDoc,
  IFindByIdDoc,
  IFindDoc,
  IUpdateDoc,
} from "../interfaces/db.crud.interface.js";

export const create = <TSchema,TData>({
  model,
  data,
  options,
}: ICreateDoc<TSchema,TData>) => {
  const doc = new model(data, options);
  return doc.save();
};

export const findOne = <T>({
  model,
  filter,
  projection,
  options,
}: IFindDoc<T>) => model.findOne(filter, projection, options);

export const find = <T>({ model, filter, projection, options }: IFindDoc<T>) =>
  model.find(filter, projection, options);

export const findById = <T>({
  model,
  id,
  projection,
  options,
}: IFindByIdDoc<T>) => model.findById(id, projection, options);

export const updateOne = <T>({
  model,
  filter,
  update,
  options,
}: IUpdateDoc<T>) => model.updateOne(filter ?? {}, update, options);

export const updateMany = <T>({
  model,
  filter,
  update,
  options,
}: IUpdateDoc<T>) => model.updateMany(filter ?? {}, update, options);


export const deleteOne = <T>({ model, filter, options }: IDeleteDoc<T>) =>
  model.deleteOne(filter, options);

export const deleteMany = <T>({ model, filter, options }: IDeleteDoc<T>) =>
  model.deleteMany(filter, options);

export const countDocuments = <T>({ model, filter }: ICountDocs<T>) =>
  model.countDocuments(filter);

export const aggregate = <T>({ model, pipeline, options }: IAggregateDoc<T>) =>
  model.aggregate(pipeline, options);
