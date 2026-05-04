/**
 * RecommendationGrid.jsx
 * Grid of movie recommendation cards with skeleton loaders and empty/error states.
 */

import { motion } from 'framer-motion'
import { MdSearchOff } from 'react-icons/md'
import { AiOutlineWarning } from 'react-icons/ai'
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'

export default function RecommendationGrid({ movies, loading, error, searched }) {
  // ── Loading state ──────────────────────────────────────────────────
  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-48 skeleton rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    )
  }

  // ── Error state ────────────────────────────────────────────────────
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20
                        flex items-center justify-center text-red-400 text-3xl">
          <AiOutlineWarning />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white mb-1">Oops!</h3>
          <p className="text-zinc-500 text-sm max-w-xs">{error}</p>
        </div>
      </motion.div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────
  if (searched && movies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/5
                        flex items-center justify-center text-zinc-500 text-3xl">
          <MdSearchOff />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white mb-1">No results</h3>
          <p className="text-zinc-500 text-sm max-w-xs">
            We couldn't find recommendations for &ldquo;{searched}&rdquo;. Try another movie title.
          </p>
        </div>
      </motion.div>
    )
  }

  if (movies.length === 0) return null

  // ── Results ────────────────────────────────────────────────────────
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full bg-primary-500" />
        <h2 className="section-title">
          Because you searched{' '}
          <span className="text-primary-400 italic">&ldquo;{searched}&rdquo;</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie, idx) => (
          <MovieCard key={movie.id ?? idx} movie={movie} index={idx} />
        ))}
      </div>
    </motion.section>
  )
}
