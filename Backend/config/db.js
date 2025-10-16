import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/task_manager", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(() => {
      console.log("MongoDB connected");
    }).catch((error) => {
      console.error("MongoDB connection error:", error);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
