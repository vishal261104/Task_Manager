import { useState, useRef, useEffect, useCallback } from "react"
import { Settings, ChevronDown, LogOut, Zap, Flame, Award } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE, getToken } from "../utils/api"

const FALLBACK_BADGES = [
  { name: "Starter", streakRequired: 3, icon: "🌱" },
  { name: "Week Warrior", streakRequired: 7, icon: "🔥" },
  { name: "Fortnight Fighter", streakRequired: 14, icon: "⚡" },
  { name: "Monthly Master", streakRequired: 30, icon: "⭐" },
  { name: "Two Month Titan", streakRequired: 60, icon: "💎" },
  { name: "Century Champion", streakRequired: 100, icon: "👑" },
  { name: "Half Year Hero", streakRequired: 180, icon: "🏆" },
  { name: "Year Warrior", streakRequired: 365, icon: "🌟" },
]

const getCurrentBadge = (streak) => {
  if (!streak || streak < 3) return null
  const earned = FALLBACK_BADGES.filter(b => streak >= b.streakRequired)
  return earned.length > 0 ? earned[earned.length - 1] : null
}

const getNextBadge = (streak) => {
  return FALLBACK_BADGES.find(b => streak < b.streakRequired) || null
}

const Navbar = ({ user = {}, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [streak, setStreak] = useState(0)
  const [badgeData, setBadgeData] = useState(null)
  const navigate = useNavigate()
  const menuRef = useRef(null)

  const handleMenuToggle = () => setMenuOpen((prev) => !prev)
  const handleLogout = () => {
    setMenuOpen(false)
    onLogout()
  }

  const fetchStreakData = useCallback(async () => {
    try {
      const token = getToken()
      if (!token) return
      const { data } = await axios.get(`${API_BASE}/badges/user`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setStreak(data.data.streak || 0)
        setBadgeData(data.data)
      }
    } catch {
      // silently fail — streak display is non-critical
    }
  }, [])

  useEffect(() => {
    fetchStreakData()
  }, [fetchStreakData])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const currentBadge = getCurrentBadge(streak)
  const nextBadge = getNextBadge(streak)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 font-sans">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 shadow-lg group-hover:shadow-purple-300/50 group-hover:scale-105 transition-all duration-300">
            <Zap className="w-6 h-6 text-white" />
            <div className="absolute -bottom-1 -middle-1 w-3 h-3 bg-white rounded-full shadow-md animate-ping" />
          </div>

          <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent tracking-wide">
            TaskFlow
          </span>
        </div>

        {/* Streak & Badge Display */}
        <div
          className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border border-orange-200/60 shadow-sm cursor-pointer hover:shadow-md hover:border-orange-300 transition-all duration-300 group"
          onClick={() => navigate("/badges")}
          title="View Badges & Achievements"
        >
          {/* Streak fire + count */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Flame
                className={`w-5 h-5 transition-all duration-300 ${
                  streak > 0
                    ? "text-orange-500 group-hover:text-orange-600 drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]"
                    : "text-gray-300"
                }`}
              />
              {streak > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-75" />
              )}
            </div>
            <span className={`text-sm font-bold tabular-nums ${
              streak > 0
                ? "bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent"
                : "text-gray-400"
            }`}>
              {streak}
            </span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              day{streak !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-orange-200/80" />

          {/* Current badge */}
          <div className="flex items-center gap-1.5">
            {currentBadge ? (
              <>
                <span className="text-lg leading-none group-hover:scale-110 transition-transform duration-300">
                  {currentBadge.icon}
                </span>
                <span className="text-xs font-semibold text-gray-600 hidden md:inline max-w-[100px] truncate">
                  {currentBadge.name}
                </span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4 text-gray-300" />
                <span className="text-xs text-gray-400 hidden md:inline">
                  {nextBadge ? `${nextBadge.streakRequired - streak}d to ${nextBadge.name}` : "No badge"}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile streak indicator (compact) */}
          <div
            className="flex sm:hidden items-center gap-1 px-2 py-1 rounded-full bg-orange-50 border border-orange-200/50 cursor-pointer"
            onClick={() => navigate("/badges")}
          >
            <Flame className={`w-4 h-4 ${streak > 0 ? "text-orange-500" : "text-gray-300"}`} />
            <span className={`text-xs font-bold ${streak > 0 ? "text-orange-600" : "text-gray-400"}`}>
              {streak}
            </span>
          </div>

          <button
            className="p-2 text-gray-600 hover:text-purple-500 transition-colors duration-300 hover:bg-purple-50 rounded-full"
            onClick={() => navigate("/profile")}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div ref={menuRef} className="relative">
            <button
              onClick={handleMenuToggle}
              className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer hover:bg-purple-50 transition-colors duration-300 border border-transparent hover:border-purple-200"
            >
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full bg-gradient-to-br shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white font-semibold shadow-md">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </div>

              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-800">{user.name || "Guest User"}</p>
                <p className="text-xs text-gray-500 font-normal">{user.email || "user@taskflow.com"}</p>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen && (
              <ul className="absolute top-14 right-0 w-56 bg-white rounded-2xl shadow-xl border border-purple-100 z-50 overflow-hidden animate-fadeIn">
                <li className="p-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      navigate("/profile")
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-purple-50 text-sm text-gray-700 transition-colors flex items-center gap-2 group"
                    role="menuitem"
                  >
                    <Settings className="w-4 h-4 text-gray-700" />
                    Profile Settings
                  </button>
                </li>
                <li className="p-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-red-50 text-red-600"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar