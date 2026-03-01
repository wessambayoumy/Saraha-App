import { RequestHandler } from "express";
import { BadRequestError } from "./response/error.middleware.js";
import { ValidationSchema } from "../../interfaces/validation.interface.js";

export const validationMiddleware = (
  schema: ValidationSchema,
): RequestHandler => {
  return (req, _res, next) => {
    const errors: string[] = [];

    for (const key of Object.keys(schema) as (keyof ValidationSchema)[]) {
      if (schema[key]) {
        const { error } = schema[key].validate(req[key], {
          abortEarly: false,
        });

        if (error) {
          errors.push(...error.details.map((detail) => detail.message));
        }
      }
    }

    if (errors.length) {
      throw new BadRequestError(errors.join(", "));
    }

    next();
  };
};
