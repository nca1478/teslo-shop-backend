export interface AuthService {
    hashPassword(password: string): Promise<string>;
    comparePasswords(password: string, hashedPassword: string): Promise<boolean>;
    generateJwtToken(payload: any): string;
    verifyJwtToken(token: string): any;
}
