import { IUser } from "./user";

export interface IInstructor {
  instructorId: string;
  bio: string;
  user: IUser; // Liên kết đến interface User FE
}