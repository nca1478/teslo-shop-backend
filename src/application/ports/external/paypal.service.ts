export interface PayPalPaymentDetails {
  id: string;
  status: string;
  amount: {
    currency_code: string;
    value: string;
  };
  payer: {
    email_address: string;
    payer_id: string;
  };
}

export interface PayPalService {
  verifyPayment(paymentId: string): Promise<PayPalPaymentDetails>;
  createPayment(
    amount: number,
    currency: string,
  ): Promise<{ id: string; approval_url: string }>;
}
