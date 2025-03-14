import { request, response, Router } from "express";
import UserController from "./controller";
import { AuthHandler } from "../utils/middleware";
import { get } from "lodash";

const {
    createMagicLinkController,
    loginController,
    createUserController,
    getMeController,
    getUserByIdController,
    getAllUsersController,
} = new UserController();

const UserRouter = Router();

UserRouter.use(AuthHandler);

UserRouter.get("/me", (request, response) => {
    getMeController(request, response);
});

UserRouter.get("/:id", (request, response) => {
    getUserByIdController(request, response);
});

UserRouter.get("/", (request, response) => {
    getAllUsersController(request, response);
});

UserRouter.post("/", (request, response) => {
    createUserController(request, response);
});

UserRouter.patch("/approve/:id", (request, response) => {});

export const AuthRouter = Router();

AuthRouter.post("/magic-link", (request, response) => {
    createMagicLinkController(request, response);
});

AuthRouter.get("/magic-link/:id", (request, response) => {
    loginController(request, response);
});

export default UserRouter;
