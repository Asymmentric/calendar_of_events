import { UserRoles } from "./enum";

export interface IUserCreateReqObj {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  password?: string;
  role: UserRoles;
  department: string;
  usn: string;
  college: string;

  phone?: stringe | null;
}

export interface IUserEnquiry {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  college: string;
}

export interface IUserExistsResponse {
  id: string;
  email: string;
  role: UserRoles;
}

export interface IAuthToken {
  id: string;
  token: string;
  email: string;
  user_id: string;
  is_used: boolean;
  is_registered: boolean;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IAuthTokenCreate {
  id: string;
  token: string;
  isRegistered: boolean;
  email?: string;
  userId?: string;
}

export interface IUser {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string | null;
  org_id: string;
  department_id: string;
  role: UserRoles;
  college_id: string;
  year?: string | null;
  semester?: string | null;
  degree?: string | null;
  last_active?: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  is_approved: boolean;
  profile_photo?: string | null;
}
