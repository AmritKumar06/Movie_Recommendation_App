/**
 * Footer.jsx
 * Site footer with branding, links and credit.
 */

import { Link } from 'react-router-dom'
import { MdLocalMovies } from 'react-icons/md'
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa'

const footerLinks = {
  Product: [
    { label: 'Home',    to: '/'        },
    { label: 'Discover', to: '/discover' },
    { label: 'About',   to: '/about'   },
  ],
  Resources: [
    { label: 'TMDB',       href: 'https://www.themoviedb.org/' },
    { label: 'Kaggle Dataset', href: 'https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata' },
    { label: 'scikit-learn',  href: 'https://scikit-learn.org/' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-400/60 backdrop-blur-xl mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
                <MdLocalMovies className="text-white text-xl" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Cine<span className="text-primary-400">Match</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              AI-powered movie recommendations using content-based filtering
              with KNN &amp; cosine similarity on the TMDB 5000 dataset.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: <FaGithub />,   href: 'https://github.com/'    },
                { icon: <FaTwitter />,  href: 'https://twitter.com/'   },
                { icon: <FaLinkedin />, href: 'https://linkedin.com/'  },
              ].map(({ icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400
                             border border-white/8 hover:border-primary-500/50 hover:text-primary-400
                             transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, to, href }) => (
                  <li key={label}>
                    {to ? (
                      <Link to={to} className="text-zinc-500 text-sm hover:text-white transition-colors duration-200">
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 text-sm hover:text-white transition-colors duration-200"
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} CineMatch. Built with ❤️ using React, Flask &amp; scikit-learn.
          </p>
          <p className="text-zinc-600 text-xs">
            Movie data provided by{' '}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer"
               className="text-zinc-500 hover:text-white transition-colors">
              TMDB
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
