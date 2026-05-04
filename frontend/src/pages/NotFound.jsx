/**
 * NotFound.jsx
 * 404 page.
 */

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiArrowLeft } from 'react-icons/hi'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="font-display text-[10rem] font-black text-primary-500/20 leading-none mb-4">
          404
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-zinc-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">
          <HiArrowLeft /> Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
