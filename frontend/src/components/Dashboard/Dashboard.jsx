import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Target, 
  BarChart3, 
  History,
  Code,
  Users,
  Briefcase,
  Palette,
  Database,
  Shield,
  Star,
  Award,
  MessageSquare,
  Bot,
  Brain,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { interviewService, analyticsService } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import SkillsRadar from './SkillsRadar'
import SkillAssessmentPanel from './SkillAssessmentPanel'
import ProgressChart from './ProgressChart'
import RecentSessions from './RecentSessions'

// Count-up animation hook for numbers
function useCountUp(end, duration = 800, enabled = true) {
  const [count, setCount] = useState(0)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!enabled || prefersReducedMotion) {
      setCount(end)
      return
    }

    let startTime = null
    const startValue = 0
    const endValue = end

    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (endValue - startValue) * easeOut)
      
      setCount(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(endValue)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, enabled, prefersReducedMotion])

  return count
}

// Lightweight mouse glow handler with requestAnimationFrame for smooth performance
// Use WeakMap to track animation frames per card element
const rafMap = new WeakMap()

const handleCardMouseMove = (e) => {
  const card = e.currentTarget
  
  // Cancel any pending animation frame for this specific card
  const existingRaf = rafMap.get(card)
  if (existingRaf) {
    cancelAnimationFrame(existingRaf)
  }
  
  // Use requestAnimationFrame for smooth updates
  const rafId = requestAnimationFrame(() => {
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty('--mouse-x', `${x}%`)
    card.style.setProperty('--mouse-y', `${y}%`)
    rafMap.delete(card) // Clean up after execution
  })
  
  rafMap.set(card, rafId)
}

const handleCardMouseLeave = (e) => {
  const card = e.currentTarget
  
  // Cancel any pending animation frame for this specific card
  const existingRaf = rafMap.get(card)
  if (existingRaf) {
    cancelAnimationFrame(existingRaf)
    rafMap.delete(card)
  }
  
  // Smoothly reset to center
  card.style.setProperty('--mouse-x', '50%')
  card.style.setProperty('--mouse-y', '50%')
}

// Simple and unique time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) {
    return 'Good Morning'
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon'
  } else if (hour >= 17 && hour < 22) {
    return 'Good Evening'
  } else {
    return 'Good Evening'
  }
}

// Get a unique emoji based on time
const getGreetingEmoji = () => {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) {
    return '☀️'
  } else if (hour >= 12 && hour < 17) {
    return '🌤️'
  } else if (hour >= 17 && hour < 22) {
    return '🌙'
  } else {
    return '⭐'
  }
}

// Get interactive wishes based on time and stats
const getInteractiveWishes = (stats) => {
  const hour = new Date().getHours()
  const wishes = []
  
  if (hour >= 5 && hour < 12) {
    wishes.push(
      "Ready to ace those interviews?",
      "Let's make today productive!",
      "Time to level up your skills!",
      "Start your practice journey!"
    )
  } else if (hour >= 12 && hour < 17) {
    wishes.push(
      "Keep the momentum going!",
      "Ready for some practice?",
      "Let's continue your journey!",
      "Time to sharpen your skills!"
    )
  } else if (hour >= 17 && hour < 22) {
    wishes.push(
      "Perfect time to practice!",
      "Let's end the day strong!",
      "Ready to improve?",
      "Time for focused preparation!"
    )
  } else {
    wishes.push(
      "Dedication pays off!",
      "That's commitment!",
      "Don't forget to rest!",
      "Remember to take breaks!"
    )
  }
  
  // Add stats-based wishes
  if (stats && stats.totalSessions > 0) {
    if (stats.averageScore >= 8) {
      wishes.unshift("You're doing amazing!")
    } else if (stats.averageScore >= 6) {
      wishes.unshift("Great progress!")
    } else {
      wishes.unshift("Every practice makes you stronger!")
    }
  } else {
    wishes.unshift("Ready to start your interview journey?")
  }
  
  return wishes
}

// Helper function to get motivational message
const getMotivationalMessage = (stats) => {
  if (!stats || stats.totalSessions === 0) {
    return "Ready to start your interview journey? Let's begin!"
  }
  if (stats.averageScore >= 8) {
    return "You're doing amazing! Keep up the excellent work!"
  }
  if (stats.averageScore >= 6) {
    return "Great progress! You're on the right track."
  }
  return "Every practice session makes you stronger. Keep going!"
}

// Role-based interview types - mapped to core types but with role-specific questions
const interviewTypes = [
  // Core Types
  { id: 'technical', name: 'Technical Interview', icon: Code, color: 'from-cyan-500 to-blue-600', description: 'Coding challenges and algorithms', category: 'core' },
  { id: 'behavioral', name: 'Behavioral Interview', icon: Users, color: 'from-blue-500 to-indigo-600', description: 'STAR method and soft skills', category: 'core' },
  { id: 'system-design', name: 'System Design', icon: Database, color: 'from-indigo-500 to-purple-600', description: 'Architecture and scalability', category: 'core' },
  
  // Role-Specific Types
  { id: 'software-engineer', name: 'Software Engineer', icon: Code, color: 'from-cyan-500 to-blue-600', description: 'Technical interviews for software engineers', category: 'role', baseType: 'technical' },
  { id: 'data-scientist', name: 'Data Scientist', icon: BarChart3, color: 'from-blue-500 to-cyan-600', description: 'ML algorithms, statistics, data analysis', category: 'role', baseType: 'technical' },
  { id: 'product-manager', name: 'Product Manager', icon: Briefcase, color: 'from-indigo-500 to-blue-600', description: 'Product strategy and prioritization', category: 'role', baseType: 'behavioral' },
  { id: 'designer', name: 'UX/UI Designer', icon: Palette, color: 'from-purple-500 to-indigo-600', description: 'Design thinking and portfolio reviews', category: 'role', baseType: 'behavioral' },
  { id: 'data-engineer', name: 'Data Engineer', icon: Database, color: 'from-cyan-500 to-indigo-600', description: 'Data pipelines and ETL processes', category: 'role', baseType: 'system-design' },
  { id: 'security-engineer', name: 'Security Engineer', icon: Shield, color: 'from-blue-600 to-cyan-600', description: 'Security protocols and threat analysis', category: 'role', baseType: 'technical' },
  { id: 'marketing', name: 'Marketing Professional', icon: MessageSquare, color: 'from-indigo-500 to-purple-600', description: 'Campaign strategy and brand management', category: 'role', baseType: 'behavioral' },
  { id: 'sales', name: 'Sales Professional', icon: Target, color: 'from-blue-500 to-cyan-600', description: 'Sales techniques and negotiation', category: 'role', baseType: 'behavioral' },
  { id: 'hr', name: 'HR Professional', icon: Users, color: 'from-purple-500 to-indigo-600', description: 'Talent acquisition and HR strategy', category: 'role', baseType: 'behavioral' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startingInterview, setStartingInterview] = useState(false)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [currentWishIndex, setCurrentWishIndex] = useState(0)
  const navigate = useNavigate()
  
  // Ensure stats is always an object to prevent errors
  const displayStats = stats || {
    totalSessions: 0,
    averageScore: 0,
    totalTime: 0,
    improvement: 0
  }
  
  // Animated counts for stats
  const animatedSessions = useCountUp(displayStats.totalSessions || 0, 1000, !loading && !!stats)
  const animatedScore = useCountUp(displayStats.averageScore || 0, 1200, !loading && !!stats)
  
  // Rotate wishes every 4 seconds
  useEffect(() => {
    if (!stats) return
    
    const wishes = getInteractiveWishes(stats)
    const interval = setInterval(() => {
      setCurrentWishIndex((prev) => (prev + 1) % wishes.length)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [stats])

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      try {
        const data = await analyticsService.getDashboard()
        if (isMounted) {
          setStats(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        if (isMounted) {
          // Set default stats for any error to prevent blank page
          setStats({
            totalSessions: 0,
            averageScore: 0,
            totalTime: 0,
            improvement: 0
          })
          setLoading(false)
        }
      }
    }
    
    fetchData()
    
    // Safety timeout - ensure loading doesn't get stuck
    const timeout = setTimeout(() => {
      if (isMounted) {
        setStats(prevStats => {
          if (!prevStats) {
            console.warn('Dashboard loading timeout - setting default stats')
            return {
              totalSessions: 0,
              averageScore: 0,
              totalTime: 0,
              improvement: 0
            }
          }
          return prevStats
        })
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [])


  const startInterview = async (typeId = 'technical', duration = 45) => {
    // Prevent rapid clicks (debounce)
    const now = Date.now()
    if (now - lastClickTime < 2000) {
      return // Ignore if clicked within 2 seconds
    }
    setLastClickTime(now)
    
    if (startingInterview) {
      return // Already starting
    }
    
    setStartingInterview(true)
    try {
      // Find the interview type config
      const interviewType = interviewTypes.find(t => t.id === typeId)
      // Use baseType for role-specific interviews, or the type itself for core types
      const backendType = interviewType?.baseType || typeId
      
      const response = await interviewService.startInterview({
        type: backendType,
        duration,
        difficulty: 'medium',
        role: interviewType?.category === 'role' ? typeId : undefined, // Pass role for role-specific questions
      })
      // Backend returns { session: { id, ... }, currentQuestion: {...} }
      const sessionId = response.session?.id || response.id
      if (!sessionId) {
        console.error('Response:', response)
        throw new Error('No session ID returned from server')
      }
      navigate(`/interview/${sessionId}`)
    } catch (error) {
      console.error('Failed to start interview:', error)
      
      let errorMessage = 'Failed to start interview. Please try again.'
      
      if (error.response?.status === 429) {
        const retryAfter = error.retryAfter || 60
        errorMessage = `Too many requests. Please wait ${retryAfter} seconds before starting a new interview.`
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setStartingInterview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-cyan-200 rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-500 rounded-full"></div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-0 pb-4 sm:pb-6 md:pb-8 lg:pb-10 px-3 sm:px-4 md:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Section - Enhanced Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-3 sm:pt-5 md:pt-6 mb-5 sm:mb-7 md:mb-9"
        >
          <div className="max-w-3xl mx-auto text-center space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F2937] dark:text-gray-50 flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-2 leading-snug sm:leading-tight tracking-tight">
              {/* Interactive animated emoji */}
              <motion.span 
                className="text-3xl sm:text-4xl md:text-5xl cursor-pointer select-none inline-block"
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                whileHover={{
                  rotate: 360,
                  scale: 1.2,
                }}
                whileTap={{
                  scale: 0.9,
                  rotate: [0, -20, 20, -20, 0]
                }}
              >
                {getGreetingEmoji()}
              </motion.span>
              <span className="text-gray-800 dark:text-gray-100">{getGreeting()}</span>
              <span className="text-gray-800 dark:text-gray-100 hidden sm:inline">,</span>
              <motion.span 
                className="text-gray-800 dark:text-gray-100"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {user?.name?.split(' ')[0] || 'there'}
              </motion.span>
            </h1>
            
            {/* Stylish interactive rotating wishes */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentWishIndex}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative max-w-2xl mx-auto px-4 sm:px-6 md:px-0 min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center"
              >
                {/* Decorative background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5 rounded-2xl blur-xl -z-10" />
                
                {/* Stylish wish container */}
                <motion.div
                  className="relative inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/20 dark:shadow-gray-900/30"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 30px rgba(6, 182, 212, 0.2)",
                    borderColor: "rgba(6, 182, 212, 0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Sparkle icon */}
                  <motion.div
                    animate={{
                      rotate: [0, 180, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-cyan-500 dark:text-cyan-400"
                  >
                    ✨
                  </motion.div>
                  
                  {/* Wish text with gradient */}
                  <motion.span
                    className="text-sm sm:text-base md:text-lg font-semibold bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 dark:from-gray-200 dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent cursor-default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {getInteractiveWishes(displayStats)[currentWishIndex]}
                  </motion.span>
                  
                  {/* Sparkle icon */}
                  <motion.div
                    animate={{
                      rotate: [360, 180, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="text-indigo-500 dark:text-indigo-400"
                  >
                    ✨
                  </motion.div>
                  
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                    animate={{
                      x: ["-100%", "100%"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
          {displayStats.totalSessions > 0 && (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 px-2 sm:px-4 md:px-0">
              <motion.div 
                className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-cyan-400/30 dark:border-cyan-500/30 rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg hover:border-cyan-400/50 transition-all"
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-300" />
                <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100">{displayStats.totalSessions} Sessions</span>
              </motion.div>
              {displayStats.averageScore > 0 && (
                <motion.div 
                  className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg hover:border-gray-400 dark:hover:border-gray-600 transition-all"
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100">{displayStats.averageScore.toFixed(1)}% Average</span>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Mock Interview Quick Start - Enhanced Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5 sm:mb-7 md:mb-8"
        >
          <Link to="/mock-interview" className="block">
            <motion.div 
              className="card glass dash-card cursor-pointer group relative overflow-hidden border-2 border-transparent hover:border-[#E35336]/30 p-4 sm:p-6 md:p-8 transition-all duration-300"
              whileHover={{ 
                y: -8,
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(227, 83, 54, 0.25), 0 10px 20px rgba(227, 83, 54, 0.15)"
              }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              {/* Shine sweep animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none z-20" />
              
              {/* Background gradients */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100/8 to-gray-200/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5 md:gap-6 relative z-10">
                <div className="flex-1 w-full md:w-auto">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1F2937] dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3 flex-wrap">
                    {/* Premium Brain AI icon with unique design and rotation */}
                    <motion.div 
                      className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                    >
                      {/* Gradient background with neural network pattern */}
                      <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-indigo-500/20 dark:from-blue-500/30 dark:via-cyan-500/25 dark:to-indigo-500/30" />
                      
                      {/* Animated glow effect */}
                      <motion.div 
                        className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400/30 to-cyan-400/30 dark:from-blue-400/40 dark:to-cyan-400/40"
                        animate={{ 
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      />
                      
                      {/* Border with gradient */}
                      <div className="absolute inset-0 rounded-lg sm:rounded-xl border-2 border-transparent bg-gradient-to-br from-blue-500/40 via-cyan-500/40 to-indigo-500/40 dark:from-blue-400/50 dark:via-cyan-400/50 dark:to-indigo-400/50 [mask-image:linear-gradient(#fff_0_0)] [mask-composite:xor] [mask-composite:exclude]" />
                      <div className="absolute inset-[1px] rounded-lg sm:rounded-xl border border-blue-500/30 dark:border-blue-400/40" />
                      
                      {/* Shadow glow */}
                      <div className="absolute inset-0 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/20 dark:shadow-blue-400/30" />
                      
                      {/* Brain icon with gradient and glow */}
                      <div className="relative z-10">
                        <Brain 
                          className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600 dark:text-blue-400" 
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6)) drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))',
                            strokeWidth: 2.5
                          }}
                        />
                      </div>
                      
                      {/* Neural network dots pattern */}
                      <div className="absolute inset-0 rounded-lg sm:rounded-xl overflow-hidden pointer-events-none">
                        <div className="absolute top-1 left-1 w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                        <div className="absolute top-2 right-2 w-1 h-1 bg-blue-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute bottom-2 left-2 w-1 h-1 bg-indigo-400/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute bottom-1 right-1 w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
                      </div>
                    </motion.div>
                    <span className="leading-tight">Mock Interview Mode</span>
                    <motion.span 
                      className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#E35336]/10 dark:bg-[#E35336]/20 text-[#E35336] dark:text-[#E35336] text-xs font-bold rounded-full border border-[#E35336]/30 dark:border-[#E35336]/40 shadow-sm group-hover:bg-[#E35336]/15 group-hover:border-[#E35336]/40 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      NEW
                    </motion.span>
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    Practice with a full interview session - 5-10 questions, auto-flow, and comprehensive feedback
                  </p>
                </div>
                <div className="w-full md:w-auto">
                  <motion.button
                    whileHover={{ 
                      y: -6,
                      scale: 1.05,
                      boxShadow: "0 20px 40px rgba(227, 83, 54, 0.4)"
                    }}
                    whileTap={{ scale: 0.95, y: -2 }}
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{
                      y: {
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      default: { duration: 0.25, ease: "easeOut" }
                    }}
                    className="w-full md:w-auto px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-[#E35336] text-white rounded-lg sm:rounded-xl md:rounded-2xl font-semibold hover:bg-[#A0522D] transition-all duration-[250ms] flex items-center justify-center space-x-2 shadow-xl shadow-[#E35336]/40 hover:shadow-2xl hover:shadow-[#E35336]/60 relative overflow-hidden group/btn border-2 border-[#E35336]/50 hover:border-[#A0522D]/70 btn-press btn-float text-sm sm:text-base"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-out" />
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                    </motion.div>
                    <span className="relative z-10">Start Mock Interview</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Interview Type Selection - Enhanced Mobile */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F2937] dark:text-gray-100 mb-1 sm:mb-2">
              Start Your Practice Session
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">Choose an interview type to begin your preparation</p>
          </motion.div>
          
          {/* Core Interview Types */}
          <div className="mb-6 sm:mb-8 md:mb-10">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#1F2937] dark:text-gray-100 mb-4 sm:mb-6 uppercase tracking-wider px-2 sm:px-0">Core Interview Types</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4 md:gap-5">
              {interviewTypes.filter(t => t.category === 'core').map((type, index) => {
                const Icon = type.icon
                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="h-full"
                  >
                    <div 
                      className="card glass dash-card cursor-pointer h-full flex flex-col border-2 border-transparent hover:border-sky-400/50 hover:shadow-2xl hover:shadow-sky-500/30 relative overflow-hidden group p-4 sm:p-5 md:p-6"
                      onClick={() => !startingInterview && startInterview(type.id, type.id === 'system-design' ? 60 : 45)}
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/0 to-gray-200/0 group-hover:from-gray-100/10 group-hover:to-gray-200/10 transition-all duration-300 rounded-2xl" />
                      <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                      <motion.div 
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-gray-200/40 dark:shadow-gray-700/40 relative z-10 group-hover:shadow-xl group-hover:shadow-gray-300/60 dark:group-hover:shadow-gray-600/60 transition-all duration-[250ms] icon-glow border border-gray-200 dark:border-gray-700"
                        whileHover={{ 
                          rotate: [0, -12, 12, -12, 0], 
                          scale: 1.25,
                          boxShadow: "0 20px 40px rgba(107, 114, 128, 0.3)"
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-700 dark:text-gray-300 drop-shadow-sm" />
                        <motion.span 
                          className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-[#E35336] rounded-full border-2 border-white shadow-sm"
                          whileHover={{ scale: 1.3 }}
                          animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 8px rgba(227, 83, 54, 0.5)", "0 0 12px rgba(227, 83, 54, 0.7)", "0 0 8px rgba(227, 83, 54, 0.5)"] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                      <h3 className="text-lg sm:text-xl md:text-xl font-bold text-[#1F2937] dark:text-gray-100 mb-1.5 sm:mb-2 relative z-10">{type.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 relative z-10 leading-relaxed flex-grow">{type.description}</p>
                      <motion.button
                        disabled={startingInterview}
                        whileHover={{ 
                          y: -4,
                          scale: 1.05,
                          boxShadow: "0 12px 30px rgba(227, 83, 54, 0.3)"
                        }}
                        whileTap={{ scale: 0.95, y: -1 }}
                        animate={{
                          y: [0, -3, 0],
                        }}
                        transition={{
                          y: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          },
                          default: { duration: 0.25, ease: "easeOut" }
                        }}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#E35336] text-white rounded-lg sm:rounded-xl font-semibold hover:bg-[#A0522D] transition-all duration-[250ms] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-[#E35336]/30 hover:shadow-xl hover:shadow-[#E35336]/50 relative overflow-hidden group border-2 border-[#E35336]/50 hover:border-[#A0522D]/70 z-10 btn-press btn-float text-sm sm:text-base"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 90 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <Play className="w-4 h-4 relative z-10" />
                        </motion.div>
                        <span className="relative z-10">{startingInterview ? 'Starting...' : 'Start Interview'}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Role-Specific Interview Types */}
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#1F2937] dark:text-gray-100 mb-4 sm:mb-6 uppercase tracking-wider px-2 sm:px-0">Role-Specific Interviews</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {interviewTypes.filter(t => t.category === 'role').map((type, index) => {
                const Icon = type.icon
                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="h-full"
                  >
                    <div 
                      className="card glass dash-card cursor-pointer h-full flex flex-col border-2 border-transparent hover:border-sky-400/50 hover:shadow-2xl hover:shadow-sky-500/30 relative overflow-hidden group p-4 sm:p-5"
                      onClick={() => !startingInterview && startInterview(type.id, 45)}
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/0 to-gray-200/0 group-hover:from-gray-100/10 group-hover:to-gray-200/10 transition-all duration-300 rounded-2xl" />
                      <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                      <motion.div 
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2 sm:mb-3 shadow-lg shadow-gray-200/40 dark:shadow-gray-700/40 relative z-10 group-hover:shadow-xl group-hover:shadow-gray-300/60 dark:group-hover:shadow-gray-600/60 transition-all duration-[250ms] icon-glow border border-gray-200 dark:border-gray-700"
                        whileHover={{ 
                          rotate: [0, -12, 12, -12, 0], 
                          scale: 1.25,
                          boxShadow: "0 20px 40px rgba(107, 114, 128, 0.3)"
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-700 dark:text-gray-300 drop-shadow-sm" />
                        <motion.span 
                          className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full border-2 border-white shadow-sm shadow-cyan-500/50"
                          whileHover={{ scale: 1.3 }}
                          animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 6px rgba(6, 182, 212, 0.5)", "0 0 10px rgba(6, 182, 212, 0.7)", "0 0 6px rgba(6, 182, 212, 0.5)"] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1F2937] dark:text-gray-100 mb-1.5 sm:mb-2 relative z-10">{type.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 sm:mb-4 relative z-10 leading-relaxed flex-grow">{type.description}</p>
                      <motion.button
                        disabled={startingInterview}
                        whileHover={{ 
                          y: -4,
                          scale: 1.05,
                          boxShadow: "0 12px 30px rgba(227, 83, 54, 0.3)"
                        }}
                        whileTap={{ scale: 0.95, y: -1 }}
                        animate={{
                          y: [0, -3, 0],
                        }}
                        transition={{
                          y: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          },
                          default: { duration: 0.25, ease: "easeOut" }
                        }}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#E35336] text-white rounded-lg sm:rounded-xl font-semibold hover:bg-[#A0522D] transition-all duration-[250ms] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-xs sm:text-sm shadow-lg shadow-[#E35336]/30 hover:shadow-xl hover:shadow-[#E35336]/50 relative overflow-hidden group border-2 border-[#E35336]/50 hover:border-[#A0522D]/70 z-10 btn-press btn-float"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 90 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <Play className="w-3.5 h-3.5 relative z-10" />
                        </motion.div>
                        <span className="relative z-10">{startingInterview ? 'Starting...' : 'Start Interview'}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Stats Section - Interactive Animated Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8 md:mb-10">
          {/* Total Sessions Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <motion.div 
              className="card glass dash-card border-2 border-transparent hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 cursor-pointer relative overflow-hidden group"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              whileHover={{ 
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15), 0 10px 20px rgba(59, 130, 246, 0.1)"
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated background gradient */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:via-cyan-500/8 group-hover:to-indigo-500/10 transition-opacity duration-300 rounded-2xl"
                animate={{
                  background: [
                    'linear-gradient(135deg, rgba(59, 130, 246, 0) 0%, rgba(6, 182, 212, 0) 50%, rgba(99, 102, 241, 0) 100%)',
                    'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(6, 182, 212, 0.03) 50%, rgba(99, 102, 241, 0.05) 100%)',
                    'linear-gradient(135deg, rgba(59, 130, 246, 0) 0%, rgba(6, 182, 212, 0) 50%, rgba(99, 102, 241, 0) 100%)'
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Border glow on hover */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-400/30 dark:group-hover:border-blue-400/40 transition-colors duration-300 pointer-events-none" />
              
              <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              <div className="flex items-center justify-between relative z-10 p-4 sm:p-5 md:p-6">
                <div className="flex-1">
                  <motion.p 
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 uppercase tracking-wider font-medium"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    Total Sessions
                  </motion.p>
                  <motion.p 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 dark:from-blue-400 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent tabular-nums"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  >
                    {animatedSessions}
                  </motion.p>
                  
                  {/* Progress indicator bar */}
                  {displayStats.totalSessions > 0 && (
                    <motion.div 
                      className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((displayStats.totalSessions / 100) * 100, 100)}%` }}
                        transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                      />
                    </motion.div>
                  )}
                </div>
                
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/30 dark:to-cyan-500/30 backdrop-blur-md flex items-center justify-center border-2 border-blue-400/30 dark:border-blue-400/40 shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 dark:group-hover:shadow-blue-400/30 transition-all duration-300"
                  whileHover={{ rotate: 360, scale: 1.15 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Average Score Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <motion.div 
              className="card glass dash-card border-2 border-transparent hover:border-green-400/50 dark:hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/20 dark:hover:shadow-green-400/20 cursor-pointer relative overflow-hidden group"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              whileHover={{ 
                boxShadow: "0 20px 40px rgba(34, 197, 94, 0.15), 0 10px 20px rgba(34, 197, 94, 0.1)"
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated background gradient */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-emerald-500/0 to-teal-500/0 group-hover:from-green-500/10 group-hover:via-emerald-500/8 group-hover:to-teal-500/10 transition-opacity duration-300 rounded-2xl"
                animate={{
                  background: [
                    'linear-gradient(135deg, rgba(34, 197, 94, 0) 0%, rgba(16, 185, 129, 0) 50%, rgba(20, 184, 166, 0) 100%)',
                    'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.03) 50%, rgba(20, 184, 166, 0.05) 100%)',
                    'linear-gradient(135deg, rgba(34, 197, 94, 0) 0%, rgba(16, 185, 129, 0) 50%, rgba(20, 184, 166, 0) 100%)'
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Border glow on hover */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-green-400/30 dark:group-hover:border-green-400/40 transition-colors duration-300 pointer-events-none" />
              
              <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              <div className="flex items-center justify-between relative z-10 p-4 sm:p-5 md:p-6">
                <div className="flex-1">
                  <motion.p 
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 uppercase tracking-wider font-medium"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    Average Score
                  </motion.p>
                  <motion.p 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent tabular-nums"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                  >
                    {animatedScore.toFixed(1)}%
                  </motion.p>
                  
                  {/* Progress indicator bar */}
                  {displayStats.averageScore > 0 && (
                    <motion.div 
                      className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${displayStats.averageScore}%` }}
                        transition={{ delay: 1.1, duration: 1.2, ease: "easeOut" }}
                      />
                    </motion.div>
                  )}
                </div>
                
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/30 dark:to-emerald-500/30 backdrop-blur-md flex items-center justify-center border-2 border-green-400/30 dark:border-green-400/40 shadow-lg shadow-green-500/20 dark:shadow-green-400/20 group-hover:shadow-xl group-hover:shadow-green-500/30 dark:group-hover:shadow-green-400/30 transition-all duration-300"
                  whileHover={{ rotate: 360, scale: 1.15 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Charts Section - Enhanced Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div 
              className="card dash-card border-2 border-transparent hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/30 relative overflow-hidden group"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/8 group-hover:to-blue-500/8 transition-opacity duration-300 rounded-2xl" />
              <div className="absolute inset-0 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <h3 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-gray-100 mb-4 sm:mb-6 flex items-center relative z-10 px-4 sm:px-6 pt-4 sm:pt-6">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gray-100/50 dark:bg-gray-800/50 mr-2"
                >
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
                </motion.div>
                Progress Over Time
              </h3>
              <div className="relative z-10">
                <ProgressChart />
              </div>
            </div>
          </motion.div>

          {/* Skills Assessment - Premium Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <SkillAssessmentPanel />
          </motion.div>
        </div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
            <div 
              className="card dash-card border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-2xl hover:shadow-gray-200/30 dark:hover:shadow-gray-700/30 relative overflow-hidden group"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100/0 to-gray-200/0 group-hover:from-gray-100/8 group-hover:to-gray-200/8 transition-opacity duration-300 rounded-2xl" />
            <div className="absolute inset-0 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            <div className="relative z-10">
              <RecentSessions />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
