import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Send, CheckCircle, AlertCircle, Mic, Type, Volume2, VolumeX, Pause, Play, ArrowRight, ArrowLeft } from 'lucide-react'
import { interviewService } from '../../services/api'
import CodeEditor from './CodeEditor'
import FeedbackCard from './FeedbackCard'
import { useSpeechToText } from '../../hooks/useSpeechToText'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'
import MandalaWatermark from '../common/MandalaWatermark'
import AIBackground from '../common/AIBackground'
import GlassCard from '../common/GlassCard'

export default function MockInterviewSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [questionTimer, setQuestionTimer] = useState(0) // Timer for current question
  const [inputMode, setInputMode] = useState('text')
  const [autoReadEnabled, setAutoReadEnabled] = useState(true)
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  const currentQuestion = questions[currentQuestionIndex]

  // Speech-to-text hook
  const {
    isListening: isVoiceListening,
    isSupported: isVoiceSupported,
    error: voiceError,
    startListening: startVoiceListening,
    stopListening: stopVoiceListening,
  } = useSpeechToText({
    onTranscript: (transcript) => {
      setAnswer(transcript)
    },
    onError: (error) => {
      console.error('Voice input error:', error)
    },
  })

  // Text-to-speech hook
  const {
    isSpeaking,
    isPaused,
    isSupported: isTTSSupported,
    speak: speakText,
    stop: stopSpeaking,
    pause: pauseSpeaking,
    resume: resumeSpeaking,
  } = useTextToSpeech()

  useEffect(() => {
    if (sessionId && sessionId !== 'undefined') {
      loadSession()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (session && session.status === 'in_progress' && session.createdAt) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 1000)
        const remaining = (session.duration || session.duration_minutes || 45) * 60 - elapsed
        setTimeRemaining(Math.max(0, remaining))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [session])

  // Question timer
  useEffect(() => {
    if (currentQuestion && !answeredQuestions.has(currentQuestion.id)) {
      setQuestionStartTime(Date.now())
      const timer = setInterval(() => {
        setQuestionTimer(Math.floor((Date.now() - questionStartTime) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentQuestion?.id, questionStartTime, answeredQuestions])

  // Auto-read question
  useEffect(() => {
    if (currentQuestion && autoReadEnabled && isTTSSupported) {
      const questionText = currentQuestion.question_text || currentQuestion.text || ''
      if (questionText) {
        const timer = setTimeout(() => {
          speakText(questionText)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
    return () => {
      if (isTTSSupported) {
        stopSpeaking()
      }
    }
  }, [currentQuestion?.id, autoReadEnabled, isTTSSupported, speakText, stopSpeaking])

  const loadSession = async () => {
    if (!sessionId || sessionId === 'undefined') {
      setLoading(false)
      return
    }
    
    try {
      const data = await interviewService.getInterview(sessionId)
      if (data.session) {
        setSession(data.session)
        setQuestions(data.questions || [])
        
        // Find first unanswered question
        const answeredIds = new Set((data.answers || []).map(a => a.question_id))
        const firstUnansweredIndex = (data.questions || []).findIndex(q => !answeredIds.has(q.id))
        setCurrentQuestionIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0)
        
        // Track answered questions
        setAnsweredQuestions(new Set(answeredIds))
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || submitting || !currentQuestion) return

    setSubmitting(true)
    setFeedback(null)
    
    try {
      await interviewService.submitAnswer(sessionId, currentQuestion.id, answer)
      
      // Mark as answered
      setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]))
      
      // Clear answer
      setAnswer('')
      
      // Poll for feedback
      pollForFeedback(currentQuestion.id)
    } catch (error) {
      console.error('Failed to submit answer:', error)
      alert('Failed to submit answer. Please try again.')
      setSubmitting(false)
    }
  }

  const pollForFeedback = async (questionId, retries = 0) => {
    const maxRetries = 60
    
    if (retries >= maxRetries) {
      setFeedback({
        score: 0,
        feedback: 'Feedback is taking longer than expected. Moving to next question...',
        strengths: [],
        improvements: []
      })
      moveToNextQuestion()
      return
    }

    try {
      const response = await interviewService.getFeedback(sessionId, questionId)
      
      if (response.evaluation) {
        setFeedback(response.evaluation)
        // Auto-advance after showing feedback for 3 seconds
        setTimeout(() => {
          moveToNextQuestion()
        }, 3000)
      } else if (response.status === 'pending') {
        if (retries === 0) {
          setFeedback({
            score: 0,
            feedback: 'Evaluating your answer...',
            strengths: [],
            improvements: []
          })
        }
        setTimeout(() => {
          pollForFeedback(questionId, retries + 1)
        }, 1000)
      }
    } catch (error) {
      if (error.response?.status === 202) {
        setTimeout(() => {
          pollForFeedback(questionId, retries + 1)
        }, 1000)
      } else {
        console.error('Failed to get feedback:', error)
        moveToNextQuestion()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setFeedback(null)
      setQuestionTimer(0)
      setQuestionStartTime(Date.now())
    } else {
      // All questions answered, complete interview
      handleCompleteInterview()
    }
  }

  const handleCompleteInterview = async () => {
    try {
      await interviewService.completeInterview(sessionId)
      navigate(`/interview/${sessionId}/summary`)
    } catch (error) {
      console.error('Failed to complete interview:', error)
      alert('Failed to complete interview. Please try again.')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 flex items-center justify-center relative">
        <AIBackground />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400/30 border-t-cyan-500"></div>
        </div>
      </div>
    )
  }

  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 flex items-center justify-center relative">
        <AIBackground />
        <div className="relative z-10 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700">Session not found</p>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isAnswered = currentQuestion && answeredQuestions.has(currentQuestion.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 relative">
      <AIBackground />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      {/* Mandala Watermarks */}
      <div className="absolute top-0 right-0 opacity-20">
        <MandalaWatermark position="top-right" size={160} opacity={0.05} />
      </div>
      <div className="absolute bottom-0 left-0 opacity-15">
        <MandalaWatermark position="bottom-left" size={140} opacity={0.04} />
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-primary-600 to-accent-600 h-2.5 rounded-full"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{session.type} Mock Interview</h1>
          <p className="text-gray-600">
            {isAnswered ? 'Review your answer' : 'Answer the question below'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* TTS Controls */}
          {isTTSSupported && currentQuestion && (
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setAutoReadEnabled(!autoReadEnabled)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  autoReadEnabled
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {autoReadEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {isSpeaking && (
                <>
                  {isPaused ? (
                    <button onClick={resumeSpeaking} className="px-2 py-1.5 text-primary-600 hover:bg-gray-200 rounded">
                      <Play className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={pauseSpeaking} className="px-2 py-1.5 text-primary-600 hover:bg-gray-200 rounded">
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={stopSpeaking} className="px-2 py-1.5 text-red-600 hover:bg-gray-200 rounded">
                    <VolumeX className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 text-primary-600">
              <Clock className="w-4 h-4" />
              <span>Session: {formatTime(timeRemaining)}</span>
            </div>
            {!isAnswered && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>This Q: {formatTime(questionTimer)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Section */}
        <div className="space-y-6">
          <motion.div
            key={currentQuestion?.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-3">
                {currentQuestion?.question_type || session?.type || 'Question'}
              </span>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Question</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {currentQuestion?.question_text || currentQuestion?.text || 'Loading question...'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Answer Section */}
          {!isAnswered ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Answer</h3>
                {currentQuestion?.question_type !== 'technical' && session?.type !== 'technical' && (
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setInputMode('text')}
                      className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                        inputMode === 'text'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Type className="w-4 h-4" />
                      <span className="text-sm">Text</span>
                    </button>
                    <button
                      onClick={() => setInputMode('voice')}
                      className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                        inputMode === 'voice'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span className="text-sm">Voice</span>
                    </button>
                  </div>
                )}
              </div>
              
              {currentQuestion?.question_type === 'technical' || session?.type === 'technical' ? (
                <CodeEditor value={answer} onChange={setAnswer} language="javascript" />
              ) : inputMode === 'voice' ? (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Click microphone to speak or type here..."
                      className="w-full h-48 px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                    />
                    {isVoiceSupported && (
                      <div className="absolute right-3 top-3">
                        <motion.button
                          type="button"
                          onClick={() => {
                            if (isVoiceListening) {
                              stopVoiceListening()
                            } else {
                              startVoiceListening()
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                            isVoiceListening
                              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                              : 'bg-primary-100 hover:bg-primary-200 text-primary-600'
                          }`}
                        >
                          <Mic className="w-5 h-5" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                  {isVoiceListening && (
                    <div className="flex items-center space-x-2 text-sm text-primary-600">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 bg-red-500 rounded-full"
                      />
                      <span>Listening...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here or click the microphone icon to speak..."
                    className="w-full h-64 px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  />
                  {isVoiceSupported && (
                    <div className="absolute right-3 top-3">
                      <motion.button
                        type="button"
                        onClick={() => {
                          if (isVoiceListening) {
                            stopVoiceListening()
                          } else {
                            startVoiceListening()
                          }
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                          isVoiceListening
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                            : 'bg-primary-100 hover:bg-primary-200 text-primary-600'
                        }`}
                      >
                        <Mic className="w-5 h-5" />
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || submitting}
                className="mt-4 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isLastQuestion ? 'Submit Final Answer' : 'Submit & Next Question'}</span>
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card bg-green-50 border-green-200"
            >
              <div className="flex items-center space-x-2 text-green-700 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Answer Submitted</span>
              </div>
              <p className="text-sm text-green-600">Moving to next question...</p>
            </motion.div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {feedback ? (
              <FeedbackCard feedback={feedback} />
            ) : submitting ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card"
              >
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Evaluating your answer...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card bg-gray-50 border-2 border-dashed border-gray-300"
              >
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Submit your answer to receive AI-powered feedback</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </div>
  )
}

