import PostgresDB from "../config/database/postgres";
import { TimeUnit } from "./types/enum";
import {
  IAuthToken,
  IAuthTokenCreate,
  IUser,
  IUserExistsResponse,
} from "./types/interface";

export default class UserDB {
  public getUserByEmailQuery = async (email: string) => {
    const query = `SELECT id,email,role FROM users WHERE email=$1`;

    const params = [email];

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
                        ($1, $2, $3, false, false, now() + interval '${interval}', now(), now())
                    RETURNING *
            `;
    const params = [id, isRegistered ? userId : email, token];

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
}
