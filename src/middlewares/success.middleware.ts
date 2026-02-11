import { RequestHandler } from "express";
import { ISuccessResponse } from "../interfaces/response.interface.js";


export const successResponseInterceptor: RequestHandler = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const { message, ...rest } = payload ?? {};

      const response: ISuccessResponse = {
        Success: true,
        message: message ?? "Request executed successfully",
        ...rest,
      };

      return originalJson(response);
    }

    return originalJson(payload);
  };

  next();
};
