require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');

// Use Google DNS for SRV record resolution (fixes local DNS ECONNREFUSED)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eagle_beer_shop';

const connectDB = async () => {
  const conn = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`🗄️  MongoDB connected: ${conn.connection.host}`);
  return conn;
};

const testConnection = async () => {
  await connectDB();
};

module.exports = { connectDB, testConnection };
