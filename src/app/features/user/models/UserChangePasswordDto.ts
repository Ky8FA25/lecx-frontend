export interface UserChangePasswordDto {
    userId: string;          // optional if backend reads from token
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}