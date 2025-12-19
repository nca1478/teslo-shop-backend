const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkOrders() {
  try {
    console.log('🔍 Verificando órdenes existentes...\n');

    // Obtener todas las órdenes
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        OrderItem: {
          include: {
            product: {
              select: {
                title: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    if (orders.length === 0) {
      console.log('❌ No hay órdenes en la base de datos');
      console.log(
        '💡 Necesitas crear una orden primero para probar los pagos\n',
      );

      // Verificar si hay usuarios
      const users = await prisma.user.findMany({
        take: 1,
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (users.length === 0) {
        console.log('❌ Tampoco hay usuarios en la base de datos');
        console.log('💡 Necesitas registrar un usuario primero\n');
        return;
      }

      console.log('✅ Usuario encontrado para crear orden de prueba:');
      console.log(`   - ID: ${users[0].id}`);
      console.log(`   - Nombre: ${users[0].name}`);
      console.log(`   - Email: ${users[0].email}\n`);

      // Verificar si hay productos
      const products = await prisma.product.findMany({
        take: 1,
        select: {
          id: true,
          title: true,
          price: true,
        },
      });

      if (products.length === 0) {
        console.log('❌ No hay productos en la base de datos');
        console.log('💡 Necesitas crear productos primero\n');
        return;
      }

      console.log('✅ Producto encontrado para crear orden de prueba:');
      console.log(`   - ID: ${products[0].id}`);
      console.log(`   - Título: ${products[0].title}`);
      console.log(`   - Precio: $${products[0].price}\n`);

      console.log(
        '🚀 ¿Quieres que cree una orden de prueba? (Ejecuta: node scripts/create-test-order.js)',
      );
    } else {
      console.log(`✅ Encontradas ${orders.length} órdenes:\n`);

      orders.forEach((order, index) => {
        console.log(`${index + 1}. ORDEN ID: ${order.id}`);
        console.log(`   - Usuario: ${order.user.name} (${order.user.email})`);
        console.log(`   - Total: $${order.total}`);
        console.log(`   - Items: ${order.itemsInOrder}`);
        console.log(`   - Pagada: ${order.isPaid ? '✅ Sí' : '❌ No'}`);
        console.log(
          `   - Transaction ID: ${order.transactionId || 'Sin asignar'}`,
        );
        console.log(`   - Creada: ${order.createdAt.toLocaleString()}`);

        if (order.OrderItem.length > 0) {
          console.log(`   - Productos:`);
          order.OrderItem.forEach((item) => {
            console.log(
              `     * ${item.product.title} (x${item.quantity}) - $${item.price}`,
            );
          });
        }
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
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
