import { Router, Request, Response } from "express";
import CollegeEnquiryController from "./controller";

const { create } = new CollegeEnquiryController();
const CollegeEnquireRouter = Router();

CollegeEnquireRouter.post("/", (request: Request, response: Response) => {
  create(request, response);
});

export default CollegeEnquireRouter;
