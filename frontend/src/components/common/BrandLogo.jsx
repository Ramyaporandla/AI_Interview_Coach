import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { motion } from 'framer-motion'
import LogoIcon from './LogoIcon'

// FAANG-level professional logo component
// Ultra-minimal, enterprise-grade design

export default function BrandLogo({ className = '', variant = 'minimal' }) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Link 
      to={user ? "/dashboard" : "/"} 
      className={`flex items-center space-x-3 group ${className}`}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-12 h-12 bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all border border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-600"
      >
        <LogoIcon size={28} variant={variant} />
      </motion.div>
      <div className="flex flex-col">
        <span 
          className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} group-hover:text-[#E35336] dark:group-hover:text-[#E35336] transition-colors tracking-tight`}
          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        >
          Interview Coach
        </span>
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} hidden sm:block font-medium`} style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          AI-Powered Preparation
        </span>
      </div>
    </Link>
  )
}
