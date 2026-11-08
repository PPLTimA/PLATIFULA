
const path = require('node:path');

const env = process.env;

module.exports = {
  port: Number(env.PORT) || 3000,
  isProduction: env.NODE_ENV === 'production',


  timezone: env.APP_TIMEZONE || 'Asia/Jakarta',

  paths: {
    frontend: path.resolve(__dirname, '..', '..', 'Front end'),
    seed: path.resolve(__dirname, '..', 'seed'),
  },

  database: {
    name: env.DB_NAME || 'tubes_ppl',
    host: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
  },

  session: {
    cookieName: 'platiful_session',
    durationMs: 7 * 24 * 60 * 60 * 1000,
    secureCookie: env.COOKIE_SECURE === 'true',
  },

  demoLogin: env.DEMO_LOGIN !== 'off' && env.NODE_ENV !== 'production',

  defaultCommissionRate: 5,
  maxBodyBytes: 1_000_000,
  noShowLimit: 3,
};
