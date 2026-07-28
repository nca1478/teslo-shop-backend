import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export class OtpCode {
    static get MAX_ATTEMPTS(): number {
        const envValue = process.env.OTP_MAX_ATTEMPTS;
        if (envValue) {
            const parsed = parseInt(envValue, 10);
            if (!isNaN(parsed) && parsed > 0) return parsed;
        }
        return 5;
    }

    static get EXPIRY_MINUTES(): number {
        const envValue = process.env.OTP_EXPIRY_MINUTES;
        if (envValue) {
            const parsed = parseInt(envValue, 10);
            if (!isNaN(parsed) && parsed > 0) return parsed;
        }
        return 10;
    }

    static generate(): string {
        return String(crypto.randomInt(100_000, 999_999));
    }

    static async hash(plainCode: string): Promise<string> {
        return bcrypt.hash(plainCode, 10);
    }

    static async verify(plainCode: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plainCode, hash);
    }

    static isExpired(expiresAt: Date): boolean {
        return new Date() > expiresAt;
    }

    static getExpiryDate(minutes: number = OtpCode.EXPIRY_MINUTES): Date {
        const date = new Date();
        date.setMinutes(date.getMinutes() + minutes);
        return date;
    }
}
