import { ICollegeEnquiryCreate } from "./types/interface";
import CollegeEnquiryDb from "./db";
import { v4 } from "uuid";
import moment from "moment";

class CollegeEnquiryService extends CollegeEnquiryDb {
  public createEnquiryService = async (data: ICollegeEnquiryCreate) => {
    const { fullName, email, collegeName } = data;

    /**
     * 1. Insert into college_enquiries table
     * 2. Push to queue for notification
     *  2.1 send verification email (Important)
     *  2.2 Send acknowledgement
     *  2.3 Send to  email for request.
     * 3. Response Noted
     */

    const collegeEnuiryCreateObj = {
      id: v4(),
      full_name: fullName,
      email,
      college_name: collegeName,
      created_at: moment().format(),
      updated_at: moment().format(),
    };

    const result = await this.createEnquiryQuery(collegeEnuiryCreateObj);

    return result;
  };
}

export default CollegeEnquiryService;
