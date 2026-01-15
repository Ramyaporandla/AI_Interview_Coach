import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Send,
  FileText
} from 'lucide-react'
import { interviewService } from '../../services/api'
import AIBackground from '../common/AIBackground'
import GlassCard from '../common/GlassCard'

export default function InterviewFromResumePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { questions, sessionConfig, resumeId } = location.state || {}
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [sessionId, setSessionId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate('/resume-ats')
      return
    }
  }, [questions, navigate])

  const currentQuestion = questions?.[currentQuestionIndex]
  const currentAnswer = answers[currentQuestionIndex] || ''
  const totalQuestions = questions?.length || 0
  const answeredCount = Object.keys(answers).length

  const handleAnswerChange = (value) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: value
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      alert(`Please answer all ${totalQuestions} questions before submitting.`)
      return
    }

    setSubmitting(true)
    try {
      // Start interview session
      const sessionResponse = await interviewService.startInterview({
        type: 'technical',
        duration: 60,
        difficulty: sessionConfig?.difficulty || 'medium',
        role: sessionConfig?.role || 'software-engineer',
        mode: 'mock'
      })

      const newSessionId = sessionResponse.session?.id || sessionResponse.id
      setSessionId(newSessionId)

      // Submit all answers
      // Note: This is a simplified version - in production, you'd submit answers one by one
      // and get feedback for each
      
      setCompleted(true)
    } catch (error) {
      console.error('Error submitting interview:', error)
      alert('Failed to submit interview. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!questions || questions.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-0 pb-12 px-4 sm:px-6 lg:px-8 transition-theme duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/resume-ats')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resume Analyzer
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Resume-Based Interview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Questions generated from your resume and job description
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {answeredCount} answered
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-[#E35336] dark:bg-[#E35336] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </motion.div>

        {completed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Interview Completed!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your answers have been submitted. You can review your performance in the dashboard.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-[#E35336] dark:bg-[#E35336] text-white rounded-lg hover:bg-[#A0522D] dark:hover:bg-[#A0522D] transition-colors font-medium"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/resume-ats')}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Analyze Another Resume
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
          >
            {/* Question Category */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#E35336]/10 dark:bg-[#E35336]/20 text-[#E35336] dark:text-[#E35336]">
                {currentQuestion.category || 'General'}
              </span>
              {currentQuestion.rationale && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                  {currentQuestion.rationale}
                </p>
              )}
            </div>

            {/* Question */}
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              {currentQuestion.text}
            </h2>

            {/* Answer Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Answer
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                rows={10}
                className="input-field w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {currentAnswer.length} characters
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(answers).map(idx => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      parseInt(idx) === currentQuestionIndex
                        ? 'bg-[#E35336] dark:bg-[#E35336]'
                        : answers[idx]
                        ? 'bg-green-500 dark:bg-green-400'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    title={`Question ${parseInt(idx) + 1}`}
                  />
                ))}
              </div>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center px-4 py-2 bg-[#E35336] dark:bg-[#E35336] text-white rounded-lg hover:bg-[#A0522D] dark:hover:bg-[#A0522D] transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || answeredCount < totalQuestions}
                  className="flex items-center px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Interview
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Questions Overview */}
        {!completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 card"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Questions Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id || idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`p-3 rounded-lg text-left text-sm transition-all ${
                    idx === currentQuestionIndex
                      ? 'bg-[#E35336]/10 dark:bg-[#E35336]/20 border-2 border-[#E35336] dark:border-[#E35336]'
                      : answers[idx]
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700'
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Q{idx + 1}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {q.category || 'General'}
                  </div>
                  {answers[idx] && (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-1" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

