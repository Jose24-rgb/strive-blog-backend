// db.js
import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    // Usa il nome corretto della variabile: process.env.MONGO_URI
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) { 
    console.error('MongoDB connection error', error);
  }
};

export default connectDB;
