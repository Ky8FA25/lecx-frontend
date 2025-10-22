export interface EditUserDto {
  id: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  dob?: Date;
  gender?: number;
  profileImage?: File;
  phoneNumber?: string;
}

