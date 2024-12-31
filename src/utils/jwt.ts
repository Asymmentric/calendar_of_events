import JWT from "jsonwebtoken";
import AnotherError from "./errors/anotherError";
import Logger from "./logger";
import { variables } from "../config/envLoader";

export default class JWTService {
  private static secret: string = variables.JWT_SECRET;

  public static async sign(payload: any, expiry: string = "7d") {
    return JWT.sign(payload, JWTService.secret, {
      expiresIn: expiry,
      algorithm: "HS512",
    });
  }

  public static async verify(token: any) {
    try {
      const decodedToken = await JWT.verify(token, JWTService.secret);
      return decodedToken;
    } catch (error) {
      Logger.Log?.error(error);
      return false;
    }
  }
}
