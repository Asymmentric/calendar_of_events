import { request, response, Router } from "express";
import UserController from "./controller";

const { createMagicLinkController, loginController, createUserController } =
  new UserController();

const UserRouter = Router();

UserRouter.get("/");
UserRouter.post("/", (request, response) => {
  createUserController(request, response);
});

export const AuthRouter = Router();

AuthRouter.post("/magic-link", (request, response) => {
  createMagicLinkController(request, response);
});

AuthRouter.get("/magic-link/:id", (request, response) => {
  loginController(request, response);
});

export default UserRouter;
