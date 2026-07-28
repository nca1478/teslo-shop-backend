import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailService } from '../../../application/ports/services/email.service';
import { OtpCode } from '../../../domain/value-objects/otp-code.vo';

@Injectable()
export class NodemailerEmailAdapter implements EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get('email.user'),
                pass: this.configService.get('email.pass'),
            },
            connectionTimeout: 10000,
        });
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        await this.transporter.sendMail({
            from: this.configService.get('email.from'),
            to,
            subject: 'Código de recuperación de contraseña',
            text: `Tu código de verificación es: ${otp}\nVálido por ${OtpCode.EXPIRY_MINUTES} minutos.`,
            html: `<p>Tu código de verificación es: <strong>${otp}</strong></p><p>Válido por ${OtpCode.EXPIRY_MINUTES} minutos.</p>`,
        });
    }

    async sendPasswordChangedEmail(to: string): Promise<void> {
        await this.transporter.sendMail({
            from: this.configService.get('email.from'),
            to,
            subject: 'Contraseña actualizada',
            text: 'Tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, contacta a soporte inmediatamente.',
            html: `<p>Tu contraseña ha sido cambiada exitosamente.</p><p>Si no realizaste este cambio, contacta a soporte inmediatamente.</p>`,
        });
    }
}
