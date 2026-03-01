import { ObjectSchema } from "joi";

export interface ValidationSchema {
  body?: ObjectSchema;
  params?: ObjectSchema;
  query?: ObjectSchema;
}
