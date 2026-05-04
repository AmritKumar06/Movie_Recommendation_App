/**
 * MovieCard.jsx
 * Card that displays a single movie's poster, title, rating, genres and overview.
 * Shows a skeleton loader while the poster is loading.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AiFillStar } from 'react-icons/ai'
import { MdCalendarToday, MdLocalMovies } from 'react-icons/md'
import { HiExternalLink } from 'react-icons/hi'

const PLACEHOLDER_POSTER = 'https://via.placeholder.com/500x750/1c1c22/f43f5e?text=No+Poster'

function StarRating({ rating }) {
  const stars = Math.round(rating / 2) // convert 0-10 to 0-5
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <AiFillStar
          key={i}
          className={`text-sm ${i < stars ? 'text-amber-400' : 'text-zinc-700'}`}
        />
      ))}
      <span className="text-xs text-zinc-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function MovieCard({ movie, index = 0 }) {
  const [posterLoaded, setPosterLoaded] = useState(false)
  const [posterError, setPosterError]   = useState(false)

  const {
    title       = 'Unknown',
    poster_url,
    vote_average = 0,
    genres      = '',
    overview    = '',
    release_date = '',
    id,
  } = movie

  const posterSrc = (!poster_url || posterError) ? PLACEHOLDER_POSTER : poster_url
  const year = release_date ? release_date.slice(0, 4) : '—'

  // Parse genres string / array
  const genreList = Array.isArray(genres)
    ? genres
    : genres.split(',').map((g) => g.trim()).filter(Boolean)

  const tmdbUrl = `https://www.themoviedb.org/movie/${id}`

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y:  0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="glass-card overflow-hidden group cursor-pointer flex flex-col h-full"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-surface-DEFAULT overflow-hidden">
        {/* Skeleton while loading */}
        {!posterLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}

        <img
          src={posterSrc}
          alt={`${title} poster`}
          className={`w-full h-full object-cover transition-all duration-500
                      group-hover:scale-110 ${posterLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setPosterLoaded(true)}
          onError={() => { setPosterError(true); setPosterLoaded(true) }}
          loading="lazy"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* TMDB link overlay */}
        <a
          href={tmdbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center opacity-0
                     group-hover:opacity-100 transition-opacity duration-300"
          onClick={(e) => e.stopPropagation()}
          aria-label={`View ${title} on TMDB`}
        >
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500/90
                           text-white text-xs font-semibold backdrop-blur-sm">
            <HiExternalLink /> View on TMDB
          </span>
        </a>

        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg
                        bg-black/70 backdrop-blur-sm text-amber-400 text-xs font-bold">
          <AiFillStar />
          {vote_average.toFixed(1)}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <h3 className="font-display font-bold text-white text-base leading-tight line-clamp-2 group-hover:text-primary-300 transition-colors">
          {title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <StarRating rating={vote_average} />
          <div className="flex items-center gap-1 text-zinc-500 text-xs">
            <MdCalendarToday className="text-xs" />
            {year}
          </div>
        </div>

        {/* Genre badges */}
        {genreList.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {genreList.slice(0, 3).map((g) => (
              <span key={g} className="badge-accent text-xs">{g}</span>
            ))}
          </div>
        )}

        {/* Overview */}
        <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3 flex-1">
          {overview || 'No overview available.'}
        </p>

        {/* CTA */}
        <a
          href={tmdbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center gap-1.5 w-full py-2 rounded-xl
                     border border-white/8 text-zinc-400 text-xs font-medium
                     hover:border-primary-500/40 hover:text-primary-400 hover:bg-primary-500/5
                     transition-all duration-200"
        >
          <MdLocalMovies /> More details
        </a>
      </div>
    </motion.article>
  )
}
