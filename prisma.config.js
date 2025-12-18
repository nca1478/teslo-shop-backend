require('dotenv').config({ path: '.env' });

module.exports = {
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
};
