const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    
    const conn = await mongoose.connect("mongodb+srv://srewadmin:Srew1234@srewadmin.rqfbcbo.mongodb.net/?appName=srewadmin");
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};
 
module.exports = connectDB;
