const crypto = require('crypto');

class TestTransactionGenerator {
  static generatePayPalTransactionId() {
    // Formato típico de PayPal: 8-4-4-4-12 caracteres
    const segments = [
      crypto.randomBytes(4).toString('hex').toUpperCase(),
      crypto.randomBytes(2).toString('hex').toUpperCase(),
      crypto.randomBytes(2).toString('hex').toUpperCase(),
      crypto.randomBytes(2).toString('hex').toUpperCase(),
      crypto.randomBytes(6).toString('hex').toUpperCase(),
    ];
    return segments.join('-');
  }

  static generateStripeTransactionId() {
    // Formato típico de Stripe: pi_xxxxxxxxxxxxxxxxxxxxxxxxxx
    return 'pi_' + crypto.randomBytes(14).toString('hex');
  }

  static generateTestOrder() {
    return {
      orderId: crypto.randomUUID(),
      paypalTransactionId: this.generatePayPalTransactionId(),
      stripeTransactionId: this.generateStripeTransactionId(),
      amount: (Math.random() * 100 + 10).toFixed(2),
      currency: 'USD',
      timestamp: new Date().toISOString(),
    };
  }

  static printTestData() {
    console.log('🧪 GENERADOR DE DATOS DE PRUEBA PARA PAGOS');
    console.log('==========================================\n');

    const testOrder = this.generateTestOrder();

    console.log('📦 ORDEN DE PRUEBA:');
    console.log('-------------------');
    console.log(`Order ID: ${testOrder.orderId}`);
    console.log(`Amount: $${testOrder.amount} ${testOrder.currency}`);
    console.log(`Timestamp: ${testOrder.timestamp}\n`);

    console.log('💳 TRANSACTION IDs DE PRUEBA:');
    console.log('-----------------------------');
    console.log(`PayPal Transaction ID: ${testOrder.paypalTransactionId}`);
    console.log(`Stripe Transaction ID: ${testOrder.stripeTransactionId}\n`);

    console.log('🔧 PARA ENDPOINT set-transaction-id:');
    console.log('====================================');
    console.log('POST /payments/set-transaction-id');
    console.log(
      JSON.stringify(
        {
          orderId: testOrder.orderId,
          transactionId: testOrder.paypalTransactionId,
        },
        null,
        2,
      ),
    );

    console.log('\n🔧 PARA ENDPOINT paypal/check:');
    console.log('==============================');
    console.log('POST /payments/paypal/check');
    console.log(
      JSON.stringify(
        {
          orderId: testOrder.orderId,
          paypalTransactionId: testOrder.paypalTransactionId,
        },
        null,
        2,
      ),
    );

    console.log('\n📋 MÚLTIPLES TRANSACTION IDs:');
    console.log('=============================');
    for (let i = 1; i <= 5; i++) {
      console.log(`${i}. PayPal: ${this.generatePayPalTransactionId()}`);
    }

    return testOrder;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  TestTransactionGenerator.printTestData();
}

module.exports = TestTransactionGenerator;
