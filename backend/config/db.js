require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');

// Use Google DNS for SRV record resolution (fixes local DNS ECONNREFUSED)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eagle_beer_shop';

// Cache the connection across serverless warm invocations
let cached = global.__mongo;
if (!cached) {
  cached = global.__mongo = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
      maxPoolSize: 10,
    }).then((conn) => {
      console.log(`🗄️  MongoDB connected: ${conn.connection.host}`);
      return conn;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

const testConnection = async () => {
  await connectDB();
};

module.exports = { connectDB, testConnection };
