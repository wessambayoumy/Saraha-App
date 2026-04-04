import { ErrorRequestHandler } from "express";
import { IErrorResponse } from "./../../../interfaces/index.js";
import { MulterError } from "multer";

export class AppErrors extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode: number,
    name: string,
  ) {
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
    super(message, 401, "UnAuthorizedError");
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

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res) => {
  if (err instanceof MulterError)
    throw new BadRequestError(err.message);
  const status = err instanceof AppErrors ? err.statusCode : 500;
  let response: IErrorResponse = {
    message: err.message,
    stack: err.stack,
    extra: err.extra,
  };
  if (process.env.NODE_ENV === "prod") delete err.stack;

  console.error(response);
  res.status(status).json(response);
};
