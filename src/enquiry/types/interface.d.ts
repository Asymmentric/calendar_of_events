export interface ICollegeEnquiry {
  id: string;
  full_name: string;
  email: string;
  college_name: string;
  created_at: string;
  updated_at: string;
}

export interface ICollegeEnquiryCreate {
  fullName: string;
  email: string;
  collegeName: string;
}
