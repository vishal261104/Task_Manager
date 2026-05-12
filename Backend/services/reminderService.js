import cron from "node-cron";
import Task from "../model/taskModel.js";
import DailyHabit from "../model/dailyHabitModel.js";
import User from "../model/usermodel.js";
import { sendEmail } from "../utils/email.js";
import { logger } from "../utils/logger.js";

const REMINDER_TIMEZONE = process.env.REMINDER_TIMEZONE || process.env.STREAK_TIMEZONE || "UTC";
const REMINDER_CRON = process.env.REMINDER_CRON || "0 9 * * *";

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

const buildReminderEmail = ({ name, dateLabel, tasksDue, habitsRemaining }) => {
  const taskLines = tasksDue.map((task) => `- ${task.title}`);
  const habitLine = habitsRemaining > 0
    ? `You still have ${habitsRemaining} habit${habitsRemaining === 1 ? "" : "s"} to complete today.`
    : "All habits completed so far. Great job!";

  return {
    subject: `TaskFlow reminder for ${dateLabel}`,
    text: [
      `Hi ${name || "there"},`,
      "",
      tasksDue.length
        ? `Tasks due today (${tasksDue.length}):\n${taskLines.join("\n")}`
        : "No tasks due today.",
      "",
      habitLine,
      "",
      "Open TaskFlow to review your day.",
    ].join("\n"),
  };
};

const sendUserReminders = async ({ user, dateLabel, start, end }) => {
  const [tasksDue, habits] = await Promise.all([
    Task.findDueForDate({ owner: user.id, start, end }),
    DailyHabit.find({ owner: user.id }),
  ]);

  const habitsRemaining = habits.filter((habit) => !habit.completions?.includes(dateLabel)).length;
  const shouldSend = tasksDue.length > 0 || habitsRemaining > 0;

  if (!shouldSend) return { tasksDue: 0, habitsRemaining: 0, sent: false };

  if (user.habitReminderDate === dateLabel && tasksDue.length === 0) {
    return { tasksDue: 0, habitsRemaining, sent: false };
  }

  const email = buildReminderEmail({
    name: user.name,
    dateLabel,
    tasksDue,
    habitsRemaining,
  });

  await sendEmail({
    to: user.email,
    subject: email.subject,
    text: email.text,
  });

  if (tasksDue.length > 0) {
    await Task.markReminded(tasksDue.map((task) => task.id));
  }

  if (habitsRemaining > 0) {
    await User.setHabitReminderDate(user.id, dateLabel);
  }

  return { tasksDue: tasksDue.length, habitsRemaining, sent: true };
};

export const runDailyReminders = async () => {
  const dateLabel = getDateInTimeZone(new Date(), REMINDER_TIMEZONE);
  const { start, end } = getUtcDayBounds(dateLabel);

  try {
    const users = await User.listForReminders();
    if (!users.length) return;

    for (const user of users) {
      try {
        await sendUserReminders({ user, dateLabel, start, end });
      } catch (error) {
        logger.warn("Reminder email failed", { userId: user.id, message: error?.message });
      }
    }
  } catch (error) {
    logger.error("Reminder scheduler failed", { message: error?.message });
  }
};

export const scheduleReminders = () => {
  cron.schedule(REMINDER_CRON, runDailyReminders, { timezone: REMINDER_TIMEZONE });
  logger.info("Reminder scheduler started", { cron: REMINDER_CRON, timezone: REMINDER_TIMEZONE });
};
