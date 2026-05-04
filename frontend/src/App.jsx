/**
 * App.jsx
 * Root application component: routing and shared layout.
 */

import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home     from './pages/Home'
import Discover from './pages/Discover'
import About    from './pages/About'
import NotFound from './pages/NotFound'

/** Wraps every page with a fade-in animation */
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-screen bg-dark-400">
      <Navbar />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"        element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/discover" element={<PageWrapper><Discover /></PageWrapper>} />
            <Route path="/about"   element={<PageWrapper><About /></PageWrapper>} />
            <Route path="*"        element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
