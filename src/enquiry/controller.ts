import { Request, Response } from "express";
import CollegeEnquiryService from "./service";

class CollegeEnquiryController extends CollegeEnquiryService {
  public create = async (request: Request, response: Response) => {
    try {
      const { fullName, email, collegeName } = request.body;

      await this.createEnquiryService({ fullName, email, collegeName });

      return response
        .status(201)
        .json({ success: true, message: "Enquiry created successfully" });
    } catch (error) {
      return response
        .status(500)
        .json({ success: false, message: "Something went wrong" });
    }
  };
}

export default CollegeEnquiryController;
