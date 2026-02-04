import { useState, useEffect, useCallback } from 'react'
import { Plus, Zap, Flame } from 'lucide-react'
import axios from 'axios'
import DailyHabitItem from './DailyHabitItem'
import AddDailyHabit from './AddDailyHabit'
import StreakAnimation from './StreakAnimation'
import { logger } from '../utils/logger'
import { API_BASE as API_ROOT, getAuthHeaders as getStoredAuthHeaders } from '../utils/api'

const HABITS_API_BASE = `${API_ROOT}/daily-habits`

const DailyHabitsList = ({ onLogout }) => {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [progress, setProgress] = useState({ total: 0, completed: 0, percentage: 0, streak: 0 })
  const [showStreakAnimation, setShowStreakAnimation] = useState(false)
  const [streakData, setStreakData] = useState(null)

  const getTodayDate = useCallback(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }, [])

  const getHeaders = useCallback(() => {
    const headers = getStoredAuthHeaders()
    if (!headers.Authorization) throw new Error('No auth token found')
    return headers
  }, [])

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${HABITS_API_BASE}/gp`, { headers: getHeaders() })
      const todayDate = getTodayDate()
      
      const habitsWithStatus = data.data.map(habit => ({
        ...habit,
        completedToday: habit.completions?.includes(todayDate) || false
      }))
      
      setHabits(habitsWithStatus)
      
      const progressData = await axios.get(`${HABITS_API_BASE}/progress`, { headers: getHeaders() })
      
      const completedCount = habitsWithStatus.filter(h => h.completedToday).length
      const totalCount = habitsWithStatus.length
      setProgress({
        total: totalCount,
        completed: completedCount,
        percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        streak: progressData.data.data.streak || 0
      })
    } catch (error) {
      logger.warn('Failed to fetch daily habits', { status: error?.response?.status, message: error?.message })
      if (error?.response?.status === 401) onLogout?.()
    } finally {
      setLoading(false)
    }
  }, [getHeaders, getTodayDate, onLogout])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await axios.delete(`${HABITS_API_BASE}/${id}/gp`, { headers: getHeaders() })
        fetchHabits()
      } catch (error) {
        logger.warn('Failed to delete daily habit', { status: error?.response?.status, message: error?.message, habitId: id })
        if (error?.response?.status === 401) onLogout?.()
      }
    }
  }

  const handleEdit = (habit) => {
    setSelectedHabit(habit)
    setShowModal(true)
  }

  const handleAddClick = () => {
    setSelectedHabit(null)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedHabit(null)
  }

  const handleHabitToggle = async (streakResult) => {
    await fetchHabits()
    
    if (streakResult && streakResult.streakUpdated) {
      setStreakData({
        streak: streakResult.newStreak,
        badgesEarned: streakResult.badgesEarned || []
      })
      setShowStreakAnimation(true)
    }
  }

  const handleStreakAnimationClose = () => {
    setShowStreakAnimation(false)
    setStreakData(null)
  }

  const getMotivationalMessage = () => {
    if (progress.total === 0) return "Add your first habit to get started!"
    if (progress.percentage === 100) return "🎉 All habits completed! Amazing work!"
    if (progress.percentage === 0) return "Let's start the day! Complete your first habit."
    if (progress.percentage < 50) return "You're making progress! Keep going! 💪"
    return "Great effort! You're almost there!"
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Flame className="text-orange-500 w-8 h-8 shrink-0" />
            <span className="truncate">Daily Habits</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-10 truncate">Build consistency one day at a time</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto justify-center text-sm md:text-base"
        >
          <Plus size={18} />
          Add Habit
        </button>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl p-6 mb-6 border border-purple-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Zap className="text-yellow-500 w-5 h-5" />
              Today's Progress
            </h2>
            <p className="text-sm text-gray-600 mt-1">{getMotivationalMessage()}</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
                {progress.percentage}%
              </div>
              <p className="text-xs text-gray-600 mt-1">{progress.completed}/{progress.total} completed</p>
            </div>
            {progress.streak > 0 && (
              <div className="text-center border-l border-purple-200 pl-4">
                <div className="flex items-center gap-1 text-2xl font-bold text-orange-600">
                  <Flame className="w-6 h-6" />
                  {progress.streak}
                </div>
                <p className="text-xs text-gray-600 mt-1">day streak</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-purple-200">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No habits yet</h3>
          <p className="text-gray-500 mb-6">Start building your habit streak by adding your first daily habit!</p>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-md transition-all duration-200"
          >
            <Plus size={18} />
            Add Your First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map(habit => (
            <DailyHabitItem
              key={habit.id}
              habit={habit}
              completedToday={habit.completedToday}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onRefresh={handleHabitToggle}
              onLogout={onLogout}
            />
          ))}
        </div>
      )}

      <AddDailyHabit
        isOpen={showModal}
        onClose={handleModalClose}
        habitToEdit={selectedHabit}
        onSubmit={fetchHabits}
        onLogout={onLogout}
      />

      {showStreakAnimation && streakData && (
        <StreakAnimation
          streak={streakData.streak}
          badgesEarned={streakData.badgesEarned}
          onClose={handleStreakAnimationClose}
        />
      )}
    </div>
  )
}

export default DailyHabitsList