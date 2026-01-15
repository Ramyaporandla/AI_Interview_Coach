import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Star, Play, Code, Users, Database, Briefcase, BarChart3, Palette, Shield, Target, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { interviewService, questionService } from '../../services/api'
import MandalaWatermark from '../common/MandalaWatermark'
import AIBackground from '../common/AIBackground'
import GlassCard from '../common/GlassCard'

const roles = [
  { id: 'all', name: 'All Roles', icon: Users },
  { id: 'software-engineer', name: 'Software Engineer', icon: Code },
  { id: 'data-scientist', name: 'Data Scientist', icon: BarChart3 },
  { id: 'product-manager', name: 'Product Manager', icon: Briefcase },
  { id: 'designer', name: 'UX/UI Designer', icon: Palette },
  { id: 'data-engineer', name: 'Data Engineer', icon: Database },
  { id: 'security-engineer', name: 'Security Engineer', icon: Shield },
  { id: 'marketing', name: 'Marketing', icon: MessageSquare },
  { id: 'sales', name: 'Sales', icon: Target },
]

const types = [
  { id: 'all', name: 'All Types' },
  { id: 'technical', name: 'Technical' },
  { id: 'behavioral', name: 'Behavioral' },
  { id: 'system-design', name: 'System Design' },
]

const difficulties = [
  { id: 'all', name: 'All Levels' },
  { id: 'easy', name: 'Easy' },
  { id: 'medium', name: 'Medium' },
  { id: 'hard', name: 'Hard' },
]

const companies = [
  { id: 'all', name: 'All Companies' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'google', name: 'Google' },
  { id: 'deloitte', name: 'Deloitte' },
  { id: 'general', name: 'General' },
]

export default function QuestionBank() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    role: 'all',
    type: 'all',
    difficulty: 'all',
    company: 'all',
    search: '',
  })
  const [favorites, setFavorites] = useState(new Set(JSON.parse(localStorage.getItem('questionFavorites') || '[]')))

  useEffect(() => {
    loadQuestions()
  }, [filters.role, filters.type, filters.difficulty, filters.company])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      // Use the question bank API endpoint
      const response = await questionService.getQuestionBank({
        role: filters.role !== 'all' ? filters.role : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        difficulty: filters.difficulty !== 'all' ? filters.difficulty : undefined,
        company: filters.company !== 'all' ? filters.company : undefined,
        limit: 100,
      })
      
      let filtered = (response.questions || []).map(q => ({
        id: q.id,
        question_text: q.text,
        text: q.text,
        question_type: q.type,
        type: q.type,
        difficulty: q.difficulty,
        practiceCount: q.practiceCount || 0,
        createdAt: q.createdAt,
      }))
      
      // Apply search filter client-side
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(q => 
          (q.question_text || q.text || '').toLowerCase().includes(searchLower)
        )
      }
      
      setQuestions(filtered)
    } catch (error) {
      console.error('Failed to load questions:', error)
      // Fallback: try to get questions from interview sessions
      try {
        const interviews = await interviewService.getUserInterviews()
        const questionMap = new Map()
        
        for (const session of interviews.sessions || []) {
          try {
            const sessionData = await interviewService.getInterview(session.id)
            if (sessionData.questions) {
              sessionData.questions.forEach(q => {
                if (!questionMap.has(q.id)) {
                  questionMap.set(q.id, {
                    ...q,
                    text: q.question_text || q.text,
                    practiceCount: (sessionData.answers || []).filter(a => a.question_id === q.id).length,
                  })
                }
              })
            }
          } catch (e) {
            // Skip failed sessions
          }
        }
        
        let filtered = Array.from(questionMap.values())
        
        // Apply filters
        if (filters.role !== 'all') {
          filtered = filtered.filter(q => q.question_type === filters.role || q.type === filters.role)
        }
        if (filters.type !== 'all') {
          filtered = filtered.filter(q => q.question_type === filters.type)
        }
        if (filters.difficulty !== 'all') {
          filtered = filtered.filter(q => q.difficulty === filters.difficulty)
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(q => 
            (q.question_text || q.text || '').toLowerCase().includes(searchLower)
          )
        }
        
        setQuestions(filtered)
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        setQuestions([])
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (questionId) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(questionId)) {
      newFavorites.delete(questionId)
    } else {
      newFavorites.add(questionId)
    }
    setFavorites(newFavorites)
    localStorage.setItem('questionFavorites', JSON.stringify(Array.from(newFavorites)))
  }

  const practiceQuestion = async (question) => {
    // Start a new interview session with this question
    try {
      const response = await interviewService.startInterview({
        type: question.question_type || 'behavioral',
        duration: 30,
        difficulty: question.difficulty || 'medium',
        role: question.question_type,
      })
      navigate(`/interview/${response.session.id}`)
    } catch (error) {
      console.error('Failed to start practice:', error)
      alert('Failed to start practice session. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 relative">
      <AIBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Mandala Watermarks */}
        <div className="absolute top-0 right-0 opacity-30">
          <MandalaWatermark position="top-right" size={180} opacity={0.06} />
        </div>
        <div className="absolute bottom-0 left-0 opacity-20">
          <MandalaWatermark position="bottom-left" size={150} opacity={0.05} />
        </div>
        
        <div className="mb-8 relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-cyan-600 bg-clip-text text-transparent mb-2">Question Bank</h1>
          <p className="text-gray-700 dark:text-gray-300">Browse and practice from a collection of interview questions</p>
        </div>

      {/* Filters */}
      <GlassCard className="mb-6 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Filters</h2>
        </div>
        
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
            >
              {types.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
            >
              {difficulties.map(diff => (
                <option key={diff.id} value={diff.id}>{diff.name}</option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
            <select
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
            >
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E35336]"></div>
        </div>
      ) : questions.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-gray-700 dark:text-gray-300">No questions found. Start practicing to build your question bank!</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 bg-[#E35336]/10 text-[#E35336] rounded text-xs font-medium capitalize">
                      {question.question_type || question.type}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-medium capitalize">
                      {question.difficulty}
                    </span>
                    {question.practiceCount > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Practiced {question.practiceCount} time{question.practiceCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                    {question.question_text || question.text}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleFavorite(question.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.has(question.id)
                        ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={favorites.has(question.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-5 h-5 ${favorites.has(question.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => practiceQuestion(question)}
                    className="px-4 py-2 bg-[#E35336] text-white rounded-lg hover:bg-[#A0522D] transition-colors flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Practice</span>
                  </button>
                </div>
              </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

