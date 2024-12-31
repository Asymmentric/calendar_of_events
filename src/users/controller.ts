import { NextFunction, Request, Response } from "express";
import UsersService from "./service";
import Logger from "../utils/logger";
import AnotherError from "../utils/errors/anotherError";
import { ErrorHandler } from "../utils/errors/errorHandler";

export default class UserController extends UsersService {
  public createMagicLinkController = async (
    request: Request,
    response: Response
  ) => {
    try {
      const { email } = request.body;
      const result = await this.createMagicLinkService(email);

      return response
        .status(200)
        .json({ success: true, data: { token: result } });
    } catch (error) {
      ErrorHandler(error, request, response);
    }
  };

  public loginController = async (request: Request, response: Response) => {
    try {
      const { token } = request.query;
      const { id } = request.params;

      const result = await this.loginService(String(id), String(token));
      response.cookie("authToken", result.accessToken);
      return response.status(200).json({ success: true, data: { ...result } });
    } catch (error) {
      ErrorHandler(error, request, response);
    }
  };

  public createUserController = async (
    request: Request,
    response: Response
  ) => {
    try {
      const result = await this.createUserService(request.body);

      return response.status(201).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      ErrorHandler(error, request, response);
    }
  };
}
