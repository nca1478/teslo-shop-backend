export interface EmailService {
    sendOtpEmail(to: string, otp: string): Promise<void>;
    sendPasswordChangedEmail(to: string): Promise<void>;
}
