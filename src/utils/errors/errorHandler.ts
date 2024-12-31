import { Request, Response, NextFunction } from "express";
import CustomError from "./customError";
import AnotherError from "./anotherError";
import NotFoundError from "./404notFound";
import Logger from "../logger";

export const ErrorHandler = (
  error: any,
  _request: Request,
  response: Response,
  _next?: NextFunction
) => {
  Logger.Log?.error(error);
  if (error instanceof AnotherError) {
    return response
      .status(error.returnError().statusCode)
      .json(error.returnError());
  } else if (error instanceof NotFoundError) {
    return response.status(404).json(error.returnError());
  } else {
    return response
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
