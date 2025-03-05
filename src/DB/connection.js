import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error connecting to database", error);
  }
};

export default connectDB;
