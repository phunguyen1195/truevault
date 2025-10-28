import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Clock, CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react'
import { formatDistanceToNow, isPast } from 'date-fns'

export default function MarketCard({ market, onUpdate }) {
  const [userVote, setUserVote] = useState(null)
  const [voting, setVoting] = useState(false)
  const [resolving, setResolving] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchUserVote()
  }, [market.id])

  const fetchUserVote = async () => {
    try {
      const response = await api.get(`/votes/market/${market.id}`)
      setUserVote(response.data)
    } catch (error) {
      console.error('Error fetching user vote:', error)
    }
  }

  const handleVote = async (vote) => {
    setVoting(true)
    try {
      await api.post('/votes', {
        market_id: market.id,
        vote
      })
      await fetchUserVote()
      onUpdate()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cast vote')
    } finally {
      setVoting(false)
    }
  }

  const handleResolve = async (resolution) => {
    if (!window.confirm(`Resolve this market as ${resolution}?`)) return

    setResolving(true)
    try {
      await api.post(`/markets/${market.id}/resolve`, { resolution })
      onUpdate()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to resolve market')
    } finally {
      setResolving(false)
    }
  }

  const getStatusBadge = () => {
    switch (market.status) {
      case 'open':
        return (
          <span className="badge bg-green-100 text-green-800">
            <Clock className="w-3 h-3 mr-1" />
            Open
          </span>
        )
      case 'closed':
        return (
          <span className="badge bg-orange-100 text-orange-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            Closed
          </span>
        )
      case 'resolved':
        return (
          <span className="badge bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved: {market.resolution}
          </span>
        )
      default:
        return null
    }
  }

  const showVoteCounts = market.show_totals || market.status !== 'open'
  const yesPercent = market.total_votes > 0 ? (market.yes_count / market.total_votes * 100).toFixed(0) : 0
  const noPercent = market.total_votes > 0 ? (market.no_count / market.total_votes * 100).toFixed(0) : 0

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        {getStatusBadge()}
        {userVote && (
          <span className={`badge ${userVote.vote === 'YES' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Your vote: {userVote.vote}
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{market.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{market.description}</p>

      {market.rules && (
        <p className="text-xs text-gray-500 mb-4 italic">Rules: {market.rules}</p>
      )}

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {isPast(new Date(market.close_time))
              ? 'Closed ' + formatDistanceToNow(new Date(market.close_time)) + ' ago'
              : 'Closes in ' + formatDistanceToNow(new Date(market.close_time))}
          </span>
          {showVoteCounts && (
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {market.total_votes} votes
            </span>
          )}
        </div>

        {showVoteCounts && market.total_votes > 0 && (
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-700 font-medium">YES</span>
                <span className="text-green-700">{yesPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${yesPercent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-700 font-medium">NO</span>
                <span className="text-red-700">{noPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${noPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {market.status === 'open' && !userVote && (
        <div className="flex space-x-2">
          <button
            onClick={() => handleVote('YES')}
            disabled={voting}
            className="flex-1 btn bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 mr-1 inline" />
            Vote YES
          </button>
          <button
            onClick={() => handleVote('NO')}
            disabled={voting}
            className="flex-1 btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 mr-1 inline" />
            Vote NO
          </button>
        </div>
      )}

      {market.status === 'closed' && user?.role === 'admin' && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Resolve market:</p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleResolve('YES')}
              disabled={resolving}
              className="flex-1 btn btn-success disabled:opacity-50"
            >
              Resolve YES
            </button>
            <button
              onClick={() => handleResolve('NO')}
              disabled={resolving}
              className="flex-1 btn btn-danger disabled:opacity-50"
            >
              Resolve NO
            </button>
          </div>
        </div>
      )}

      {market.status === 'resolved' && userVote && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          market.resolution === userVote.vote
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'
        }`}>
          {market.resolution === userVote.vote ? (
            <>
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Correct prediction! +10 points
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 inline mr-1" />
              Incorrect prediction
            </>
          )}
        </div>
      )}
    </div>
  )
}

