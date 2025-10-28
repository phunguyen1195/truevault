import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { CheckCircle, XCircle, Clock, TrendingUp, Award } from 'lucide-react'
import { format } from 'date-fns'

export default function Portfolio() {
  const [data, setData] = useState({ votes: [], stats: { total: 0, correct: 0, incorrect: 0, pending: 0 } })
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [votesRes, badgesRes] = await Promise.all([
        api.get('/votes/my-votes'),
        api.get('/users/badges')
      ])
      setData(votesRes.data)
      setBadges(badgesRes.data)
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const accuracy = data.stats.total > 0 
    ? ((data.stats.correct / (data.stats.correct + data.stats.incorrect)) * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Your Portfolio</h1>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Correct</p>
              <p className="text-2xl font-bold text-green-600">{data.stats.correct}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Incorrect</p>
              <p className="text-2xl font-bold text-red-600">{data.stats.incorrect}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-primary-600">{accuracy}%</p>
            </div>
            <Clock className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Award className="w-6 h-6 mr-2 text-yellow-500" />
          Your Badges
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border-2 ${
                badge.earned_at
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400'
                  : 'bg-gray-50 border-gray-200 opacity-50'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                {badge.earned_at ? (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    Earned {format(new Date(badge.earned_at), 'MMM d, yyyy')}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">
                    {badge.requirement_type === 'votes' && `${badge.requirement_value} votes needed`}
                    {badge.requirement_type === 'correct' && `${badge.requirement_value} correct predictions`}
                    {badge.requirement_type === 'streak' && `${badge.requirement_value} in a row`}
                    {badge.requirement_type === 'points' && `${badge.requirement_value} points needed`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vote History */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Vote History</h2>
        {data.votes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No votes yet. Start voting on markets!</p>
        ) : (
          <div className="space-y-4">
            {data.votes.map(vote => (
              <div key={vote.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{vote.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{vote.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Voted: {format(new Date(vote.created_at), 'MMM d, yyyy HH:mm')}</span>
                      <span className={`font-medium ${vote.vote === 'YES' ? 'text-green-600' : 'text-red-600'}`}>
                        Your vote: {vote.vote}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {vote.result === 'correct' && (
                      <span className="badge bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Correct +10pts
                      </span>
                    )}
                    {vote.result === 'incorrect' && (
                      <span className="badge bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Incorrect
                      </span>
                    )}
                    {vote.result === 'pending' && (
                      <span className="badge bg-gray-100 text-gray-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

