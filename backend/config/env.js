const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eagle_beer_shop',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim())
  },
  upload: {
    maxSize: parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 5 * 1024 * 1024,
    path: process.env.UPLOAD_PATH || 'uploads'
  },
  adminRegisterSecret: process.env.ADMIN_REGISTER_SECRET || 'fallback_dev_secret_key'
};

if (config.nodeEnv === 'production') {
  if (!config.jwt.secret || config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
  if (!config.mongoUri) {
    throw new Error('MONGODB_URI must be set in production');
  }
  if (config.cors.origin.includes('*') || config.cors.origin.length === 0) {
    throw new Error('CORS_ORIGIN must not be * and must be explicitly set in production');
  }
}

module.exports = config;
