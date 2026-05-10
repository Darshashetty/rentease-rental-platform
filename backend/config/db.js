const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log(`Attempting to connect to MongoDB at: ${uri}`);
    
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n=== MONGODB CONNECTION ERROR ===`);
    console.error(`Error Message: ${error.message}`);
    console.error(`================================\n`);
    console.error(`Please copy the error message above and paste it to me!`);
    // Not exiting so nodemon doesn't continuously restart
  }
};

module.exports = connectDB;
