import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyticsService } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { Loader, AlertCircle, Bot, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

// Map question types to display names
const skillNameMap = {
  'technical': 'Technical',
  'behavioral': 'Behavioral',
  'system-design': 'System Design',
  'coding': 'Coding',
  'algorithms': 'Algorithms',
  'problem-solving': 'Problem Solving',
  'communication': 'Communication'
}

// Count-up animation hook
function useCountUp(end, duration = 600, enabled = true) {
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

// Progress bar component with animation
function SkillProgressBar({ skill, score, index, isExpanded }) {
  const animatedScore = useCountUp(score, 600, isExpanded)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  // Determine color based on score
  const getColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-blue-500 to-cyan-600'
    if (score >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-orange-500 to-red-500'
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
      animate={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.05, duration: 0.3 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {skill}
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
          {animatedScore}
        </span>
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${getColor(score)} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${animatedScore}%` }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 0.6,
            delay: prefersReducedMotion ? 0 : index * 0.05,
            ease: "easeOut"
          }}
        />
      </div>
    </motion.div>
  )
}

export default function SkillAssessmentPanel() {
  const { theme } = useTheme()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasData, setHasData] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    let mounted = true

    const fetchSkills = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await analyticsService.getSkillsRadar()
        
        if (!mounted) return

        const skillsArray = response?.skills || []
        
        if (Array.isArray(skillsArray) && skillsArray.length > 0) {
          const skillMap = new Map()
          
          skillsArray.forEach(skill => {
            if (!skill || typeof skill !== 'object') return
            
            const type = skill?.type || skill?.question_type || 'unknown'
            const avgScore = parseFloat(skill?.averageScore || skill?.avg_score || skill?.value || 0)
            
            if (isNaN(avgScore)) return
            
            const scorePercent = Math.max(0, Math.min(100, Math.round(avgScore * 10)))
            
            if (!skillMap.has(type)) {
              skillMap.set(type, {
                totalScore: 0,
                count: 0
              })
            }
            
            const existing = skillMap.get(type)
            existing.totalScore += scorePercent
            existing.count += 1
          })

          const transformedData = Array.from(skillMap.entries())
            .map(([type, stats]) => {
              const avgValue = stats.count > 0 
                ? Math.max(0, Math.min(100, Math.round(stats.totalScore / stats.count)))
                : 0
              
              return {
                skill: skillNameMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
                value: avgValue,
                type: type
              }
            })
            .filter(item => item.value >= 0 && item.value <= 100)
            .sort((a, b) => b.value - a.value) // Sort by score descending

          if (transformedData.length > 0) {
            setData(transformedData)
            setHasData(true)
            setLastUpdated(new Date())
          } else {
            setHasData(false)
            setData([])
          }
        } else {
          setHasData(false)
          setData([])
        }
      } catch (err) {
        console.error('[SkillAssessmentPanel] Error fetching skills:', err)
        if (mounted) {
          setError(err.message || 'Failed to load skills data')
          setHasData(false)
          setData([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchSkills()

    return () => {
      mounted = false
    }
  }, [])

  // Calculate overall score
  const overallScore = data.length > 0
    ? Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length)
    : 0

  // Animated overall score
  const animatedOverallScore = useCountUp(overallScore, 600, hasData && !loading)

  // Get top 3 skills for collapsed view
  const topSkills = data.slice(0, 3)
  const displaySkills = isExpanded ? data : topSkills

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return null
    const now = new Date()
    const diffMs = now - lastUpdated
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.8 }}
      className="group relative"
    >
      <div
        className="
          relative
          bg-gradient-to-br from-white/80 via-white/60 to-white/40
          dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/70
          backdrop-blur-xl
          border border-white/50 dark:border-gray-700/50
          rounded-2xl
          shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50
          hover:shadow-2xl hover:shadow-gray-300/50 dark:hover:shadow-gray-800/50
          hover:-translate-y-1
          transition-all duration-300 ease-out
          overflow-hidden
        "
      >
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-blue-500/0 to-indigo-500/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-indigo-500/5 transition-opacity duration-300 rounded-2xl pointer-events-none" />
        
        {/* Border glow on hover */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-cyan-500/20 dark:group-hover:border-cyan-400/20 transition-colors duration-300 pointer-events-none" />

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20">
                <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Skill Assessment
                </h3>
                {lastUpdated && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Last updated: {formatLastUpdated()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            // Loading state
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading assessment...</p>
              </div>
            </div>
          ) : error ? (
            // Error state
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-xs">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 text-orange-500" />
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">
                  Unable to load assessment
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Please try again later
                </p>
              </div>
            </div>
          ) : !hasData || !data || data.length === 0 ? (
            // Empty state
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-xs">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  No assessment yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                  Complete at least one interview to generate scores.
                </p>
              </div>
            </div>
          ) : (
            // Data state
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200/50 dark:border-cyan-800/50">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Overall Score
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {animatedOverallScore}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-cyan-200 dark:border-cyan-800 flex items-center justify-center">
                  <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    {overallScore}
                  </div>
                </div>
              </div>

              {/* Skills List */}
              <div className="space-y-4">
                {displaySkills.map((item, index) => (
                  <SkillProgressBar
                    key={item.skill}
                    skill={item.skill}
                    score={item.value}
                    index={index}
                    isExpanded={isExpanded}
                  />
                ))}
              </div>

              {/* Expand/Collapse Button */}
              {data.length > 3 && (
                <motion.button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="
                    w-full
                    flex items-center justify-center gap-2
                    px-4 py-2
                    text-sm font-medium
                    text-cyan-600 dark:text-cyan-400
                    hover:text-cyan-700 dark:hover:text-cyan-300
                    hover:bg-cyan-50 dark:hover:bg-cyan-900/20
                    rounded-lg
                    transition-colors duration-200
                  "
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>View All {data.length} Skills</span>
                    </>
                  )}
                </motion.button>
              )}

              {/* Explanation Text */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                    animate={prefersReducedMotion ? false : { opacity: 1, height: 'auto' }}
                    exit={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                    className="pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Scores are calculated based on your performance across interview sessions. 
                      Higher scores indicate stronger performance in each skill area.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

