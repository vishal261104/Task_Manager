import React, { useState } from 'react'
import { Trash2, Edit2, CheckCircle2, Circle } from 'lucide-react'
import axios from 'axios'
import { API_BASE as API_ROOT } from '../utils/api'

const HABITS_API_BASE = `${API_ROOT}/daily-habits`

const DailyHabitItem = ({ habit, onDelete, onEdit, onRefresh, onLogout, completedToday }) => {
  const [isToggling, setIsToggling] = useState(false)

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const handleToggle = async () => {
    try {
      setIsToggling(true)
      const token = localStorage.getItem('token')
      const today = getTodayDate()

      const response = await axios.post(
        `${HABITS_API_BASE}/${habit.id}/toggle`,
        { date: today },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.streak) {
        onRefresh(response.data.streak)
      } else {
        onRefresh()
      }
    } catch (error) {
      if (error?.response?.status === 401) onLogout?.()
      onRefresh()
    } finally {
      setIsToggling(false)
    }
  }

  const colorMap = {
    purple: 'border-purple-500 bg-purple-50',
    green: 'border-green-500 bg-green-50',
    blue: 'border-blue-500 bg-blue-50',
    red: 'border-red-500 bg-red-50',
    yellow: 'border-yellow-500 bg-yellow-50',
  }

  const textColorMap = {
    purple: 'text-purple-700',
    green: 'text-green-700',
    blue: 'text-blue-700',
    red: 'text-red-700',
    yellow: 'text-yellow-700',
  }

  const borderColor = colorMap[habit.color] || colorMap.purple
  const textColor = textColorMap[habit.color] || textColorMap.purple

  return (
    <div className={`border-l-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 ${borderColor}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className="flex-shrink-0 transition-all duration-300 hover:scale-110"
        >
          {completedToday ? (
            <CheckCircle2 className={`w-6 h-6 ${textColor}`} />
          ) : (
            <Circle className="w-6 h-6 text-gray-300 hover:text-gray-400" />
          )}
        </button>

        <div className="flex-grow min-w-0">
          <h3 className={`text-lg font-semibold ${completedToday ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {habit.habitName}
          </h3>
          {habit.description && (
            <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(habit)}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-600"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default DailyHabitItem
