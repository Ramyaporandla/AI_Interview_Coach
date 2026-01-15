import { useEffect, useState } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { analyticsService } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { Loader, AlertCircle } from 'lucide-react'

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

// Default skill domains for fallback
const defaultSkills = [
  'Technical',
  'Behavioral',
  'System Design',
  'Coding',
  'Problem Solving',
  'Communication'
]

export default function SkillsRadar() {
  const { theme } = useTheme()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasData, setHasData] = useState(false)

  // Determine text colors based on theme
  const textColor = theme === 'dark' ? '#e5e7eb' : '#374151'
  const gridColor = theme === 'dark' ? '#4b5563' : '#e5e7eb'
  const axisColor = theme === 'dark' ? '#9ca3af' : '#6b7280'

  useEffect(() => {
    let mounted = true

    const fetchSkills = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await analyticsService.getSkillsRadar()
        
        // Log API response once for debugging
        console.log('[SkillsRadar] API Response:', response)

        if (!mounted) return

        // Safely extract skills array
        const skillsArray = response?.skills || []
        
        if (Array.isArray(skillsArray) && skillsArray.length > 0) {
          // Transform API data to chart format
          // Group by question_type and calculate average score
          const skillMap = new Map()
          
          skillsArray.forEach(skill => {
            // Defensive checks for skill object
            if (!skill || typeof skill !== 'object') return
            
            const type = skill?.type || skill?.question_type || 'unknown'
            const avgScore = parseFloat(skill?.averageScore || skill?.avg_score || skill?.value || 0)
            
            // Validate score is a number
            if (isNaN(avgScore)) return
            
            // Convert score from 0-10 scale to 0-100 scale (clamp to valid range)
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

          // Convert map to array format with validation
          const transformedData = Array.from(skillMap.entries())
            .map(([type, stats]) => {
              // Calculate average, ensuring we don't divide by zero
              const avgValue = stats.count > 0 
                ? Math.max(0, Math.min(100, Math.round(stats.totalScore / stats.count)))
                : 0
              
              return {
                skill: skillNameMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
                value: avgValue,
                type: type
              }
            })
            .filter(item => item.value >= 0 && item.value <= 100) // Filter invalid values

          // Ensure we have at least some valid data
          if (transformedData.length > 0) {
            setData(transformedData)
            setHasData(true)
          } else {
            // No valid data - show empty state
            setHasData(false)
            setData([])
          }
        } else {
          // Empty response - no interviews completed yet
          setHasData(false)
          setData([])
        }
      } catch (err) {
        console.error('[SkillsRadar] Error fetching skills:', err)
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

  // Always render - never return null
  return (
    <div className="w-full h-[250px] sm:h-[280px] md:h-[300px] px-2 sm:px-4 pb-4 sm:pb-6">
      {loading ? (
        // Loading state
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading skills data...</p>
          </div>
        </div>
      ) : error ? (
        // Error state
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Unable to load skills data</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Please try again later</p>
          </div>
        </div>
      ) : !hasData || !data || data.length === 0 ? (
        // Empty state - no data available
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-xs px-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              No skill assessment available yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
              Complete at least one interview to generate results.
            </p>
            {/* Show placeholder skills */}
            <div className="mt-4 space-y-2">
              {defaultSkills.slice(0, 3).map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-500">{skill}</span>
                  <span className="text-gray-400 dark:text-gray-600">0</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Data state - render chart
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart 
            data={data} 
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <PolarGrid 
              stroke={gridColor}
              strokeWidth={1}
              strokeOpacity={0.5}
            />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ 
                fontSize: 11, 
                fill: textColor,
                fontWeight: 500
              }}
              style={{ 
                fontSize: '11px',
                fill: textColor
              }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ 
                fontSize: 9, 
                fill: axisColor,
                fontWeight: 400
              }}
              style={{ 
                fontSize: '9px',
                fill: axisColor
              }}
            />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.6}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

