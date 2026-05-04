/**
 * Home.jsx
 * Landing page: hero → featured movies section.
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi'
import { MdAutoAwesome, MdSpeed, MdLibraryBooks, MdTouchApp } from 'react-icons/md'
import HeroSection from '../components/HeroSection'

const features = [
  {
    icon: <MdAutoAwesome className="text-2xl" />,
    title: 'Content-Based AI',
    desc:  'KNN model trained on genres, cast, keywords and movie overviews.',
    color: 'text-primary-400',
    bg:    'bg-primary-500/10',
  },
  {
    icon: <MdSpeed className="text-2xl" />,
    title: 'Lightning Fast',
    desc:  'Pre-trained model returns 5 recommendations in under a second.',
    color: 'text-emerald-400',
    bg:    'bg-emerald-500/10',
  },
  {
    icon: <MdLibraryBooks className="text-2xl" />,
    title: '4,800+ Movies',
    desc:  'Comprehensive TMDB 5000 dataset covering films from every era.',
    color: 'text-sky-400',
    bg:    'bg-sky-500/10',
  },
  {
    icon: <MdTouchApp className="text-2xl" />,
    title: 'Simple Search',
    desc:  'Just type a movie you love and let the AI do the rest.',
    color: 'text-violet-400',
    bg:    'bg-violet-500/10',
  },
]

const popularSearches = [
  'The Dark Knight', 'Inception', 'Interstellar', 'Avatar',
  'Avengers', 'Pulp Fiction', 'The Matrix', 'Titanic',
]

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="badge-accent mb-3">Why CineMatch</p>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Smarter Movie Discovery
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto">
            Powered by scikit-learn's K-Nearest Neighbors algorithm and cosine similarity
            on rich movie metadata.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon, title, desc, color, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card p-6 hover:border-white/15 transition-colors duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-4`}>
                {icon}
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Popular searches ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 sm:p-12 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            Try a popular search
          </h2>
          <p className="text-zinc-500 mb-8">Click any title to see its AI recommendations instantly.</p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {popularSearches.map((title) => (
              <Link
                key={title}
                to={`/discover?q=${encodeURIComponent(title)}`}
                className="px-4 py-2 rounded-full border border-white/10 text-zinc-300 text-sm
                           hover:border-primary-500/50 hover:text-primary-300 hover:bg-primary-500/5
                           transition-all duration-200"
              >
                {title}
              </Link>
            ))}
          </div>

          <Link to="/discover" className="btn-primary inline-flex mx-auto">
            Open Discovery <HiArrowRight />
          </Link>
        </motion.div>
      </section>
    </>
  )
}
