const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trackly';

console.log(`[Database] Connecting to MongoDB at: ${mongoURI}`);

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('[Database] Successfully connected to MongoDB persistent database.');
  } catch (err) {
    console.error('[Database] Failed to connect to MongoDB:', err.message);
  }
};

module.exports = { connectDB };
