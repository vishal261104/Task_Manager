import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCircle2, Circle, AlertTriangle } from "lucide-react";

const NotificationBell = ({ reminderData, loading, permission, onRequestPermission }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const tasks = reminderData?.tasks || [];
  const habits = reminderData?.habits || [];
  const habitsRemaining = reminderData?.habitsRemaining || 0;
  const totalAlerts = tasks.length + habitsRemaining;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-gray-600 hover:text-purple-500 transition-colors duration-300 hover:bg-purple-50 rounded-full"
        aria-label="Notifications"
        id="notification-bell"
      >
        <Bell className="w-5 h-5" />
        {totalAlerts > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full px-1 shadow-md animate-pulse">
            {totalAlerts > 9 ? "9+" : totalAlerts}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 z-[60] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Today's Summary
            </h3>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Permission banner */}
          {permission !== "granted" && (
            <div className="mx-3 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-amber-800 font-medium">Notifications are disabled</p>
                  <p className="text-xs text-amber-600 mt-0.5">Enable to get system alerts for tasks & habits.</p>
                  <button
                    onClick={onRequestPermission}
                    className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-900 underline transition-colors"
                  >
                    Enable Notifications
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto p-3 space-y-3">
            {loading && !reminderData && (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}

            {/* Tasks Section */}
            {reminderData && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  📋 Tasks Due Today
                  {tasks.length > 0 && (
                    <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                      {tasks.length}
                    </span>
                  )}
                </p>
                {tasks.length > 0 ? (
                  <div className="space-y-1.5">
                    {tasks.map((task) => {
                      const priorityColors = {
                        High: "border-l-red-500 bg-red-50/50",
                        Medium: "border-l-amber-500 bg-amber-50/50",
                        Low: "border-l-green-500 bg-green-50/50",
                      };
                      return (
                        <div
                          key={task.id}
                          className={`p-2.5 rounded-lg border-l-3 transition-colors ${
                            priorityColors[task.priority] || "border-l-gray-300 bg-gray-50/50"
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 uppercase font-medium">{task.priority || "Medium"} priority</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic py-1">No tasks due today ✨</p>
                )}
              </div>
            )}

            {/* Habits Section */}
            {reminderData && habits.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  🔄 Daily Habits
                  {habitsRemaining > 0 && (
                    <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                      {habitsRemaining} left
                    </span>
                  )}
                </p>
                <div className="space-y-1">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${
                        habit.completedToday
                          ? "bg-green-50/60 border border-green-100"
                          : "bg-purple-50/40 border border-purple-100"
                      }`}
                    >
                      {habit.completedToday ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-purple-400 shrink-0" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          habit.completedToday ? "text-gray-400 line-through" : "text-gray-700"
                        }`}
                      >
                        {habit.habitName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {reminderData && tasks.length === 0 && habits.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-sm text-gray-500">Nothing to show right now</p>
                <p className="text-xs text-gray-400 mt-1">Add tasks or habits to see reminders</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {reminderData && (
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center">
                Updated for {reminderData.date} • Auto-refreshes every 10 min
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
