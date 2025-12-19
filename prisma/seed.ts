import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Load environment variables
import 'dotenv/config';

// Import seed data
import { users } from './data/users';
import { categories } from './data/categories';
import { countries } from './data/countries';
import { products } from './data/products';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Disable SSL for local development
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed process...');

  // 1. Clean existing data
  console.log('🧹 Cleaning existing data...');

  // Delete in order to respect foreign key constraints
  await prisma.orderAddress.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.country.deleteMany();

  // 2. Create users
  console.log('👥 Creating users...');
  await prisma.user.createMany({
    data: users,
  });

  // 3. Create countries
  console.log('🌍 Creating countries...');
  await prisma.country.createMany({
    data: countries,
  });

  // 4. Create categories
  console.log('📂 Creating categories...');
  await prisma.category.createMany({
    data: categories,
  });

  // Get categories for mapping
  const dbCategories = await prisma.category.findMany();
  const categoriesMap = dbCategories.reduce(
    (map, category) => {
      map[category.name.toLowerCase()] = category.id;
      return map;
    },
    {} as Record<string, string>,
  );

  // 5. Create products with images
  console.log('🛍️ Creating products...');
  for (const productData of products) {
    const { images, categoryType, ...product } = productData;

    const dbProduct = await prisma.product.create({
      data: {
        ...product,
        categoryId: categoriesMap[categoryType],
      },
    });

    // Create product images
    const imagesData = images.map((url) => ({
      url,
      productId: dbProduct.id,
    }));

    await prisma.productImage.createMany({
      data: imagesData,
    });
  }

  console.log('✅ Seed completed successfully');
  console.log(`📊 Created:`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${countries.length} countries`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${products.length} products`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
