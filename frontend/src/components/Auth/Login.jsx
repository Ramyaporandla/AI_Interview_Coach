import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import MandalaWatermark from '../common/MandalaWatermark'
import GlassCard from '../common/GlassCard'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      // Handle different error types
      let errorMessage = 'Login failed. Please try again.'
      
      if (err.isNetworkError || err.code === 'ERR_NETWORK') {
        errorMessage = err.message || 'Unable to connect to server. Please ensure the backend is running on http://localhost:5001'
      } else if (err.response?.data) {
        // Check for validation errors (array format)
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.map(e => e.msg || e.message).join(', ')
        }
        // Check for message field
        else if (err.response.data.message) {
          errorMessage = err.response.data.message
        }
        // Check for error field
        else if (err.response.data.error) {
          errorMessage = err.response.data.error
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-0 pb-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Mandala Watermarks */}
      <div className="absolute top-20 right-10 opacity-20">
        <MandalaWatermark position="top-right" size={200} opacity={0.05} />
      </div>
      <div className="absolute bottom-20 left-10 opacity-15">
        <MandalaWatermark position="bottom-left" size={180} opacity={0.04} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <GlassCard hover={false} className="p-8 space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-800 dark:text-gray-100">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-700 dark:text-gray-300">
            Or{' '}
            <Link to="/register" className="font-medium text-[#E35336] hover:text-[#A0522D] transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field mt-1"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#E35336] hover:text-[#A0522D] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field mt-1"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-[#E35336] text-white rounded-lg font-semibold hover:bg-[#A0522D] hover:shadow-xl hover:shadow-[#E35336]/50 transition-all duration-[250ms] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E35336]/30"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        </GlassCard>
      </motion.div>
    </div>
  )
}

