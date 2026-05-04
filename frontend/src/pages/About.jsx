/**
 * About.jsx
 * Explains the technology and ML pipeline used in CineMatch.
 */

import { motion } from 'framer-motion'
import { MdDataset, MdBuild, MdModelTraining, MdApi } from 'react-icons/md'
import { FaPython, FaReact } from 'react-icons/fa'
import { SiScikitlearn, SiFlask, SiPandas } from 'react-icons/si'

const steps = [
  {
    icon: <MdDataset className="text-2xl" />,
    color: 'text-sky-400', bg: 'bg-sky-500/10',
    title: '1. Load & Merge',
    desc:  'TMDB 5000 movies and credits CSVs are loaded with Pandas and merged on movie ID.',
  },
  {
    icon: <MdBuild className="text-2xl" />,
    color: 'text-emerald-400', bg: 'bg-emerald-500/10',
    title: '2. Feature Engineering',
    desc:  'Genres, keywords, top-3 cast members and director are extracted and combined into a single "tags" string.',
  },
  {
    icon: <MdModelTraining className="text-2xl" />,
    color: 'text-violet-400', bg: 'bg-violet-500/10',
    title: '3. Vectorise + Train',
    desc:  'CountVectorizer (5000 features, English stop-words) converts tags to vectors. KNN is trained with cosine distance.',
  },
  {
    icon: <MdApi className="text-2xl" />,
    color: 'text-primary-400', bg: 'bg-primary-500/10',
    title: '4. Serve via API',
    desc:  'Flask exposes a REST endpoint. Given a title, KNN finds the 5 nearest neighbours (excluding itself) in O(n) time.',
  },
]

const stack = [
  { icon: <FaPython />,        label: 'Python 3.11',     color: 'text-yellow-400' },
  { icon: <SiFlask />,         label: 'Flask 3',         color: 'text-white'      },
  { icon: <SiPandas />,        label: 'Pandas',          color: 'text-blue-400'   },
  { icon: <SiScikitlearn />,   label: 'scikit-learn',    color: 'text-orange-400' },
  { icon: <FaReact />,         label: 'React 18',        color: 'text-cyan-400'   },
]

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-5xl font-extrabold text-white mb-4 tracking-tight">
            How CineMatch Works
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            A complete look at the content-based filtering pipeline — from raw CSV data
            to a real-time REST API powering this React frontend.
          </p>
        </motion.div>

        {/* ── ML Pipeline ── */}
        <section className="mb-16">
          <h2 className="section-title text-white mb-8">ML Pipeline</h2>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-10 bottom-10 w-px bg-gradient-to-b from-primary-500/40 to-transparent hidden sm:block" />

            <div className="space-y-5">
              {steps.map(({ icon, color, bg, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-5 glass-card p-6"
                >
                  <div className={`w-12 h-12 rounded-xl flex-shrink-0 ${bg} ${color} flex items-center justify-center`}>
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg mb-1">{title}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="mb-16">
          <h2 className="section-title text-white mb-6">Tech Stack</h2>
          <div className="flex flex-wrap gap-3">
            {stack.map(({ icon, label, color }) => (
              <div key={label}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card ${color} text-sm font-medium`}>
                <span className="text-lg">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* ── Algorithm detail ── */}
        <section className="glass-card p-8">
          <h2 className="section-title text-white mb-4">Algorithm Deep-Dive</h2>
          <div className="prose prose-sm prose-invert max-w-none text-zinc-400 leading-relaxed space-y-4">
            <p>
              Content-based filtering recommends items similar to what a user has already shown interest in.
              Unlike collaborative filtering, it doesn't need user history — only metadata about the items.
            </p>
            <p>
              <strong className="text-white">Vectorisation:</strong>{' '}
              Each movie is represented by a "tags" document — a bag of words formed by
              combining the overview, genre names, top-3 cast, director and keywords.
              <code className="text-primary-300 bg-primary-500/10 px-1 py-0.5 rounded">CountVectorizer</code> converts
              these into 5,000-dimensional vectors.
            </p>
            <p>
              <strong className="text-white">Cosine Similarity:</strong>{' '}
              KNN with <code className="text-primary-300 bg-primary-500/10 px-1 py-0.5 rounded">metric='cosine'</code> measures
              the angle between two movie vectors. A cosine similarity of 1 means identical content;
              0 means completely unrelated.
            </p>
            <p>
              <strong className="text-white">Brute-Force Search:</strong>{' '}
              Because our vector space has 5,000 dimensions, tree-based approximate methods
              perform poorly. Brute-force search is fast enough for ~4,800 movies.
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
