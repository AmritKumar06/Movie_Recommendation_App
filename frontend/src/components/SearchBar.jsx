/**
 * SearchBar.jsx
 * Movie search input with live autocomplete dropdown.
 * Calls GET /search?q=<query> as the user types (debounced).
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiSearch, HiX } from 'react-icons/hi'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { searchMovies } from '../services/api'

const DEBOUNCE_MS = 300

export default function SearchBar({ onSearch, placeholder = 'Search for a movie…', className = '' }) {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open,        setOpen]        = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [activeIdx,   setActiveIdx]   = useState(-1)
  const inputRef  = useRef(null)
  const timerRef  = useRef(null)
  const wrapperRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced fetch of suggestions
  const fetchSuggestions = useCallback(async (q) => {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const data = await searchMovies(q, 8)
      setSuggestions(data.results || [])
      setOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setActiveIdx(-1)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchSuggestions(val), DEBOUNCE_MS)
  }

  const handleSelect = (title) => {
    setQuery(title)
    setOpen(false)
    setSuggestions([])
    onSearch(title)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    onSearch(query.trim())
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIdx].title)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const clearInput = () => {
    setQuery('')
    setSuggestions([])
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          {loading
            ? <AiOutlineLoading3Quarters className="animate-spin text-primary-400" />
            : <HiSearch className="text-lg" />
          }
        </div>

        <input
          ref={inputRef}
          id="movie-search-input"
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-11 pr-12 py-4 rounded-2xl bg-surface-DEFAULT border border-surface-border
                     text-white placeholder-zinc-500 text-base outline-none
                     transition-all duration-200 focus:border-primary-500 focus:ring-2
                     focus:ring-primary-500/20 focus:bg-surface-hover"
          aria-label="Search movies"
          aria-autocomplete="list"
          aria-expanded={open}
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-500
                       hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <HiX />
          </button>
        )}

        {/* Submit button */}
        <button
          type="submit"
          id="search-submit-btn"
          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl
                     bg-primary-500 text-white text-sm font-semibold
                     hover:bg-primary-600 active:scale-95 transition-all duration-200"
        >
          Go
        </button>
      </form>

      {/* Dropdown suggestions */}
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 py-2 glass-card z-50
                       shadow-2xl shadow-black/60 max-h-72 overflow-y-auto"
          >
            {suggestions.map((movie, idx) => (
              <li
                key={movie.id}
                role="option"
                aria-selected={idx === activeIdx}
                onMouseDown={() => handleSelect(movie.title)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
                  idx === activeIdx ? 'bg-primary-500/10 text-white' : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <HiSearch className="text-zinc-500 flex-shrink-0" />
                <span className="text-sm truncate">{movie.title}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
