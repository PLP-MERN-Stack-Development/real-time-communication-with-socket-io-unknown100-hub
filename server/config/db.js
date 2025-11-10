const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.warn('No MongoDB URI found in env (MONGODB_URI). Skipping DB connect.');
      return;
    }
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn('MongoDB connection failed; continuing without DB:', error.message);
    // Intentionally not exiting so the app can run in-memory
  }
};

module.exports = connectDB;
