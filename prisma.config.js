module.exports = {
  datasource: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:123456@localhost:5433/teslo_shop?schema=public',
  },
};
