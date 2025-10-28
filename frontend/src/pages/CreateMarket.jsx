import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Plus } from 'lucide-react'

export default function CreateMarket() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    close_time: '',
    show_totals: true
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/markets', formData)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create market')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Market</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Market Question *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Will X happen by Y date?"
              maxLength="200"
            />
            <p className="mt-1 text-xs text-gray-500">
              Phrase as a yes/no question
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="input"
              placeholder="Provide context and details about this market..."
            />
          </div>

          <div>
            <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-1">
              Resolution Rules
            </label>
            <textarea
              id="rules"
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows="3"
              className="input"
              placeholder="How will this market be resolved? What sources will be used?"
            />
          </div>

          <div>
            <label htmlFor="close_time" className="block text-sm font-medium text-gray-700 mb-1">
              Close Time *
            </label>
            <input
              type="datetime-local"
              id="close_time"
              name="close_time"
              required
              value={formData.close_time}
              onChange={handleChange}
              className="input"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="mt-1 text-xs text-gray-500">
              When voting will close for this market
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="show_totals"
              name="show_totals"
              checked={formData.show_totals}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="show_totals" className="ml-2 block text-sm text-gray-700">
              Show live vote totals while market is open
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              {loading ? 'Creating...' : 'Create Market'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

