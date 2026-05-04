/**
 * useRecommendations.js
 * Custom hook that encapsulates all recommendation-related state & logic.
 */

import { useState, useCallback } from 'react'
import { fetchRecommendations } from '../services/api'
import toast from 'react-hot-toast'

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [searched, setSearched] = useState(null) // last searched title

  const getRecommendations = useCallback(async (title) => {
    if (!title?.trim()) return

    setLoading(true)
    setError(null)
    setRecommendations([])
    setSearched(title.trim())

    try {
      const data = await fetchRecommendations(title.trim())
      setRecommendations(data.recommendations || [])
      if ((data.recommendations || []).length === 0) {
        toast('No recommendations found for this movie.', { icon: '🎬' })
      }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setRecommendations([])
    setError(null)
    setSearched(null)
  }, [])

  return { recommendations, loading, error, searched, getRecommendations, reset }
}
