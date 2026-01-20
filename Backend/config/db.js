import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://dhasivishal42:Vishalvk18@cluster0.porb5sq.mongodb.net/task_manager?retryWrites=true&w=majority&appName=Cluster0";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    // Fail fast so we do not start the server without a database connection
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};
