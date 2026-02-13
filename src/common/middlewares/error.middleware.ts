import { ErrorRequestHandler } from "express";
import { IErrorResponse } from "../interfaces/response.interface.js";

//400 401 404 409

export class AppErrors extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number, name: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = name;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace)
      Error.captureStackTrace(this, this.constructor);
  }
}
export class BadRequestError extends AppErrors {
  constructor(message: string) {
    super(message, 400, "BadRequestError");
  }
}
export class UnAuthorizedError extends AppErrors {
  constructor(message: string) {
    super(message, 401, "AppErrors");
  }
}

export class NotFoundError extends AppErrors {
  constructor(message: string) {
    super(message, 404, "NotFoundError");
  }
}

export class ConflictError extends AppErrors {
  constructor(message: string) {
    super(message, 409, "ConflictError");
  }
}

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
  const status = err instanceof AppErrors ? err.statusCode : 500;
  const response: IErrorResponse = { message: err.message, stack: err.stack };
  console.error(err.stack);
  res.status(status).json(response);
};
