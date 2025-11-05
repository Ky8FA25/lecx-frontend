import { Gender } from "../enums/enums";

export interface IUser {
  id: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName?: string;
  profileImagePath?: string;
  address?: string;
  dob?: string | Date;
  gender?: Gender;
  walletUser?: number;
}