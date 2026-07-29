import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailService } from '../../../application/ports/services/email.service';
import { OtpCode } from '../../../domain/value-objects/otp-code.vo';

@Injectable()
export class ResendEmailAdapter implements EmailService {
    private readonly logger = new Logger(ResendEmailAdapter.name);
    private resend: Resend;
    private fromEmail: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('email.resendApiKey');
        const fromEmail = this.configService.get<string>('email.resendFromEmail');

        if (!apiKey) {
            throw new Error(
                'Resend configuration incomplete: RESEND_API_KEY is required',
            );
        }

        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail ?? 'Teslo Shop <noreply@teslohop.com>';
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const { error } = await this.resend.emails.send({
            from: this.fromEmail,
            to: [to],
            subject: 'Código de recuperación de contraseña',
            text: `Tu código de verificación es: ${otp}\nVálido por ${OtpCode.EXPIRY_MINUTES} minutos.`,
            html: `<p>Tu código de verificación es: <strong>${otp}</strong></p><p>Válido por ${OtpCode.EXPIRY_MINUTES} minutos.</p>`,
        });

        if (error) {
            this.logger.error(`Resend API error: ${JSON.stringify(error)}`);
            throw new Error(`Resend email send failed: ${error.message}`);
        }
    }

    async sendPasswordChangedEmail(to: string): Promise<void> {
        const { error } = await this.resend.emails.send({
            from: this.fromEmail,
            to: [to],
            subject: 'Contraseña actualizada',
            text: 'Tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, contacta a soporte inmediatamente.',
            html: '<p>Tu contraseña ha sido cambiada exitosamente.</p><p>Si no realizaste este cambio, contacta a soporte inmediatamente.</p>',
        });

        if (error) {
            this.logger.error(`Resend API error: ${JSON.stringify(error)}`);
            throw new Error(`Resend email send failed: ${error.message}`);
        }
    }
}
