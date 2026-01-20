import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Zap, Flame } from 'lucide-react'
import axios from 'axios'
import DailyHabitItem from './DailyHabitItem'
import AddDailyHabit from './AddDailyHabit'

const API_BASE = 'http://localhost:4000/api/daily-habits'

const DailyHabitsList = () => {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [progress, setProgress] = useState({ total: 0, completed: 0, percentage: 0 })

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No auth token found')
    return { Authorization: `Bearer ${token}` }
  }

  const fetchHabits = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API_BASE}/gp`, { headers: getHeaders() })
      const todayDate = getTodayDate()
      
      const habitsWithStatus = data.data.map(habit => ({
        ...habit,
        completedToday: habit.completions?.includes(todayDate) || false
      }))
      
      setHabits(habitsWithStatus)
      
      // Calculate progress
      const completedCount = habitsWithStatus.filter(h => h.completedToday).length
      const totalCount = habitsWithStatus.length
      setProgress({
        total: totalCount,
        completed: completedCount,
        percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
      })
    } catch (error) {
      console.error('Error fetching habits:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await axios.delete(`${API_BASE}/${id}/gp`, { headers: getHeaders() })
        fetchHabits()
      } catch (error) {
        console.error('Error deleting habit:', error)
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
      {/* Header */}
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

      {/* Progress Section */}
      <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl p-6 mb-6 border border-purple-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Zap className="text-yellow-500 w-5 h-5" />
              Today's Progress
            </h2>
            <p className="text-sm text-gray-600 mt-1">{getMotivationalMessage()}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
              {progress.percentage}%
            </div>
            <p className="text-xs text-gray-600 mt-1">{progress.completed}/{progress.total} completed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-purple-200">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Habits List */}
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
              key={habit._id}
              habit={habit}
              completedToday={habit.completedToday}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onRefresh={fetchHabits}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AddDailyHabit
        isOpen={showModal}
        onClose={handleModalClose}
        habitToEdit={selectedHabit}
        onSubmit={fetchHabits}
      />
    </div>
  )
}

export default DailyHabitsList