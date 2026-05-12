import Task from "../model/taskModel.js";
import DailyHabit from "../model/dailyHabitModel.js";

const REMINDER_TIMEZONE = process.env.REMINDER_TIMEZONE || process.env.STREAK_TIMEZONE || "UTC";

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

    const habitsRemaining = habits.filter((habit) => !habit.completions?.includes(dateLabel)).length;
    const taskIds = tasksDue.map((task) => task.id).sort();
    const key = `${dateLabel}|${taskIds.join(",")}|${habitsRemaining}`;

    res.json({
      success: true,
      date: dateLabel,
      tasks: tasksDue.map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
      })),
      habitsRemaining,
      key,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load reminders",
    });
  }
};
