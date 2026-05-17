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

const buildReminderEmail = ({ name, dateLabel, tasksDue, habits, habitsRemaining }) => {
  const greeting = `Hi ${name || "there"},`;

  // Tasks section
  let taskSection;
  if (tasksDue.length > 0) {
    const taskLines = tasksDue.map((task) => {
      const priority = task.priority ? ` [${task.priority}]` : "";
      return `  • ${task.title}${priority}`;
    });
    taskSection = `📋 Tasks due today (${tasksDue.length}):\n${taskLines.join("\n")}`;
  } else {
    taskSection = "📋 No tasks due today — nice!";
  }

  // Habits section — always list every habit with its status
  let habitSection;
  if (habits.length > 0) {
    const habitLines = habits.map((habit) => {
      const done = habit.completions?.includes(dateLabel);
      const icon = done ? "✅" : "⬜";
      return `  ${icon} ${habit.habitName}`;
    });
    const summary = habitsRemaining > 0
      ? `(${habitsRemaining} remaining)`
      : "(all completed — great job!)";
    habitSection = `🔄 Daily Habits ${summary}:\n${habitLines.join("\n")}`;
  } else {
    habitSection = "🔄 No daily habits set up yet.";
  }

  const text = [
    greeting,
    "",
    `Here's your daily summary for ${dateLabel}:`,
    "",
    taskSection,
    "",
    habitSection,
    "",
    "Open TaskFlow to review your day. 🚀",
  ].join("\n");

  // HTML version for richer email clients
  const taskHtml = tasksDue.length > 0
    ? tasksDue.map((t) => {
        const color = t.priority === "High" ? "#ef4444" : t.priority === "Medium" ? "#f59e0b" : "#22c55e";
        return `<li style="padding:4px 0">${t.title} <span style="color:${color};font-size:12px">[${t.priority || "Medium"}]</span></li>`;
      }).join("")
    : '<li style="padding:4px 0;color:#6b7280">No tasks due today — nice!</li>';

  const habitHtml = habits.length > 0
    ? habits.map((h) => {
        const done = h.completions?.includes(dateLabel);
        const icon = done ? "✅" : "⬜";
        const style = done ? "text-decoration:line-through;color:#9ca3af" : "color:#1f2937";
        return `<li style="padding:4px 0;${style}">${icon} ${h.habitName}</li>`;
      }).join("")
    : '<li style="padding:4px 0;color:#6b7280">No daily habits set up yet.</li>';

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#faf5ff;border-radius:12px">
      <div style="text-align:center;margin-bottom:20px">
        <span style="font-size:28px;font-weight:800;background:linear-gradient(135deg,#d946ef,#8b5cf6,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent">TaskFlow</span>
      </div>
      <div style="background:#ffffff;border-radius:10px;padding:20px;border:1px solid #e9d5ff">
        <p style="color:#374151;font-size:15px">Hi <strong>${name || "there"}</strong>,</p>
        <p style="color:#6b7280;font-size:14px">Here's your daily summary for <strong>${dateLabel}</strong>:</p>
        <h3 style="color:#7c3aed;font-size:14px;margin:16px 0 8px">📋 Tasks Due Today (${tasksDue.length})</h3>
        <ul style="list-style:none;padding:0;margin:0">${taskHtml}</ul>
        <h3 style="color:#7c3aed;font-size:14px;margin:16px 0 8px">🔄 Daily Habits ${habitsRemaining > 0 ? `(${habitsRemaining} remaining)` : "(all done ✨)"}</h3>
        <ul style="list-style:none;padding:0;margin:0">${habitHtml}</ul>
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px">Open TaskFlow to review your day 🚀</p>
    </div>`;

  return {
    subject: `TaskFlow Daily Summary — ${dateLabel}`,
    text,
    html,
  };
};

const sendUserReminders = async ({ user, dateLabel, start, end }) => {
  const [tasksDue, habits] = await Promise.all([
    Task.findDueForDate({ owner: user.id, start, end }),
    DailyHabit.find({ owner: user.id }),
  ]);

  const habitsRemaining = habits.filter((habit) => !habit.completions?.includes(dateLabel)).length;

  // Send if user has ANY habits (always inform about daily habits) OR has tasks due
  const shouldSend = habits.length > 0 || tasksDue.length > 0;

  if (!shouldSend) return { tasksDue: 0, habitsRemaining: 0, sent: false };

  // Dedup: only skip if we already sent today AND nothing new to report
  // (both task reminder and habit reminder already sent for today)
  const habitAlreadySent = user.habitReminderDate === dateLabel;
  const noNewTasks = tasksDue.length === 0;

  if (habitAlreadySent && noNewTasks) {
    return { tasksDue: 0, habitsRemaining, sent: false };
  }

  const email = buildReminderEmail({
    name: user.name,
    dateLabel,
    tasksDue,
    habits,
    habitsRemaining,
  });

  await sendEmail({
    to: user.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  if (tasksDue.length > 0) {
    await Task.markReminded(tasksDue.map((task) => task.id));
  }

  // Always mark habit reminder as sent for today (even if 0 remaining)
  await User.setHabitReminderDate(user.id, dateLabel);

  return { tasksDue: tasksDue.length, habitsRemaining, sent: true };
};

export const runDailyReminders = async () => {
  const dateLabel = getDateInTimeZone(new Date(), REMINDER_TIMEZONE);
  const { start, end } = getUtcDayBounds(dateLabel);

  try {
    const users = await User.listForReminders();
    if (!users.length) return;

    let sentCount = 0;
    for (const user of users) {
      try {
        const result = await sendUserReminders({ user, dateLabel, start, end });
        if (result.sent) sentCount++;
      } catch (error) {
        logger.warn("Reminder email failed", { userId: user.id, message: error?.message });
      }
    }
    logger.info("Daily reminders completed", { totalUsers: users.length, emailsSent: sentCount, date: dateLabel });
  } catch (error) {
    logger.error("Reminder scheduler failed", { message: error?.message });
  }
};

export const scheduleReminders = () => {
  cron.schedule(REMINDER_CRON, runDailyReminders, { timezone: REMINDER_TIMEZONE });
  logger.info("Reminder scheduler started", { cron: REMINDER_CRON, timezone: REMINDER_TIMEZONE });
};
