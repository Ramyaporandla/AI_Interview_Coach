import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, Component } from 'react'
import Navbar from './components/common/Navbar'
import Landing from './components/Home/Landing'
import Dashboard from './components/Dashboard/Dashboard'
import InterviewSession from './components/Interview/InterviewSession'
import MockInterviewSetup from './components/Interview/MockInterviewSetup'
import MockInterviewSession from './components/Interview/MockInterviewSession'
import QuestionBank from './components/QuestionBank/QuestionBank'
import ResumeUpload from './components/Resume/ResumeUpload'
import ResumeATSPage from './components/Resume/ResumeATSPage'
import InterviewFromResumePage from './components/Resume/InterviewFromResumePage'
import SkillAssessment from './components/SkillAssessment/SkillAssessment'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import ForgotPassword from './components/Auth/ForgotPassword'
import ResetPassword from './components/Auth/ResetPassword'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { interviewService } from './services/api'
import { useNavigate } from 'react-router-dom'
import MandalaBackground from './components/common/MandalaBackground'
import AIBackground from './components/common/AIBackground'
import './App.css'
import GlobalChatAssistant from "./components/Chat/GlobalChatAssistant"


// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600">Error Details</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 relative">
        <AIBackground />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400/30 border-t-cyan-500"></div>
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl animate-pulse"></div>
        </div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" replace />
}

function MockInterviewSetupWrapper() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleStart = async (config) => {
    setLoading(true)
    try {
      const response = await interviewService.startInterview(config)
      const sessionId = response.session?.id || response.id
      if (sessionId) {
        navigate(`/mock-interview/${sessionId}`)
      } else {
        alert('Failed to start mock interview. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to start mock interview:', error)
      alert(error.response?.data?.message || 'Failed to start mock interview. Please try again.')
      setLoading(false)
    }
  }

  return <MockInterviewSetup onStart={handleStart} loading={loading} />
}

function AppRoutes() {
  const { user } = useAuth()
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/skill-assessment" element={<SkillAssessment />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/:sessionId"
        element={
          <ProtectedRoute>
            <InterviewSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mock-interview"
        element={
          <ProtectedRoute>
            <MockInterviewSetupWrapper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mock-interview/:sessionId"
        element={
          <ProtectedRoute>
            <MockInterviewSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/question-bank"
        element={
          <ProtectedRoute>
            <QuestionBank />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume-upload"
        element={
          <ProtectedRoute>
            <ResumeUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume-ats"
        element={
          <ProtectedRoute>
            <ResumeATSPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview-from-resume"
        element={
          <ProtectedRoute>
            <InterviewFromResumePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 relative">
              {/* Global AI Animated Background */}
              <AIBackground />
              
              {/* Global Mandala Background */}
              <MandalaBackground />
              
              <Navbar />
            <main className="relative z-10">
              <AppRoutes />
            </main>
            <GlobalChatAssistant />

          </div>
        </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App

