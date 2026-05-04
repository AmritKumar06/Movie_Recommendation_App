/**
 * Discover.jsx
 * Main recommendation page: search bar + results grid.
 * Reads optional `?q=<title>` from URL to trigger a search on load.
 */

import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdAutoAwesome } from 'react-icons/md'
import SearchBar from '../components/SearchBar'
import RecommendationGrid from '../components/RecommendationGrid'
import { useRecommendations } from '../hooks/useRecommendations'

const exampleMovies = [
  'The Dark Knight', 'Inception', 'Interstellar', 'The Avengers', 'Avatar',
]

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { recommendations, loading, error, searched, getRecommendations } = useRecommendations()

  // Auto-search when ?q= param present
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) getRecommendations(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (title) => {
    setSearchParams({ q: title })
    getRecommendations(title)
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          border border-primary-500/30 bg-primary-500/10 text-primary-400
                          text-sm font-medium mb-5">
            <MdAutoAwesome />
            AI Recommendation Engine
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Find Similar Movies
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Type a movie title and our KNN model will surface 5 films you'll love.
          </p>
        </motion.div>

        {/* ── Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-5"
        >
          <SearchBar
            onSearch={handleSearch}
            placeholder="e.g. The Dark Knight, Inception, Avatar…"
          />
        </motion.div>

        {/* ── Quick examples ── */}
        {!searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap justify-center gap-2 mb-14"
          >
            <span className="text-zinc-600 text-sm self-center">Try:</span>
            {exampleMovies.map((title) => (
              <button
                key={title}
                onClick={() => handleSearch(title)}
                className="px-3 py-1.5 rounded-full border border-white/8 text-zinc-400 text-sm
                           hover:border-primary-500/40 hover:text-primary-300 hover:bg-primary-500/5
                           transition-all duration-200"
              >
                {title}
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Results ── */}
        <RecommendationGrid
          movies={recommendations}
          loading={loading}
          error={error}
          searched={searched}
        />

        {/* ── Idle illustration ── */}
        {!searched && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center justify-center py-20 text-center gap-4"
          >
            <div className="text-7xl mb-2">🎬</div>
            <h3 className="font-display text-2xl font-bold text-white">
              Ready when you are
            </h3>
            <p className="text-zinc-500 max-w-xs">
              Search for a movie above to get personalised AI recommendations instantly.
            </p>
          </motion.div>
        )}

      </div>
    </div>
  )
}
