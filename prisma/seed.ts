import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Shirts' },
      update: {},
      create: { name: 'Shirts' },
    }),
    prisma.category.upsert({
      where: { name: 'Pants' },
      update: {},
      create: { name: 'Pants' },
    }),
    prisma.category.upsert({
      where: { name: 'Hoodies' },
      update: {},
      create: { name: 'Hoodies' },
    }),
    prisma.category.upsert({
      where: { name: 'Hats' },
      update: {},
      create: { name: 'Hats' },
    }),
  ]);

  // Create countries
  const countries = await Promise.all([
    prisma.country.upsert({
      where: { id: 'US' },
      update: {},
      create: { id: 'US', name: 'United States' },
    }),
    prisma.country.upsert({
      where: { id: 'CA' },
      update: {},
      create: { id: 'CA', name: 'Canada' },
    }),
    prisma.country.upsert({
      where: { id: 'MX' },
      update: {},
      create: { id: 'MX', name: 'Mexico' },
    }),
  ]);

  // Create admin user
  const hashedPassword = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@teslo.com' },
    update: {},
    create: {
      email: 'admin@teslo.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@teslo.com' },
    update: {},
    create: {
      email: 'user@teslo.com',
      name: 'Regular User',
      password: hashedPassword,
      role: 'user',
    },
  });

  // Create sample products
  const products = [
    {
      title: "Men's Chill Crew Neck Sweatshirt",
      description:
        "The Men's Chill Crew Neck Sweatshirt has a premium, relaxed fit made from a cotton and polyester blend.",
      inStock: 7,
      price: 75,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      slug: 'mens_chill_crew_neck_sweatshirt',
      tags: ['sweatshirt'],
      gender: 'men',
      categoryId: categories[2].id, // Hoodies
      images: ['1740176-00-A_0_2000.jpg', '1740176-00-A_1.jpg'],
    },
    {
      title: "Men's Quilted Shirt Jacket",
      description:
        "The Men's Quilted Shirt Jacket features a uniquely fit, quilted design.",
      inStock: 5,
      price: 200,
      sizes: ['XS', 'S', 'M', 'XL', 'XXL'],
      slug: 'mens_quilted_shirt_jacket',
      tags: ['jacket'],
      gender: 'men',
      categoryId: categories[0].id, // Shirts
      images: ['1740507-00-A_0_2000.jpg', '1740507-00-A_1.jpg'],
    },
    {
      title: "Women's Cropped Puffer Jacket",
      description:
        "The Women's Cropped Puffer Jacket features a uniquely cropped silhouette.",
      inStock: 3,
      price: 225,
      sizes: ['XS', 'S', 'M'],
      slug: 'womens_cropped_puffer_jacket',
      tags: ['jacket'],
      gender: 'women',
      categoryId: categories[0].id, // Shirts
      images: ['1740250-00-A_0_2000.jpg', '1740250-00-A_1.jpg'],
    },
  ];

  for (const productData of products) {
    const { images, ...product } = productData;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        sizes: product.sizes as any,
        gender: product.gender as any,
        ProductImage: {
          create: images.map((url) => ({ url })),
        },
      },
    });
  }

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
