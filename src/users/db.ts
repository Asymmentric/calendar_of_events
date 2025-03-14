import PostgresDB from "../config/database/postgres";
import { TimeUnit } from "./types/enum";
import {
    IAuthToken,
    IAuthTokenCreate,
    IUser,
    IUserExistsResponse,
} from "./types/interface";

export default class UserDB {
    public checkExistingUserQuery = async (email: string, org_id?: string) => {
        const where = org_id ? `email = $1 OR org_id = $2` : `email = $1`;
        const query = `
              SELECT 
                id,
                email,
                role, 
                college_id, 
                department_id, 
                org_id 
              FROM 
                users 
              WHERE 
                ${where}`;

        const params = org_id ? [email, org_id] : [email];

        const { rows } = await PostgresDB.query(query, params);

        return rows[0] as unknown as IUserExistsResponse;
    };

    public createAuthTokenQuery = async (data: IAuthTokenCreate) => {
        const { id, isRegistered, userId, email, token } = data;

        const interval = `5 ${TimeUnit.MINUTE}`;

        let query = `INSERT INTO
                        auth_tokens
                        (id, ${
                            isRegistered ? "user_id" : "email"
                        }, token, is_used, is_registered, expires_at, created_at, updated_at)
                    VALUES
                        ($1, $2, $3, false, $4, now() + interval '${interval}', now(), now())
                    RETURNING *
            `;
        const params = [id, isRegistered ? userId : email, token, isRegistered];

        const { rows } = await PostgresDB.query(query, params);

        return rows[0] as unknown as IAuthToken;
    };

    public getExistingAuthKey = async ({
        userId = "",
        email = "",
    }: {
        userId?: string;
        email?: string;
    }) => {
        const query = `
            SELECT *
            FROM auth_tokens
            WHERE 
              is_used=false
              AND 
              expires_at > now()
              AND
              ${userId ? `user_id= $1` : `email= $1`}
            ORDER BY created_at DESC
            LIMIT 1
    `;
        const params = userId ? [userId] : [email];
        const { rows } = await PostgresDB.query(query, params);

        return rows[0] as unknown as IAuthToken;
    };

    public getAuthTokenById = async (id: string) => {
        const query = `SELECT * FROM auth_tokens WHERE id= $1 AND is_used=false AND expires_at > now()`;
        const { rows } = await PostgresDB.query(query, [id]);

        return rows[0] as unknown as IAuthToken;
    };

    public createUserQuery = async (data: IUser[]) => {
        const { query, params } = PostgresDB.formatInsert(
            `INSERT INTO users ? RETURNING *`,
            data
        );

        const { rows } = await PostgresDB.query(query, params);

        return rows as unknown as IUser[];
    };

    public getUserByIdQuery = async (id: string, college_id: string) => {
        const query = `
            SELECT 
              id,
              first_name,
              middle_name,
              last_name,
              email,
              phone,
              org_id,
              (SELECT JSON_BUILD_OBJECT('department_id',id,'department_name',name) FROM departments WHERE id = users.department_id) AS department,
              role,
              (SELECT JSON_BUILD_OBJECT('college_id',id,'college_name',name) FROM colleges WHERE id = users.college_id) AS college,
              year,
              semester,
              degree,
              last_active,
              status,
              created_at,
              updated_at,
              is_approved,
              profile_photo
            FROM 
              users 
            WHERE 
              id = $1
              AND
              deleted_at IS NULL
              AND
              college_id = $2
              `;
        const { rows } = await PostgresDB.query(query, [id, college_id]);

        return rows[0] as unknown as IUser;
    };

    public updateAuthTokenQuery = async (id: string) => {
        const query = `UPDATE auth_tokens SET is_used = true WHERE id = $1`;
        const { rows } = await PostgresDB.query(query, [id]);
        return rows;
    };

    public getUsersListQuery = async (
        limit: number,
        filters: string,
        params: any[],
        sort: string
    ) => {
        const query = `SELECT 
              id,
              first_name,
              middle_name,
              last_name,
              email,
              phone,
              org_id,
              (SELECT JSON_BUILD_OBJECT('department_id',id,'department_name',name) FROM departments WHERE id = u.department_id) AS department,
              role,
              (SELECT JSON_BUILD_OBJECT('college_id',id,'college_name',name) FROM colleges WHERE id = u.college_id) AS college,
              year,
              semester,
              degree,
              last_active,
              status,
              created_at,
              updated_at,
              is_approved,
              profile_photo 
            FROM users u
            ${filters}
            ${sort}
            LIMIT ${limit}`;
        const { rows } = await PostgresDB.query(query, params);
        return rows;
    };

    public approveUserQuery = async (id: string) => {
        const query = `UPDATE users SET is_approved = true, updated_at = now() WHERE id = $1`;
        const { rows } = await PostgresDB.query(query, [id]);
        return rows;
    };
}
