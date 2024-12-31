import PostgresDB from "../config/database/postgres";
import { IUserExistsResponse } from "../users/types/interface";
import { INotificationStatus } from "./types/interface";

class NotificationDb {
  public fetchNotificationStatusQuery = async (status: string) => {
    const query = `SELECT id, name FROM notification_statuses WHERE name = $1`;

    const { rows } = await PostgresDB.query(query, [status]);
    return rows[0] as unknown as INotificationStatus;
  };

  public fetchNotificationTypesQuery = async (type: string) => {
    const query = `SELECT id, name FROM notification_types WHERE name = $1`;

    const { rows } = await PostgresDB.query(query, [type]);
    return rows[0] as unknown as INotificationStatus;
  };

  public createNotificationQuery = async (data: any) => {
    const { query, params } = PostgresDB.formatInsert(
      `INSERT INTO notifications ?`,
      data
    );

    const { rows } = await PostgresDB.query(query, params);
    return rows;
  };

  public getUserByIdQuery = async (id: string) => {
    const query = `SELECT id,email,role FROM users WHERE id = $1`;
    const { rows } = await PostgresDB.query(query, [id]);

    return rows[0] as unknown as IUserExistsResponse;
  };
}

export default NotificationDb;
