import PostgresDB from "../config/database/postgres";
import { ICollegeEnquiry, ICollegeEnquiryCreate } from "./types/interface";

class CollegeEnquiryDb {
  public createEnquiryQuery = async (data: ICollegeEnquiry) => {
    const { id, full_name, email, college_name, created_at, updated_at } = data;
    const query = `INSERT INTO college_enquiries (id, full_name, email, college_name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const params = [id, full_name, email, college_name, created_at, updated_at];
    const { rows } = await PostgresDB.query(query, params);

    return rows[0] as unknown as ICollegeEnquiry;
  };
}

export default CollegeEnquiryDb;
