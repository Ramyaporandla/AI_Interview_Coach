import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { LogOut, User, Home, Moon, Sun, FileText, Award, BookOpen } from 'lucide-react'
import GlassCard from './GlassCard'
import BrandLogo from './BrandLogo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ✅ Consistent nav item sizing + spacing
  const navItemBase =
    'group relative flex items-center gap-2 px-2 lg:px-4 py-2 whitespace-nowrap ' +
    'text-gray-700 dark:text-gray-300 ' +
    'hover:text-cyan-600 dark:hover:text-cyan-400 ' +
    'rounded-lg hover:bg-white/60 dark:hover:bg-gray-800 ' +
    'shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden'

  // ✅ Shine effect (fixed duration class)
  const shine =
    'absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent ' +
    'translate-x-[-120%] group-hover:translate-x-[120%] ' +
    'transition-transform duration-700 ease-in-out pointer-events-none'

  return (
    <nav className="bg-white/50 dark:bg-gray-950/95 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-gray-900/50 border-b border-white/30 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <BrandLogo />

          {/* ✅ reduced gap for cleaner spacing */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleTheme()
              }}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95, y: 0 }}
              className="group relative p-2 rounded-lg whitespace-nowrap text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-sm hover:shadow-md overflow-hidden"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              type="button"
            >
              <div className={shine} />
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180 relative z-10" />
              ) : (
                <Moon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 relative z-10" />
              )}
            </motion.button>

            {user ? (
              <>
                <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95, y: 0 }}>
                  <Link to="/dashboard" className={navItemBase}>
                    <div className={shine} />
                    <Home className="w-5 h-5 relative z-10" />
                    {/* ✅ text shows only on lg+ to fix spacing */}
                    <span className="hidden lg:inline font-medium relative z-10">Dashboard</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95, y: 0 }}>
                  <Link to="/question-bank" className={navItemBase}>
                    <div className={shine} />
                    <BookOpen className="w-5 h-5 relative z-10" />
                    <span className="hidden lg:inline font-medium relative z-10">Question Bank</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95, y: 0 }}>
                  <Link to="/skill-assessment" className={navItemBase}>
                    <div className={shine} />
                    <Award className="w-5 h-5 relative z-10" />
                    <span className="hidden lg:inline font-medium relative z-10">Skill Assessment</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95, y: 0 }}>
                  <Link to="/resume-ats" className={navItemBase}>
                    <div className={shine} />
                    <FileText className="w-5 h-5 relative z-10" />
                    <span className="hidden lg:inline font-medium relative z-10">Resume ATS</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95, y: 0 }}>
                  {/* ✅ same spacing rules applied to the user chip */}
                  <GlassCard className="group relative flex items-center gap-2 px-2 lg:px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 bg-white/50 border-white/30 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className={shine} />
                    <div className="w-8 h-8 bg-[#E35336] rounded-full flex items-center justify-center shadow-lg shadow-[#E35336]/30 relative z-10">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden lg:inline font-semibold relative z-10">
                      {user?.name || 'User'}
                    </span>
                  </GlassCard>
                </motion.div>

                <motion.button
                  onClick={handleLogout}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95, y: 0 }}
                  className="group relative flex items-center gap-2 px-2 lg:px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium shadow-sm hover:shadow-md overflow-hidden"
                  type="button"
                >
                  <div className={shine} />
                  <LogOut className="w-4 h-4 relative z-10" />
                  <span className="hidden lg:inline relative z-10">Logout</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95, y: 0 }}>
                  <Link to="/skill-assessment" className={navItemBase}>
                    <div className={shine} />
                    <Award className="w-5 h-5 relative z-10" />
                    <span className="hidden lg:inline font-medium relative z-10">Skill Assessment</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95, y: 0 }}>
                  <Link to="/login" className={navItemBase}>
                    <div className={shine} />
                    <span className="relative z-10 font-medium">Sign In</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ y: -3, scale: 1.05 }} whileTap={{ scale: 0.95, y: 0 }}>
                  <Link
                    to="/register"
                    className="group relative px-4 lg:px-6 py-2 whitespace-nowrap bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50 overflow-hidden"
                  >
                    <div className={shine} />
                    <span className="relative z-10">Get Started</span>
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
