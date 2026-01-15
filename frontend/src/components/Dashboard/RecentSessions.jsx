import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { interviewService } from '../../services/api'

export default function RecentSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const data = await interviewService.getHistory()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 sm:py-10 md:py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-cyan-500"></div>
        <p className="mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400">Loading sessions...</p>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10 md:py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
        </div>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-2">No interview sessions yet.</p>
        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">Start your first interview to see your progress here!</p>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
      <h3 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-gray-100 mb-4 sm:mb-6 flex items-center">
        <Clock className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-gray-700 dark:text-gray-300" />
        Recent Sessions
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {sessions.slice(0, 5).map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg sm:rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-cyan-400/50 dark:hover:border-cyan-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => navigate(`/interview/${session.id}`)}
          >
            <div className="flex-1 w-full sm:w-auto mb-2 sm:mb-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {session.type}
                </span>
                <span className="hidden sm:inline text-gray-400 dark:text-gray-500">•</span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {session.duration} min
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {new Date(session.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                {session.score && (
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                    Score: {session.score}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center">
                {session.status === 'completed' ? (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                    <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium hidden sm:inline">
                      Completed
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium hidden sm:inline">
                      In Progress
                    </span>
                  </motion.div>
                )}
              </div>
              <motion.div
                whileHover={{ x: 4 }}
                className="text-gray-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

