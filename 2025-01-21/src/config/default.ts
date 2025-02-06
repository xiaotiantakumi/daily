export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },
};
