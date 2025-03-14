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

            return response.status(200).json({
                success: true,
                data: [result],
                message: "Magic Link Sent",
            });
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
            return response
                .status(200)
                .json({ success: true, data: [{ ...result }] });
        } catch (error) {
            ErrorHandler(error, request, response);
        }
    };

    public createUserController = async (
        request: Request,
        response: Response
    ) => {
        try {
            const { is_registered } = request.body;
            if (is_registered) {
                throw new AnotherError(
                    "RESOURCE_EXISTS",
                    "User Already Exists"
                );
            }

            const result = await this.createUserService(request.body);

            return response.status(201).json({
                success: true,
                message: result.message,
                data: [{ accessToken: result.accessToken }],
            });
        } catch (error) {
            ErrorHandler(error, request, response);
        }
    };

    public getMeController = async (request: Request, response: Response) => {
        try {
            const { user_id, college_id, role } = request.body;
            const result = await this.getUserByIdService(
                user_id,
                user_id,
                college_id,
                role
            );
            return response
                .status(200)
                .json({ success: true, data: [{ ...result }] });
        } catch (error) {
            ErrorHandler(error, request, response);
        }
    };

    public getUserByIdController = async (
        request: Request,
        response: Response
    ) => {
        try {
            const { user_id, college_id, role } = request.body;
            const { id } = request.params;
            const result = await this.getUserByIdService(
                id,
                user_id,
                college_id,
                role
            );
            return response
                .status(200)
                .json({ success: true, data: { ...result } });
        } catch (error) {
            ErrorHandler(error, request, response);
        }
    };

    public getAllUsersController = async (
        request: Request,
        response: Response
    ) => {
        try {
            const {
                cursor_id,
                cursor,
                limit = 10,
                search,
                sort_order = "ASC",
                sort_by = "created_at",
                ...filters
            } = request.query;
            const { college_id, role, user_id, department_id } =
                request.body.authData;
            const meta = {
                cursor_id,
                cursor,
                limit: Number(limit),
                search: String(search),
                sort_order: String(sort_order),
                sort_by: String(sort_by),
            };
            const result = await this.getAllUsersService(
                { college_id, role, user_id, department_id },
                filters,
                meta
            );
            return response.status(200).json({ success: true, data: result });
        } catch (error) {
            ErrorHandler(error, request, response);
        }
    };
}
