import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { API_BASE, getToken } from "../utils/api";

const POLL_INTERVAL = 10 * 60 * 1000; // poll every 10 minutes
const NOTIF_STORAGE_KEY = "taskflow_last_notif_key";

const requestPermission = async () => {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
};

const showBrowserNotification = ({ title, body, icon, tag }) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const notif = new Notification(title, {
      body,
      icon: icon || "/favicon.ico",
      tag: tag || "taskflow-reminder",
      badge: "/favicon.ico",
      requireInteraction: false,
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch {
    // Silently fail if notification fails (e.g., in some browsers)
  }
};

const buildNotificationContent = (data) => {
  const lines = [];

  if (data.tasks?.length > 0) {
    lines.push(`📋 ${data.tasks.length} task${data.tasks.length === 1 ? "" : "s"} due today`);
    data.tasks.slice(0, 3).forEach((t) => lines.push(`  • ${t.title}`));
    if (data.tasks.length > 3) lines.push(`  ...and ${data.tasks.length - 3} more`);
  }

  const remaining = data.habits?.filter((h) => !h.completedToday) || [];
  if (remaining.length > 0) {
    lines.push(`🔄 ${remaining.length} habit${remaining.length === 1 ? "" : "s"} remaining`);
    remaining.slice(0, 3).forEach((h) => lines.push(`  ⬜ ${h.habitName}`));
    if (remaining.length > 3) lines.push(`  ...and ${remaining.length - 3} more`);
  } else if (data.habitsTotal > 0) {
    lines.push("✅ All habits completed today!");
  }

  return lines.join("\n");
};

export const useNotifications = () => {
  const [permission, setPermission] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "denied"
  );
  const [reminderData, setReminderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Request notification permission
  const requestNotifPermission = useCallback(async () => {
    const result = await requestPermission();
    setPermission(result);
    return result;
  }, []);

  // Fetch reminders from the API
  const fetchReminders = useCallback(async ({ notify = true } = {}) => {
    const token = getToken();
    if (!token) return null;

    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/reminders/now`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!mountedRef.current) return null;

      if (data.success) {
        setReminderData(data);

        // Check if we should show a notification (new data since last check)
        if (notify && data.key) {
          const lastKey = localStorage.getItem(NOTIF_STORAGE_KEY);
          if (lastKey !== data.key) {
            localStorage.setItem(NOTIF_STORAGE_KEY, data.key);

            const hasContent = (data.tasks?.length > 0) || (data.habitsRemaining > 0);
            if (hasContent) {
              const body = buildNotificationContent(data);
              showBrowserNotification({
                title: `TaskFlow — ${data.date}`,
                body,
                tag: `taskflow-${data.date}`,
              });
            }
          }
        }

        return data;
      }
    } catch {
      // silently fail — notifications are non-critical
    } finally {
      if (mountedRef.current) setLoading(false);
    }
    return null;
  }, []);

  // Start polling
  useEffect(() => {
    mountedRef.current = true;

    // Request permission on mount
    requestNotifPermission();

    // Initial fetch (with a small delay so the page loads first)
    const initialTimeout = setTimeout(() => {
      if (mountedRef.current) fetchReminders({ notify: true });
    }, 3000);

    // Set up polling
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) fetchReminders({ notify: true });
    }, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchReminders, requestNotifPermission]);

  return {
    permission,
    reminderData,
    loading,
    requestPermission: requestNotifPermission,
    refreshReminders: () => fetchReminders({ notify: false }),
  };
};
