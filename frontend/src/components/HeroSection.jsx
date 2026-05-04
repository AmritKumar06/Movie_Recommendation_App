/**
 * HeroSection.jsx
 * Animated landing hero with headline, subtext, stats and a CTA.
 */

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi'
import { MdAutoAwesome } from 'react-icons/md'

const stats = [
  { label: 'Movies',         value: '4,800+' },
  { label: 'Genres',         value: '20+'    },
  { label: 'AI Precision',   value: '95%'    },
  { label: 'Instant',        value: '<1s'    },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-hero-gradient" />
      {/* Animated blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl animate-pulse"
           style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[600px] bg-glow-red rounded-full pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 text-center max-w-4xl mx-auto py-32">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                     border border-primary-500/30 bg-primary-500/10 text-primary-400
                     text-sm font-medium mb-8"
        >
          <MdAutoAwesome className="text-base" />
          AI-Powered Movie Discovery
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold
                     text-white leading-[1.1] tracking-tight mb-6"
        >
          Discover Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-rose-300">
            Next Favourite
          </span>
          <br />Film
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Our machine-learning engine analyses genres, cast, keywords and storyline
          to surface the most similar movies — instantly.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/discover" className="btn-primary text-base px-8 py-3.5 animate-pulse-glow">
            Get Recommendations <HiArrowRight />
          </Link>
          <Link to="/about" className="btn-ghost text-base px-8 py-3.5">
            How It Works
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden
                     border border-white/5"
        >
          {stats.map(({ label, value }) => (
            <div key={label} className="bg-dark-400/60 backdrop-blur-sm px-6 py-5">
              <p className="font-display text-2xl font-bold text-white mb-1">{value}</p>
              <p className="text-zinc-500 text-xs uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-400 to-transparent pointer-events-none" />
    </section>
  )
}
