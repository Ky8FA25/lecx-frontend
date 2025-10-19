import { UserDto } from "./UserDto";

export abstract class AuthResult {
    AccessToken: string = '';
    RefreshTokenPlain: string = '';
    User: any = '';
    AccessTokenExpiresUtc: string = '';
    RefreshTokenExpiresUtc: string = '';
    ReturnUrl: string = '';

}