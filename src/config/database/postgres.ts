import pg, { Pool } from "pg";
import { variables } from "../envLoader";

export default class PostgresDB {
  private static pool: Pool;

  constructor() {
    const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } = variables;

    PostgresDB.pool = new pg.Pool({
      user: DB_USER,
      host: DB_HOST,
      database: DB_NAME,
      password: DB_PASSWORD,
      port: parseInt(String(DB_PORT)),
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  static query = async (query: string, params?: any) => {
    const result = await PostgresDB.pool.query(query, params);
    return result;
  };

  static formatInsert = (query: string, data: Array<object>) => {
    // generating column names
    const keys = Object.keys(data[0]);

    // generating placeholders ((Length of array)x(Object index)+)
    const placeholders = data
      .map((i, index) => {
        return `(${Object.values(i).map(
          (item, count) => `$${data.length * (index + 1) + count}`
        )})`;
      })
      .join(",");

    const values = `(${keys}) VALUES ${placeholders}`;

    const params: Array<string> = [];
    data.map((item) =>
      Object.values(item).map((i) => {
        params.push(i);
      })
    );

    const result = query.replace("?", values);
    console.log(result);
    return { query: result, params };
  };
}
