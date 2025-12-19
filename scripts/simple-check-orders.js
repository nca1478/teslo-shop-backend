const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrders() {
  try {
    console.log('🔍 Verificando órdenes existentes...\n');

    // Obtener todas las órdenes
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        total: true,
        isPaid: true,
        transactionId: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    if (orders.length === 0) {
      console.log('❌ No hay órdenes en la base de datos');
      console.log(
        '💡 Necesitas crear una orden primero para probar los pagos\n',
      );

      // Verificar si hay usuarios
      const userCount = await prisma.user.count();
      console.log(`👥 Usuarios en la base de datos: ${userCount}`);

      if (userCount === 0) {
        console.log(
          '❌ No hay usuarios. Necesitas registrar un usuario primero.',
        );
      }
    } else {
      console.log(
        `✅ Encontradas ${orders.length} órdenes (mostrando las 5 más recientes):\n`,
      );

      orders.forEach((order, index) => {
        console.log(`${index + 1}. ORDEN ID: ${order.id}`);
        console.log(`   - Usuario: ${order.user.name} (${order.user.email})`);
        console.log(`   - Total: $${order.total}`);
        console.log(`   - Pagada: ${order.isPaid ? '✅ Sí' : '❌ No'}`);
        console.log(
          `   - Transaction ID: ${order.transactionId || 'Sin asignar'}`,
        );
        console.log(`   - Creada: ${order.createdAt.toLocaleString()}`);
        console.log('');
      });

      // Mostrar órdenes sin pagar para testing
      const unpaidOrders = orders.filter((order) => !order.isPaid);
      if (unpaidOrders.length > 0) {
        console.log('💳 ÓRDENES DISPONIBLES PARA TESTING DE PAGOS:');
        console.log('==============================================');
        unpaidOrders.forEach((order, index) => {
          console.log(`${index + 1}. Order ID: ${order.id}`);
          console.log(`   Total: $${order.total}`);
          console.log(`   Usuario: ${order.user.name}\n`);
        });

        console.log('🔧 EJEMPLO PARA POSTMAN:');
        console.log('========================');
        console.log('POST /payments/paypal/check');
        console.log(
          JSON.stringify(
            {
              orderId: unpaidOrders[0].id,
              paypalTransactionId: 'EF68DCEA-CCD3-E05D-696D-EDDC7FE9BED3',
            },
            null,
            2,
          ),
        );
      } else {
        console.log('ℹ️  Todas las órdenes ya están pagadas.');
        console.log('💡 Puedes crear una nueva orden para testing.');
      }
    }
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verifica que PostgreSQL esté corriendo en el puerto 5433');
    console.log('2. Verifica las credenciales en el archivo .env');
    console.log('3. Ejecuta: npx prisma db push (para sincronizar el esquema)');
  } finally {
    await prisma.$disconnect();
  }
}

// Cargar variables de entorno
require('dotenv').config();
checkOrders();
