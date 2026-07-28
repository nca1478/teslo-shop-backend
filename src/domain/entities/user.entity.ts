export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    isActive: boolean;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
    otpHash?: string | null;
    otpExpiresAt?: Date | null;
    otpAttempts?: number;
}
