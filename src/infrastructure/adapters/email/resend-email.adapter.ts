import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailService } from '../../../application/ports/services/email.service';
import { OtpCode } from '../../../domain/value-objects/otp-code.vo';

@Injectable()
export class ResendEmailAdapter implements EmailService {
    private resend: Resend;

    constructor(private readonly configService: ConfigService) {
        this.resend = new Resend(this.configService.get('email.apiKey'));
    }

    private getFrom(): string {
        return this.configService.get<string>('email.from') || 'mailjet1478@gmail.com';
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        await this.resend.emails.send({
            from: this.getFrom(),
            to,
            subject: 'Código de recuperación de contraseña',
            text: `Tu código de verificación es: ${otp}\nVálido por ${OtpCode.EXPIRY_MINUTES} minutos.`,
            html: `<p>Tu código de verificación es: <strong>${otp}</strong></p><p>Válido por ${OtpCode.EXPIRY_MINUTES} minutos.</p>`,
        });
    }

    async sendPasswordChangedEmail(to: string): Promise<void> {
        await this.resend.emails.send({
            from: this.getFrom(),
            to,
            subject: 'Contraseña actualizada',
            text: 'Tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, contacta a soporte inmediatamente.',
            html: `<p>Tu contraseña ha sido cambiada exitosamente.</p><p>Si no realizaste este cambio, contacta a soporte inmediatamente.</p>`,
        });
    }
}
