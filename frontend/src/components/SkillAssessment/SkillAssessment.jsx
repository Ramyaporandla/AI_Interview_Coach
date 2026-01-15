import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code, BarChart3, Briefcase, Palette, Database, Shield, 
  Target, Users, CheckCircle, ArrowRight, ArrowLeft, 
  TrendingUp, Award, Loader, X, Sparkles, Building2, Star,
  Clock, FileText, Zap, HelpCircle, BarChart, AlertCircle
} from 'lucide-react'
import { skillAssessmentService } from '../../services/api'
import GlassCard from '../common/GlassCard'
import PrimaryButton from '../common/PrimaryButton'
import AIBackground from '../common/AIBackground'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const roles = [
  { id: 'software-engineer', name: 'Software Engineer', icon: Code, color: 'from-cyan-500 to-blue-600' },
  { id: 'data-scientist', name: 'Data Scientist', icon: BarChart3, color: 'from-blue-500 to-cyan-600' },
  { id: 'product-manager', name: 'Product Manager', icon: Briefcase, color: 'from-indigo-500 to-blue-600' },
  { id: 'designer', name: 'UX/UI Designer', icon: Palette, color: 'from-purple-500 to-indigo-600' },
  { id: 'data-engineer', name: 'Data Engineer', icon: Database, color: 'from-cyan-500 to-indigo-600' },
  { id: 'security-engineer', name: 'Security Engineer', icon: Shield, color: 'from-blue-600 to-cyan-600' },
  { id: 'marketing', name: 'Marketing Professional', icon: Target, color: 'from-indigo-500 to-purple-600' },
  { id: 'sales', name: 'Sales Professional', icon: Target, color: 'from-blue-500 to-cyan-600' },
  { id: 'hr', name: 'HR Professional', icon: Users, color: 'from-purple-500 to-indigo-600' },
]

const difficulties = [
  { id: 'easy', name: 'Easy', description: 'Junior level' },
  { id: 'medium', name: 'Medium', description: 'Mid-level' },
  { id: 'hard', name: 'Hard', description: 'Senior level' },
]

export default function SkillAssessment() {
  const [step, setStep] = useState('role-selection') // role-selection, assessment, results
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [questionCount, setQuestionCount] = useState(10)
  const [assessment, setAssessment] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [evaluations, setEvaluations] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [companies, setCompanies] = useState([])
  const [showQuestionNav, setShowQuestionNav] = useState(false)
  const [answerStats, setAnswerStats] = useState({ words: 0, chars: 0 })
  const [timeSpent, setTimeSpent] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const textareaRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    // Load FAANG companies
    skillAssessmentService.getFAANGCompanies()
      .then(response => {
        if (response.companies) {
          setCompanies(response.companies)
        }
      })
      .catch(() => {
        // Use default companies if API fails
        setCompanies([
          { id: 'google', name: 'Google', description: 'Search, Cloud, AI/ML' },
          { id: 'amazon', name: 'Amazon', description: 'E-commerce, AWS, Alexa' },
          { id: 'meta', name: 'Meta (Facebook)', description: 'Social Media, VR/AR' },
          { id: 'apple', name: 'Apple', description: 'iOS, Hardware, Services' },
          { id: 'netflix', name: 'Netflix', description: 'Streaming, Recommendations' },
          { id: 'microsoft', name: 'Microsoft', description: 'Azure, Office, Windows' }
        ])
      })
  }, [])

  // Compute derived values (must be before useEffect hooks that use them)
  const currentQuestion = assessment?.questions[currentQuestionIndex]
  const currentEvaluation = currentQuestion ? evaluations[currentQuestion.id] : null
  const progress = assessment ? ((currentQuestionIndex + 1) / assessment.questions.length) * 100 : 0
  const answeredCount = Object.keys(answers).filter(id => answers[id]?.trim()).length
  const evaluatedCount = Object.keys(evaluations).length

  // Update answer stats
  useEffect(() => {
    if (currentQuestion) {
      const answer = answers[currentQuestion.id] || ''
      const words = answer.trim() ? answer.trim().split(/\s+/).length : 0
      const chars = answer.length
      setAnswerStats({ words, chars })
    }
  }, [answers, currentQuestion])

  // Timer for assessment
  useEffect(() => {
    if (step === 'assessment' && !startTimeRef.current) {
      startTimeRef.current = Date.now()
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    } else if (step !== 'assessment') {
      startTimeRef.current = null
      setTimeSpent(0)
    }
  }, [step])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (step !== 'assessment' || submitting) return
      
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!currentEvaluation && answers[currentQuestion?.id]?.trim()) {
          handleAnswerSubmit()
        }
      }
      
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        handlePrevious()
      }
      if (e.key === 'ArrowRight' && currentQuestionIndex < assessment?.questions.length - 1) {
        handleNext()
      }
      
      // Number keys to jump to question
      const num = parseInt(e.key)
      if (num >= 1 && num <= 9 && assessment) {
        const targetIndex = num - 1
        if (targetIndex < assessment.questions.length) {
          setCurrentQuestionIndex(targetIndex)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [step, currentQuestionIndex, assessment, submitting, currentEvaluation, answers, currentQuestion])


  // Confetti on completion
  useEffect(() => {
    if (step === 'results' && results) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [step, results])

  const handleStartAssessment = async () => {
    if (!selectedRole) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await skillAssessmentService.startAssessment(
        selectedRole.id,
        selectedDifficulty,
        questionCount,
        selectedCompany?.id || null
      )
      
      setAssessment(response)
      setStep('assessment')
      setCurrentQuestionIndex(0)
      setAnswers({})
      setEvaluations({})
    } catch (err) {
      console.error('Error starting assessment:', err)
      setError(err.response?.data?.error || 'Failed to start assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = async () => {
    if (!assessment || !currentQuestion) return
    
    const answer = answers[currentQuestion.id] || ''
    
    if (!answer.trim()) {
      setError('Please provide an answer before submitting.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const evaluation = await skillAssessmentService.submitAnswer(
        assessment.assessmentId,
        currentQuestion.id,
        answer,
        {
          text: currentQuestion.text,
          domain: currentQuestion.domain,
          difficulty: assessment.difficulty,
          role: assessment.role
        }
      )

      setEvaluations({
        ...evaluations,
        [currentQuestion.id]: evaluation.evaluation
      })

      // Auto-advance after a short delay
      setTimeout(() => {
        if (currentQuestionIndex < assessment.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
          handleCompleteAssessment()
        }
      }, 2000)
    } catch (err) {
      console.error('Error submitting answer:', err)
      setError(err.response?.data?.error || 'Failed to submit answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteAssessment = async () => {
    if (!assessment) return

    setLoading(true)
    setError(null)

    try {
      const answerArray = assessment.questions.map(q => ({
        questionId: q.id,
        answer: answers[q.id] || '',
        questionText: q.text,
        domain: q.domain,
        difficulty: assessment.difficulty
      }))

      const response = await skillAssessmentService.completeAssessment(
        assessment.assessmentId,
        assessment.role,
        answerArray
      )

      setResults(response)
      setStep('results')
    } catch (err) {
      console.error('Error completing assessment:', err)
      setError(err.response?.data?.error || 'Failed to complete assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleCompleteAssessment()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }
  
  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Get answer quality indicator
  const getAnswerQuality = () => {
    const { words, chars } = answerStats
    if (words < 20) return { level: 'low', color: 'text-red-500', message: 'Too short - aim for 50+ words' }
    if (words < 50) return { level: 'medium', color: 'text-yellow-500', message: 'Good start - add more detail' }
    if (words < 100) return { level: 'good', color: 'text-green-500', message: 'Good length - well done!' }
    return { level: 'excellent', color: 'text-green-600', message: 'Excellent detail!' }
  }
  
  const answerQuality = getAnswerQuality()

  return (
    <div className="min-h-screen pt-0 pb-8 px-4 sm:px-6 lg:px-8 relative">
      <AIBackground />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-3 sm:pt-5 md:pt-6 mb-6 sm:mb-7 md:mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-3">
            Interactive Skill Assessment
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test your skills across different domains. No sign-up required!
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassCard className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <X className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Role Selection */}
        <AnimatePresence mode="wait">
          {step === 'role-selection' && (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Select Your Role</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {roles.map((role) => {
                    const Icon = role.icon
                    return (
                      <motion.button
                        key={role.id}
                        onClick={() => setSelectedRole(role)}
                        className={`
                          p-4 rounded-xl border-2 transition-all
                          ${selectedRole?.id === role.id
                            ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700'
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${selectedRole?.id === role.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-400'}`} />
                        <div className="font-semibold text-sm">{role.name}</div>
                      </motion.button>
                    )
                  })}
                </div>

                {selectedRole && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* FAANG Company Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        FAANG Company (Optional)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => setSelectedCompany(null)}
                          className={`
                            p-3 rounded-lg border-2 transition-all text-left
                            ${!selectedCompany
                              ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }
                          `}
                        >
                          <div className="font-semibold text-sm">General</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Any Company</div>
                        </button>
                        {companies.map((company) => (
                          <button
                            key={company.id}
                            onClick={() => setSelectedCompany(company)}
                            className={`
                              p-3 rounded-lg border-2 transition-all text-left
                              ${selectedCompany?.id === company.id
                                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }
                            `}
                          >
                            <div className="font-semibold text-sm">{company.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{company.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                      <div className="flex gap-2">
                        {difficulties.map((diff) => (
                          <button
                            key={diff.id}
                            onClick={() => setSelectedDifficulty(diff.id)}
                            className={`
                              flex-1 p-3 rounded-lg border-2 transition-all
                              ${selectedDifficulty === diff.id
                                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                                : 'border-gray-200 dark:border-gray-700'
                              }
                            `}
                          >
                            <div className="font-semibold">{diff.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{diff.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Number of Questions: {questionCount}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <PrimaryButton
                      onClick={handleStartAssessment}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin mr-2" />
                          Starting Assessment...
                        </>
                      ) : (
                        <>
                          Start Assessment
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </PrimaryButton>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* Assessment */}
          {step === 'assessment' && assessment && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard className="p-6 sm:p-8">
                {/* Enhanced Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        Question {currentQuestionIndex + 1} of {assessment.questions.length}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(timeSpent)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <FileText className="w-4 h-4" />
                        <span>{answeredCount}/{assessment.questions.length} answered</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                      {Math.round(progress)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-3 rounded-full relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/30"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  </div>
                  
                  {/* Question Navigation Preview */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {assessment.questions.map((q, idx) => {
                      const isAnswered = answers[q.id]?.trim()
                      const isEvaluated = evaluations[q.id]
                      const isCurrent = idx === currentQuestionIndex
                      
                      return (
                        <motion.button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`
                            w-10 h-10 rounded-lg text-xs font-medium transition-all
                            ${isCurrent 
                              ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg scale-110' 
                              : isEvaluated
                              ? 'bg-green-500 text-white'
                              : isAnswered
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }
                          `}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          title={`Question ${idx + 1}: ${q.domain}`}
                        >
                          {idx + 1}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Enhanced Question Display */}
                <motion.div 
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 text-cyan-500" />
                    </motion.div>
                    <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/30">
                      {currentQuestion?.domain}
                    </span>
                    {assessment?.company && (
                      <>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/30">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                            {companies.find(c => c.id === assessment.company)?.name || assessment.company}
                          </span>
                        </div>
                      </>
                    )}
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                      {assessment.difficulty}
                    </span>
                  </div>
                  <motion.h2 
                    className="text-2xl font-bold mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {currentQuestion?.text}
                  </motion.h2>
                  
                  {/* Answer Length Suggestion */}
                  <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm">
                      <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-700 dark:text-blue-300">
                        💡 Tip: Aim for 50-200 words for a comprehensive answer
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Answer Input */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Your Answer</label>
                    <div className="flex items-center gap-4 text-xs">
                      <span className={`${answerQuality.color} font-medium`}>
                        {answerStats.words} words • {answerStats.chars} chars
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {answerQuality.message}
                      </span>
                    </div>
                  </div>
                  <motion.textarea
                    ref={textareaRef}
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => setAnswers({
                      ...answers,
                      [currentQuestion.id]: e.target.value
                    })}
                    placeholder="Type your answer here... (Press Ctrl+Enter to submit)"
                    className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-cyan-500 focus:outline-none min-h-[200px] resize-y transition-all"
                    disabled={submitting || !!currentEvaluation}
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  />
                  
                  {/* Answer Quality Indicator */}
                  {answerStats.words > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center gap-2"
                    >
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            answerQuality.level === 'low' ? 'bg-red-500' :
                            answerQuality.level === 'medium' ? 'bg-yellow-500' :
                            answerQuality.level === 'good' ? 'bg-green-500' : 'bg-green-600'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (answerStats.words / 100) * 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Enhanced Evaluation Feedback */}
                {currentEvaluation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="mb-6 space-y-4"
                  >
                    <GlassCard className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700">
                      {/* Animated Score Display */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5 }}
                          >
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                          </motion.div>
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Your Score</div>
                            <motion.div 
                              className="text-3xl font-bold text-green-600 dark:text-green-400"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              {Math.round(currentEvaluation.score * 10)}/100
                            </motion.div>
                          </div>
                        </div>
                        
                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                            <div className="font-semibold text-cyan-600 dark:text-cyan-400">
                              {Math.round((currentEvaluation.clarityScore || 0) * 10)}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">Clarity</div>
                          </div>
                          <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                            <div className="font-semibold text-blue-600 dark:text-blue-400">
                              {Math.round((currentEvaluation.relevanceScore || 0) * 10)}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">Relevance</div>
                          </div>
                        </div>
                      </div>
                      
                      <motion.p 
                        className="text-sm text-gray-700 dark:text-gray-300 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {currentEvaluation.feedback}
                      </motion.p>
                      
                      {currentEvaluation.strengths && currentEvaluation.strengths.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg"
                        >
                          <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                            Strengths:
                          </div>
                          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            {currentEvaluation.strengths.map((s, i) => (
                              <motion.li 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                              >
                                {s}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                      
                      {currentEvaluation.improvements && currentEvaluation.improvements.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg"
                        >
                          <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            Areas for Improvement:
                          </div>
                          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            {currentEvaluation.improvements.map((imp, i) => (
                              <motion.li 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                              >
                                {imp}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </GlassCard>
                  </motion.div>
                )}

                {/* Enhanced Navigation */}
                <div className="flex gap-4">
                  <motion.button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 || submitting}
                    className="flex-1 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    whileHover={{ scale: currentQuestionIndex > 0 ? 1.05 : 1 }}
                    whileTap={{ scale: currentQuestionIndex > 0 ? 0.95 : 1 }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                    <span className="text-xs text-gray-500">(←)</span>
                  </motion.button>
                  
                  {currentQuestionIndex < assessment.questions.length - 1 ? (
                    <motion.button
                      onClick={handleNext}
                      disabled={submitting}
                      className="flex-1 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                      whileHover={{ scale: submitting ? 1 : 1.05 }}
                      whileTap={{ scale: submitting ? 1 : 0.95 }}
                    >
                      Next
                      <ArrowRight className="w-5 h-5" />
                      <span className="text-xs text-gray-500">(→)</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleCompleteAssessment}
                      disabled={submitting || loading}
                      className="flex-1 p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      whileHover={{ scale: (submitting || loading) ? 1 : 1.05 }}
                      whileTap={{ scale: (submitting || loading) ? 1 : 0.95 }}
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          Complete Assessment
                          <Award className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  )}
                  
                  {!currentEvaluation && (
                    <motion.button
                      onClick={handleAnswerSubmit}
                      disabled={submitting || !answers[currentQuestion.id]?.trim()}
                      className="flex-1 p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      whileHover={{ scale: (submitting || !answers[currentQuestion.id]?.trim()) ? 1 : 1.05 }}
                      whileTap={{ scale: (submitting || !answers[currentQuestion.id]?.trim()) ? 1 : 0.95 }}
                    >
                      {submitting ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Submit Answer
                          <span className="text-xs opacity-75">(Ctrl+Enter)</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Results */}
          {step === 'results' && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Confetti Effect */}
              {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                  {[...Array(50)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-cyan-500 rounded-full"
                      initial={{
                        x: '50vw',
                        y: '50vh',
                        opacity: 1,
                      }}
                      animate={{
                        x: `${50 + (Math.random() - 0.5) * 100}vw`,
                        y: `${50 + Math.random() * 100}vh`,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 2 + Math.random(),
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Enhanced Summary Card */}
              <GlassCard className="p-6 sm:p-8">
                <motion.div 
                  className="text-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  >
                    <Award className="w-16 h-16 mx-auto mb-4 text-cyan-500" />
                  </motion.div>
                  <motion.h2 
                    className="text-3xl font-bold mb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Assessment Complete! 🎉
                  </motion.h2>
                  {assessment?.company && (
                    <motion.div 
                      className="flex items-center justify-center gap-2 mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        {companies.find(c => c.id === assessment.company)?.name || assessment.company} Assessment
                      </span>
                    </motion.div>
                  )}
                  <motion.div 
                    className="text-6xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    {results.summary.overallScore}/100
                  </motion.div>
                  <motion.p 
                    className="text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Completion Rate: {results.summary.completionRate}% • Time: {formatTime(timeSpent)}
                  </motion.p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <GlassCard className="p-4 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold">Top Skill</span>
                    </div>
                    <div className="text-xl font-bold">{results.summary.topSkill.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Score: {results.summary.topSkill.score}/100
                    </div>
                  </GlassCard>

                  <GlassCard className="p-4 bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-semibold">Improvement Area</span>
                    </div>
                    <div className="text-xl font-bold">{results.summary.improvementArea.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Score: {results.summary.improvementArea.score}/100
                    </div>
                  </GlassCard>
                </div>
              </GlassCard>

              {/* Enhanced Skills Visualization */}
              {results.summary.skillBreakdown && results.summary.skillBreakdown.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Radar Chart */}
                  <GlassCard className="p-6 sm:p-8">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <BarChart className="w-6 h-6 text-cyan-500" />
                      Skill Radar
                    </h3>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={results.summary.skillBreakdown}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis 
                            dataKey="skill" 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                          />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 100]} 
                            tick={{ fontSize: 10, fill: '#6b7280' }}
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
                    </div>
                  </GlassCard>

                  {/* Bar Chart */}
                  <GlassCard className="p-6 sm:p-8">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-blue-500" />
                      Score Breakdown
                    </h3>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={results.summary.skillBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="skill" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="#0ea5e9"
                            radius={[8, 8, 0, 0]}
                            animationDuration={1000}
                            animationBegin={0}
                          />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* Recommendations */}
              {results.summary.recommendations && results.summary.recommendations.length > 0 && (
                <GlassCard className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold mb-4">Recommendations</h3>
                  <div className="space-y-3">
                    {results.summary.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          rec.priority === 'high'
                            ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                            : rec.priority === 'medium'
                            ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                        }`}
                      >
                        <div className="font-semibold mb-1">{rec.skill}</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">{rec.action}</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Restart Button */}
              <div className="text-center">
                <PrimaryButton
                  onClick={() => {
                    setStep('role-selection')
                    setSelectedRole(null)
                    setSelectedCompany(null)
                    setAssessment(null)
                    setResults(null)
                    setAnswers({})
                    setEvaluations({})
                    setCurrentQuestionIndex(0)
                  }}
                >
                  Take Another Assessment
                </PrimaryButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

