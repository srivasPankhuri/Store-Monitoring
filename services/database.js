const mongoose = require("mongoose");

// Connect to the MongoDB database
async function connectToDatabase() {
  try {
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to the database.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

module.exports = { connectToDatabase };
