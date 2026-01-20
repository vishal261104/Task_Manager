import mongoose from "mongoose";

const dailyHabitSchema = new mongoose.Schema({
  habitName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required:true,
    default: ""
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  completions: [
    {
      type: String, // Format: "YYYY-MM-DD"
    }
  ],
  color: {
    type: String,
    default: "purple"
  },
  icon: {
    type: String,
    default: "star"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const DailyHabit = mongoose.model.DailyHabit || mongoose.model("DailyHabit", dailyHabitSchema);
export default DailyHabit;