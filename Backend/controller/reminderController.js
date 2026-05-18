import Task from "../model/taskModel.js";
import DailyHabit from "../model/dailyHabitModel.js";
import { runDailyReminders } from "../services/reminderService.js";

const REMINDER_TIMEZONE = process.env.REMINDER_TIMEZONE || process.env.STREAK_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;

const getDateInTimeZone = (date, timeZone) => {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
};

const getUtcDayBounds = (isoDateOnly) => {
  const [yearStr, monthStr, dayStr] = isoDateOnly.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const start = new Date(Date.UTC(year, month - 1, day));
  const end = new Date(Date.UTC(year, month - 1, day + 1) - 1);
  return { start, end };
};

export const getRemindersNow = async (req, res) => {
  const dateLabel = getDateInTimeZone(new Date(), REMINDER_TIMEZONE);
  const { start, end } = getUtcDayBounds(dateLabel);

  try {
    const [tasksDue, habits] = await Promise.all([
      Task.findDueForDateAny({ owner: req.user.id, start, end }),
      DailyHabit.find({ owner: req.user.id }),
    ]);

    const habitsWithStatus = habits.map((habit) => ({
      id: habit.id,
      habitName: habit.habitName,
      completedToday: habit.completions?.includes(dateLabel) || false,
    }));

    const habitsRemaining = habitsWithStatus.filter((h) => !h.completedToday).length;
    const habitsTotal = habits.length;

    const taskIds = tasksDue.map((task) => task.id).sort();
    const key = `${dateLabel}|t${taskIds.join(",")}|hr${habitsRemaining}`;

    res.json({
      success: true,
      date: dateLabel,
      tasks: tasksDue.map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
      })),
      habits: habitsWithStatus,
      habitsRemaining,
      habitsTotal,
      key,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load reminders",
    });
  }
};

export const triggerEmailReminders = async (req, res) => {
  try {
    await runDailyReminders();
    res.json({
      success: true,
      message: "Email reminders triggered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to trigger email reminders",
    });
  }
};
