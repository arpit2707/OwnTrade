const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI;
    if (!connStr || connStr.includes('<db_password>')) {
      console.warn('⚠️ MongoDB Atlas URI has placeholder <db_password>. Update server/.env with your actual password.');
      console.log('Running in fallback mode (DB connection pending password update)...');
      return;
    }

    const conn = await mongoose.connect(connStr);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't crash process so API endpoints remain responsive
  }
};

module.exports = connectDB;
