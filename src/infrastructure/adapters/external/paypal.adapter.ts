import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    PayPalService,
    PayPalPaymentDetails,
} from '../../../application/ports/external/paypal.service';

@Injectable()
export class PayPalAdapter implements PayPalService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly baseUrl: string;
    private readonly isTestMode: boolean;

    constructor(private readonly configService: ConfigService) {
        this.clientId = this.configService.get('PAYPAL_CLIENT_ID') || '';
        this.clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET') || '';
        this.baseUrl =
            this.configService.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com';
        this.isTestMode = this.configService.get('PAYPAL_MOCK_PAYMENTS') === 'true';
    }

    async verifyPayment(paymentId: string): Promise<PayPalPaymentDetails> {
        // En modo de desarrollo, simular respuesta exitosa para transaction IDs de prueba
        if (this.isTestMode && this.isTestTransactionId(paymentId)) {
            return this.createMockPaymentDetails(paymentId, 999999);
        }

        const accessToken = await this.getAccessToken();

        const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${paymentId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`PayPal API error: ${response.statusText}`);
        }

        const paymentData = (await response.json()) as {
            id: string;
            status: string;
            purchase_units: Array<{
                amount: {
                    currency_code: string;
                    value: string;
                };
            }>;
            payer: {
                email_address: string;
                payer_id: string;
            };
        };

        return {
            id: paymentData.id,
            status: paymentData.status,
            amount: paymentData.purchase_units[0].amount,
            payer: paymentData.payer,
        };
    }

    async createPayment(
        amount: number,
        currency: string = 'USD',
    ): Promise<{ id: string; approval_url: string }> {
        const accessToken = await this.getAccessToken();

        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: currency,
                        value: amount.toFixed(2),
                    },
                },
            ],
            application_context: {
                return_url: `${this.configService.get('FRONTEND_URL')}/checkout/success`,
                cancel_url: `${this.configService.get('FRONTEND_URL')}/checkout/cancel`,
            },
        };

        const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error(`PayPal API error: ${response.statusText}`);
        }

        const order = (await response.json()) as {
            id: string;
            links: Array<{ rel: string; href: string }>;
        };
        const approvalUrl = order.links.find((link) => link.rel === 'approve')?.href;

        if (!approvalUrl) {
            throw new Error('PayPal approval URL not found in response');
        }

        return {
            id: order.id,
            approval_url: approvalUrl,
        };
    }

    private async getAccessToken(): Promise<string> {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            throw new Error(`PayPal auth error: ${response.statusText}`);
        }

        const data = (await response.json()) as { access_token: string };
        return data.access_token;
    }

    private isTestTransactionId(paymentId: string): boolean {
        // Detectar transaction IDs de prueba por patrones comunes
        const testPatterns = [
            /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/i, // Formato UUID-like
            /^PAYPAL_TEST_/i, // Prefijo de prueba
            /^TXN_/i, // Prefijo genérico
            /^pi_test_/i, // Formato Stripe de prueba
        ];

        return testPatterns.some((pattern) => pattern.test(paymentId));
    }

    private createMockPaymentDetails(paymentId: string, amount?: number): PayPalPaymentDetails {
        return {
            id: paymentId,
            status: 'COMPLETED',
            amount: {
                currency_code: 'USD',
                value: amount ? amount.toFixed(2) : '29.99', // Usar el monto real o por defecto
            },
            payer: {
                email_address: 'test@example.com',
                payer_id: 'TEST_PAYER_ID',
            },
        };
    }
}
