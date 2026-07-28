import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@teslohop.com',
    mailersendApiKey: process.env.MAILERSEND_API_KEY,
    mailersendFromEmail: process.env.MAILERSEND_FROM_EMAIL,
    mailersendFromName: process.env.MAILERSEND_FROM_NAME || 'Teslo Shop',
}));
