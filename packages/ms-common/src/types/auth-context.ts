import { UserRole } from "../enums/user-role";

export type AuthContext = {
  _id: string;
  email: string;
  role: UserRole;
};
