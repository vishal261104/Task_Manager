import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://dhasivishal42:Vishalvk18@cluster0.porb5sq.mongodb.net/task_manager?retryWrites=true&w=majority&appName=Cluster0", {
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
