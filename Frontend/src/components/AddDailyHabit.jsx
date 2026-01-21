import React, { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import axios from 'axios'

const API_BASE = 'https://task-manager-2-0ttx.onrender.com/api/daily-habits'

const AddDailyHabit = ({ isOpen, onClose, habitToEdit, onSubmit }) => {
  const [formData, setFormData] = useState({
    habitName: '',
    description: '',
    color: 'purple',
    icon: 'star'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const colors = ['purple', 'green', 'blue', 'red', 'yellow']

  useEffect(() => {
    if (habitToEdit) {
      setFormData({
        habitName: habitToEdit.habitName || '',
        description: habitToEdit.description || '',
        color: habitToEdit.color || 'purple',
        icon: habitToEdit.icon || 'star'
      })
    } else {
      setFormData({
        habitName: '',
        description: '',
        color: 'purple',
        icon: 'star'
      })
    }
    setError('')
  }, [habitToEdit, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.habitName.trim()) {
      setError('Habit name is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No auth token found')

      if (habitToEdit) {
        await axios.put(`${API_BASE}/${habitToEdit._id}/gp`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(`${API_BASE}/gp`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }

      onSubmit()
      setFormData({ habitName: '', description: '', color: 'purple', icon: 'star' })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving habit')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative z-51">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {habitToEdit ? 'Edit Habit' : 'Add New Daily Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habit Name *
            </label>
            <input
              type="text"
              value={formData.habitName}
              onChange={(e) => setFormData({ ...formData, habitName: e.target.value })}
              placeholder="e.g., Morning Yoga"
              className="w-full px-4 py-2 border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description..."
              rows="3"
              className="w-full px-4 py-2 border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    color === 'purple' ? 'bg-purple-500' :
                    color === 'green' ? 'bg-green-500' :
                    color === 'blue' ? 'bg-blue-500' :
                    color === 'red' ? 'bg-red-500' :
                    'bg-yellow-500'
                  } ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  {habitToEdit ? 'Update Habit' : 'Add Habit'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDailyHabit
