import { v4 } from "uuid";
import { genSalt, hash } from "bcrypt";

import UserDB from "./db";
import JWTService from "../utils/jwt";
import UserHelper from "./helper";
import Logger from "../utils/logger";
import AnotherError from "../utils/errors/anotherError";
import { IUser, IUserCreateReqObj } from "./types/interface";
import moment from "moment";
import { UserCreationMessage, UserRoles } from "./types/enum";

export default class UsersService extends UserHelper {
  public createMagicLinkService = async (email: string) => {
    const userExists = await this.getUserByEmailQuery(email);
    const isRegistered = !!userExists;

    const authKeyExists = await this.getExistingAuthKey(
      isRegistered ? { userId: userExists?.id } : { email }
    );

    if (authKeyExists) {
      throw new AnotherError(
        "RESOURCE_EXISTS",
        "Magic Link Already Exists. Please check Email"
      );
    }

    const token = await JWTService.sign(
      {
        isRegistered,
        userId: isRegistered ? userExists?.id : "",
        email: isRegistered ? userExists?.email : email,
      },
      "5m"
    );

    if (!token) {
      throw new AnotherError("SOMETHING_WENT_WRONG", "Something went wrong");
    }

    const createAuthTokenObj = { id: v4(), isRegistered, token };

    if (isRegistered) {
      Object.assign(createAuthTokenObj, { userId: userExists?.id });
    } else {
      Object.assign(createAuthTokenObj, { email });
    }

    await this.createAuthTokenQuery(createAuthTokenObj);
    await this.magicLinkNotificationHelper(
      createAuthTokenObj.id,
      email,
      token,
      isRegistered,
      isRegistered ? userExists?.id : undefined
    );
    return token;
  };

  public loginService = async (id: string, token: string) => {
    const decodedToken = await JWTService.verify(token);

    if (!decodedToken) {
      throw new AnotherError("NOT_ALLOWED_ACCESS", "Invalid Token");
    }

    const authToken = await this.getAuthTokenById(id);
    if (!authToken) {
      throw new AnotherError("NOT_ALLOWED_ACCESS", "Invalid Token");
    }

    if (authToken.is_registered) {
      const user = await this.getUserByEmailQuery(authToken.email);
      if (!user) {
        throw new AnotherError("RESOURCE_NOT_FOUND", "User Not Found");
      }

      const accessToken = await JWTService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return { accessToken, is_registered: true };
    }

    const accessToken = await JWTService.sign({
      email: (decodedToken as any).email,
      is_registered: false,
    });

    return { accessToken, is_registered: false };
  };

  public createUserService = async (data: IUserCreateReqObj) => {
    const {
      firstName,
      lastName,
      middleName,
      college,
      department,
      email,
      usn,
      role,
      phone = null,
      password,
    } = data;

    const userExists = await this.getUserByEmailQuery(email);
    if (userExists) {
      throw new AnotherError("RESOURCE_EXISTS", "User Already Exists");
    }

    const passwordSalt = await genSalt(10);

    const hashedPassword = await hash(password ? password : v4(), passwordSalt);

    const userCreateObj: IUser = {
      id: v4(),
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      department_id: department,
      org_id: usn.toLowerCase().trim(),
      college_id: college,
      phone,
      status: false,
      degree: null,
      last_active: null,
      profile_photo: null,
      semester: null,
      year: null,
      is_approved: false,
      created_at: moment().format(),
      updated_at: moment().format(),
    };

    const result = await this.createUserQuery([userCreateObj]);

    const message =
      role === UserRoles.STUDENT
        ? UserCreationMessage.STUDENT
        : UserCreationMessage.GENERAL;

    return { data: result, message };
  };

  public getUserService = async () => {};

  public getAllUsersService = async () => {};

  public updateUserService = async () => {};
}
