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
import { IPaginatedQuery } from "../types/interface";
import { buildFilterQuery, buildSortQuery, prepareQuery } from "./utils";

export default class UsersService extends UserHelper {
    private userDB = new UserDB();

    public createMagicLinkService = async (email: string) => {
        const userExists = await this.checkExistingUserQuery(email);
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
                is_registered: isRegistered,
                user_id: isRegistered ? userExists?.id : "",
                email: isRegistered ? userExists?.email : email,
            },
            "5m"
        );

        if (!token) {
            throw new AnotherError(
                "SOMETHING_WENT_WRONG",
                "Something went wrong"
            );
        }

        const createAuthTokenObj = { id: v4(), isRegistered, token };

        if (isRegistered) {
            Object.assign(createAuthTokenObj, {
                userId: userExists?.id,
                email,
            });
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
        return process.env.NODE_ENV === "dev"
            ? { token, id: createAuthTokenObj.id }
            : undefined;
    };

    public loginService = async (id: string, token: string) => {
        const decodedToken = (await JWTService.verify(token)) as {
            email: string;
            is_registered: boolean;
            user_id: string;
        };

        if (!decodedToken) {
            throw new AnotherError("NOT_ALLOWED_ACCESS", "Invalid Token");
        }

        const authToken = await this.getAuthTokenById(id);
        if (!authToken) {
            throw new AnotherError("NOT_ALLOWED_ACCESS", "Invalid Token");
        }

        await this.updateAuthTokenQuery(authToken.id);

        if (authToken.is_registered) {
            const user = await this.checkExistingUserQuery(decodedToken.email);
            if (!user) {
                throw new AnotherError("RESOURCE_NOT_FOUND", "User Not Found");
            }

            const accessToken = await JWTService.sign({
                user_id: user.id,
                email: user.email,
                role: user.role,
                college_id: user.college_id,
                department_id: user.department_id,
                org_id: user.org_id,
                is_registered: true,
            });

            return { accessToken, isRegistered: true };
        }

        const accessToken = await JWTService.sign({
            email: (decodedToken as any).email,
            is_registered: false,
        });

        return { accessToken, isRegistered: false };
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

        const userExists = await this.checkExistingUserQuery(email, usn);
        if (userExists) {
            throw new AnotherError("RESOURCE_EXISTS", "User Already Exists");
        }

        const passwordSalt = await genSalt(10);

        const hashedPassword = await hash(
            password ? password : v4(),
            passwordSalt
        );

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

        const accessToken = await JWTService.sign({
            user_id: userCreateObj.id,
            email: userCreateObj.email,
            role: userCreateObj.role,
            college_id: userCreateObj.college_id,
            department_id: userCreateObj.department_id,
            org_id: userCreateObj.org_id,
            is_registered: true,
        });

        return { data: result, message, accessToken };
    };

    public getUserByIdService = async (
        id: string,
        user_id: string,
        college_id: string,
        role: UserRoles
    ) => {
        const isGetMe = id === user_id;
        if (!isGetMe && role === UserRoles.STUDENT) {
            throw new AnotherError("NOT_ALLOWED_ACCESS", "Not Allowed");
        }

        const user = await this.getUserByIdQuery(id, college_id);
        return user;
    };

    public getAllUsersService = async (
        user: {
            user_id: string;
            college_id: string;
            role: UserRoles;
            department_id: string;
        },
        filters: any,
        meta: IPaginatedQuery
    ) => {
        const {
            cursor_id,
            cursor,
            limit = 10,
            search,
            sort_order = "ASC",
            sort_by = "created_at",
        } = meta;

        Object.assign(filters, {
            department: filters?.department || user.department_id,
        });

        if (
            [UserRoles.STUDENT, UserRoles.FACULTY, UserRoles.HOD].includes(
                user.role
            ) &&
            filters.department !== user.department_id
        ) {
            throw new AnotherError("NOT_ALLOWED_ACCESS", "Not Allowed");
        }

        const { filterQuery, params, sortOrderByQuery } = prepareQuery(
            { ...filters, college: user.college_id },
            cursor_id,
            cursor,
            sort_order,
            sort_by
        );

        const result = await this.userDB.getUsersListQuery(
            limit,
            filterQuery,
            params,
            sortOrderByQuery ?? ""
        );

        return result;
    };

    public updateUserService = async (
        college_id: string,
        role: UserRoles,
        id: string
    ) => {
        if (role === UserRoles.STUDENT) {
            throw new AnotherError("NOT_ALLOWED_ACCESS", "Not Allowed");
        }

        const user = await this.getUserByIdQuery(id, college_id);
        if (!user) {
            throw new AnotherError("RESOURCE_NOT_FOUND", "User Not Found");
        }

        // To approve non-students
        if (
            [
                UserRoles.FACULTY,
                UserRoles.HOD,
                UserRoles.DEAN,
                UserRoles.PRINCIPAL,
            ].includes(user.role)
        ) {
            if (role !== UserRoles.ADMIN) {
                throw new AnotherError("NOT_ALLOWED_ACCESS", "Not Allowed");
            }
            return this.approveUserQuery(id);
        }

        // To approve student

        return this.approveUserQuery(id);
    };

    // public listUnApprovedUsers =
}
