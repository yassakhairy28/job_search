import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("DB connected successfully");
  } catch (error) {
    console.log("DB connection error", error);
  }
};

export default connectDB;
