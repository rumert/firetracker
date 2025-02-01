const { MONGO_URL } = require("./env");
const mongoose = require('mongoose');

const connectDB = async () => {
  
  try {
    await mongoose.connect(MONGO_URL);
  } catch (error) {
    console.log(error);
    process.exit(1)
  }

}

module.exports = connectDB;