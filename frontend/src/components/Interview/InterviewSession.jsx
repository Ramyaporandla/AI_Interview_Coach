import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Send, CheckCircle, AlertCircle, Mic, Type, Volume2, VolumeX, Pause, Play } from 'lucide-react'
import { interviewService } from '../../services/api'
import CodeEditor from './CodeEditor'
import FeedbackCard from './FeedbackCard'
import VoiceRecorder from './VoiceRecorder'
import { useSpeechToText } from '../../hooks/useSpeechToText'
import { useTextToSpeech } from '../../hooks/useTextToSpeech'
import MandalaWatermark from '../common/MandalaWatermark'
import AIBackground from '../common/AIBackground'
import GlassCard from '../common/GlassCard'

export default function InterviewSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [inputMode, setInputMode] = useState('text') // 'text' or 'voice'
  const [autoReadEnabled, setAutoReadEnabled] = useState(true) // Auto-read questions
  
  // Speech-to-text hook for text input mode
  const {
    isListening: isVoiceListening,
    isSupported: isVoiceSupported,
    transcript: voiceTranscript,
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
  } = useTextToSpeech({
    rate: 1,
    pitch: 1,
    volume: 1,
  })

  useEffect(() => {
    if (sessionId && sessionId !== 'undefined') {
      loadSession()
    } else {
      setLoading(false)
      setSession(null)
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

  // Auto-read question when it changes (if auto-read is enabled)
  useEffect(() => {
    if (currentQuestion && autoReadEnabled && isTTSSupported) {
      const questionText = currentQuestion.question_text || currentQuestion.text || ''
      if (questionText) {
        // Small delay to ensure UI is ready
        const timer = setTimeout(() => {
          speakText(questionText)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
    // Cleanup: stop speaking when component unmounts or question changes
    return () => {
      if (isTTSSupported) {
        stopSpeaking()
      }
    }
  }, [currentQuestion?.id, autoReadEnabled, isTTSSupported, speakText, stopSpeaking]) // Only re-read if question ID changes

  const loadSession = async () => {
    if (!sessionId || sessionId === 'undefined') {
      setLoading(false)
      return
    }
    
    try {
      const data = await interviewService.getInterview(sessionId)
      // Backend returns { session: {...}, questions: [...], answers: [...] }
      if (data.session) {
        setSession({
          ...data.session,
          questions: data.questions || [],
          answers: data.answers || []
        })
        // Get the first unanswered question or the last question
        if (data.questions && data.questions.length > 0) {
          const lastQuestion = data.questions[data.questions.length - 1]
          const answeredQuestionIds = new Set((data.answers || []).map(a => a.question_id))
          
          // Find first unanswered question or use last question
          const unansweredQuestion = data.questions.find(q => !answeredQuestionIds.has(q.id))
          setCurrentQuestion(unansweredQuestion || lastQuestion)
        }
      } else {
        setSession(null)
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return

    setSubmitting(true)
    setFeedback(null)
    
    try {
      const response = await interviewService.submitAnswer(sessionId, currentQuestion.id, answer)
      
      // Clear the answer field
      setAnswer('')
      
      // Poll for feedback since evaluation is async
      if (response.evaluationPending) {
        pollForFeedback(currentQuestion.id)
      } else if (response.evaluation) {
        setFeedback(response.evaluation)
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      alert('Failed to submit answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const pollForFeedback = async (questionId, retries = 0) => {
    const maxRetries = 60 // Poll for up to 60 seconds (60 * 1 second) - OpenAI can be slow
    
    if (retries >= maxRetries) {
      setFeedback({
        score: 0,
        feedback: 'Feedback is taking longer than expected. The AI evaluation may still be processing. Please check back in a moment or refresh the page.',
        strengths: [],
        improvements: ['Evaluation is still processing. This can take 10-30 seconds.']
      })
      return
    }

    try {
      const response = await interviewService.getFeedback(sessionId, questionId)
      
      if (response.evaluation) {
        // Feedback is ready
        console.log('Feedback received:', response.evaluation)
        setFeedback(response.evaluation)
      } else if (response.status === 'pending') {
        // Still processing, poll again after 1 second
        // Show loading state
        if (retries === 0) {
          setFeedback({
            score: 0,
            feedback: 'Evaluating your answer... This usually takes 5-15 seconds.',
            strengths: [],
            improvements: []
          })
        }
        setTimeout(() => {
          pollForFeedback(questionId, retries + 1)
        }, 1000)
      }
    } catch (error) {
      // If it's a 202 (pending), continue polling
      if (error.response?.status === 202) {
        if (retries === 0) {
          setFeedback({
            score: 0,
            feedback: 'Evaluating your answer... This usually takes 5-15 seconds.',
            strengths: [],
            improvements: []
          })
        }
        setTimeout(() => {
          pollForFeedback(questionId, retries + 1)
        }, 1000)
      } else {
        console.error('Failed to get feedback:', error)
        // Don't stop polling on other errors, just log them
        if (retries < maxRetries) {
          setTimeout(() => {
            pollForFeedback(questionId, retries + 1)
          }, 2000) // Wait 2 seconds on error
        }
      }
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

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 flex items-center justify-center relative">
        <AIBackground />
        <div className="relative z-10 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-200">Session not found</p>
        </div>
      </div>
    )
  }

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
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 capitalize">{session.type} Interview</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Question {session.questions ? session.questions.findIndex(q => q.id === currentQuestion?.id) + 1 : 1} 
            {session.questions ? ` of ${session.questions.length}` : ''}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Text-to-Speech Controls */}
          {isTTSSupported && currentQuestion && (
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setAutoReadEnabled(!autoReadEnabled)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  autoReadEnabled
                    ? 'bg-[#E35336] text-white'
                    : 'text-gray-600 hover:bg-[#F5F5DC]'
                }`}
                title={autoReadEnabled ? 'Auto-read enabled' : 'Auto-read disabled'}
              >
                {autoReadEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {isSpeaking && (
                <>
                  {isPaused ? (
                    <button
                      onClick={resumeSpeaking}
                      className="px-2 py-1.5 text-primary-600 hover:bg-gray-200 rounded"
                      title="Resume reading"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={pauseSpeaking}
                      className="px-2 py-1.5 text-primary-600 hover:bg-gray-200 rounded"
                      title="Pause reading"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={stopSpeaking}
                    className="px-2 py-1.5 text-red-600 hover:bg-gray-200 rounded"
                    title="Stop reading"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                </>
              )}
              {!isSpeaking && !autoReadEnabled && (
                <button
                  onClick={() => {
                    const questionText = currentQuestion.question_text || currentQuestion.text || ''
                    if (questionText) speakText(questionText)
                  }}
                  className="px-2 py-1.5 text-primary-600 hover:bg-gray-200 rounded"
                  title="Read question aloud"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          <div className="flex items-center space-x-2 text-[#E35336]">
            <Clock className="w-5 h-5" />
            <span className="font-medium">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Section */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-[#E35336]/10 text-[#E35336] rounded-full text-sm font-medium mb-3">
                {currentQuestion?.question_type || session?.type || 'Question'}
              </span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Question
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                  {currentQuestion?.question_text || currentQuestion?.text || 'Loading question...'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Answer Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Your Answer</h3>
              {/* Always show voice mode toggle for non-technical questions */}
              {currentQuestion?.question_type !== 'technical' && session?.type !== 'technical' && (
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setInputMode('text')}
                    className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                      inputMode === 'text'
                        ? 'bg-white text-[#E35336] shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span className="text-sm">Text</span>
                  </button>
                  <button
                    onClick={() => setInputMode('voice')}
                    className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                      inputMode === 'voice'
                        ? 'bg-white text-[#E35336] shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
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
                <VoiceRecorder
                  onTranscript={(transcript) => setAnswer(transcript)}
                  onError={(error) => {
                    console.error('Voice recording error:', error)
                    alert(error || 'Voice recording error. Please try again.')
                  }}
                />
                {answer && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Transcribed Answer (you can edit this)
                    </label>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Your transcribed answer will appear here..."
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                    />
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
                
                {/* Voice Input Button - Always show, but handle unsupported browsers */}
                <div className="absolute right-3 top-3">
                  {isVoiceSupported ? (
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
                      className={`
                        w-10 h-10
                        flex items-center justify-center
                        rounded-full
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                        ${
                          isVoiceListening
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
                            : 'bg-[#E35336]/10 hover:bg-[#E35336]/20 text-[#E35336] hover:text-[#A0522D]'
                        }
                      `}
                      title={isVoiceListening ? 'Stop listening (click to stop)' : 'Start voice input (click to speak)'}
                    >
                      {isVoiceListening ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <Mic className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </motion.button>
                  ) : (
                    <div 
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
                      title="Voice input not supported in this browser. Please use Chrome, Edge, or Safari."
                    >
                      <Mic className="w-5 h-5" />
                    </div>
                  )}
                  
                  {/* Listening indicator dot */}
                  {isVoiceListening && isVoiceSupported && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full z-10"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-full h-full bg-red-500 rounded-full"
                      />
                    </motion.div>
                  )}
                </div>
                
                {/* Listening Status */}
                <AnimatePresence>
                  {isVoiceListening && isVoiceSupported && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute -bottom-8 left-0 flex items-center space-x-2 text-sm text-[#E35336] font-medium bg-white px-3 py-1 rounded-lg shadow-sm"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 bg-red-500 rounded-full"
                      />
                      <span>Listening... Speak now</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Error Message */}
                <AnimatePresence>
                  {voiceError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute -bottom-16 left-0 right-0 mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start space-x-2 z-10 shadow-lg"
                    >
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold mb-1">Microphone Access Required</p>
                        <p className="text-red-600 text-xs">{voiceError}</p>
                        {voiceError.includes('permission denied') && (
                          <div className="mt-2 text-xs text-red-600">
                            <p className="font-medium mb-1">How to enable microphone access:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>Click the lock icon 🔒 in your browser's address bar</li>
                              <li>Find "Microphone" in the permissions list</li>
                              <li>Change it to "Allow"</li>
                              <li>Refresh the page and try again</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Feedback Section */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {feedback || submitting ? (
              <FeedbackCard 
                feedback={feedback} 
                questionId={currentQuestion?.id}
                sessionId={sessionId}
                originalAnswer={answer}
                onAnswerImproved={(improvedAnswer) => {
                  setAnswer(improvedAnswer)
                }}
              />
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

