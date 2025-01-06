require('dotenv').config({ path: `./src/.env.${process.env.NODE_ENV}` });
const mongoose = require('mongoose');

const connectDB = async () => {
  
  try {
    await mongoose.connect(process.env.MONGO_URL);
  } catch (error) {
    console.log(error);
    process.exit(1)
  }

}

module.exports = connectDB;