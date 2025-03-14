import { Request, Response, NextFunction } from "express";
import AnotherError from "./errors/anotherError";
import JWTService from "./jwt";
import { ErrorHandler } from "./errors/errorHandler";
import UserDB from "../users/db";

const { checkExistingUserQuery } = new UserDB();
export const AuthHandler = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const authorization = request.headers.authorization;
        if (!authorization) {
            throw new AnotherError(
                "INVALID_CREDENTIALS",
                "Authorization token not found"
            );
        }

        const token = authorization.split(" ")[1];
        if (!token) {
            throw new AnotherError(
                "INVALID_CREDENTIALS",
                "Authorization token not found"
            );
        }

        const decodedToken = (await JWTService.verify(token)) as {
            email: string;
            is_registered: boolean;
            user_id: string;
        };

        if (!decodedToken) {
            throw new AnotherError("NOT_ALLOWED_ACCESS", "Invalid Token");
        }

        const user = await checkExistingUserQuery(
            decodedToken.email.toLowerCase()
        );

        if (user && !decodedToken.is_registered) {
            throw new AnotherError("NOT_ALLOWED_ACCESS", "Invalid Token");
        }

        Object.assign(request.body, { authData: decodedToken });

        next();
    } catch (error) {
        ErrorHandler(error, request, response);
    }
};
