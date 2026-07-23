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

  // 1. Upsert users (keyed by email)
  console.log('👥 Seeding users...');
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: user.password,
        role: user.role,
      },
      create: user,
    });
  }

  // 2. Upsert countries (keyed by id)
  console.log('🌍 Seeding countries...');
  for (const country of countries) {
    await prisma.country.upsert({
      where: { id: country.id },
      update: { name: country.name },
      create: country,
    });
  }

  // 3. Upsert categories (keyed by name)
  console.log('📂 Seeding categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Get categories for mapping
  const dbCategories = await prisma.category.findMany();
  const categoriesMap = dbCategories.reduce(
    (map, category) => {
      map[category.name.toLowerCase()] = category.id;
      return map;
    },
    {} as Record<string, string>,
  );

  // 4. Upsert products (keyed by slug) with their images
  console.log('🛍️ Seeding products...');
  for (const productData of products) {
    const { images, categoryType, ...product } = productData;

    const dbProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...product,
        categoryId: categoriesMap[categoryType],
      },
      create: {
        ...product,
        categoryId: categoriesMap[categoryType],
      },
    });

    // Replace this product's images so they stay in sync with the seed data
    await prisma.productImage.deleteMany({
      where: { productId: dbProduct.id },
    });
    await prisma.productImage.createMany({
      data: images.map((url) => ({ url, productId: dbProduct.id })),
    });
  }

  console.log('✅ Seed completed successfully');
  console.log(`📊 Seeded:`);
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
