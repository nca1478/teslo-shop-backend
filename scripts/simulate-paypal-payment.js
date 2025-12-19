const axios = require('axios');
require('dotenv').config();

class PayPalSimulator {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.oauthUrl = process.env.PAYPAL_OAUTH_URL;
    this.ordersUrl = process.env.PAYPAL_ORDERS_URL;
    this.accessToken = null;
  }

  async getAccessToken() {
    try {
      const auth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString('base64');

      const response = await axios.post(
        this.oauthUrl,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.data.access_token;
      console.log('✅ Access token obtenido');
      return this.accessToken;
    } catch (error) {
      console.error(
        '❌ Error obteniendo access token:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async createOrder(amount = '10.00') {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
            description: 'Test order from Teslo Shop',
          },
        ],
      };

      const response = await axios.post(this.ordersUrl, orderData, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Orden PayPal creada:', response.data.id);
      return response.data;
    } catch (error) {
      console.error(
        '❌ Error creando orden PayPal:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async captureOrder(orderId) {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const response = await axios.post(
        `${this.ordersUrl}/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const captureId = response.data.purchase_units[0].payments.captures[0].id;
      console.log('✅ Pago capturado. Transaction ID:', captureId);
      return {
        orderId: response.data.id,
        transactionId: captureId,
        status: response.data.status,
        fullResponse: response.data,
      };
    } catch (error) {
      console.error(
        '❌ Error capturando pago:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async simulateFullPayment(amount = '10.00') {
    console.log('🚀 Iniciando simulación de pago PayPal...\n');

    try {
      // 1. Crear orden en PayPal
      const order = await this.createOrder(amount);
      console.log(`💰 Monto: $${amount} USD`);
      console.log(`🆔 PayPal Order ID: ${order.id}\n`);

      // 2. Simular captura del pago
      const payment = await this.captureOrder(order.id);

      console.log('📋 RESULTADO FINAL:');
      console.log('==================');
      console.log(`PayPal Order ID: ${payment.orderId}`);
      console.log(`Transaction ID: ${payment.transactionId}`);
      console.log(`Status: ${payment.status}`);

      console.log('\n🔧 Para usar en tu endpoint:');
      console.log('============================');
      console.log('POST /payments/set-transaction-id');
      console.log(
        JSON.stringify(
          {
            orderId: 'TU_ORDER_ID_DE_TESLO', // Reemplaza con tu orderId real
            transactionId: payment.transactionId,
          },
          null,
          2,
        ),
      );

      return payment;
    } catch (error) {
      console.error('💥 Error en simulación:', error.message);
    }
  }
}

// Ejecutar simulación
async function main() {
  const simulator = new PayPalSimulator();

  // Puedes cambiar el monto aquí
  const amount = process.argv[2] || '10.00';

  await simulator.simulateFullPayment(amount);
}

if (require.main === module) {
  main();
}

module.exports = PayPalSimulator;
