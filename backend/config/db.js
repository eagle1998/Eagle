require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eagle_beer_shop';

const connectDB = async () => {
  const conn = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log(`🗄️  MongoDB connected: ${conn.connection.host}`);
  return conn;
};

const testConnection = async () => {
  await connectDB();
};

module.exports = { connectDB, testConnection };
