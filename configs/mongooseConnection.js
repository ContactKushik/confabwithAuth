const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    // agar yha database nhi bhi hua toh bn jayega
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to db");
  } catch (error) {
    console.log("Mongo db connection error: " + error);
    process.exit(1);
  }
};

module.exports = connectDb;
