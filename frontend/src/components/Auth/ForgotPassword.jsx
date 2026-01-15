import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authService } from '../../services/api'
import { Mail, CheckCircle } from 'lucide-react'
import AIBackground from '../common/AIBackground'
import GlassCard from '../common/GlassCard'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      await authService.forgotPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-0 pb-12 px-4 sm:px-6 lg:px-8 relative">
      <AIBackground />
      <div className="relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <GlassCard hover={false} className="p-8 space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Check your email
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              If an account exists with <strong className="text-gray-900 dark:text-gray-100">{email}</strong>, we've sent a password reset link.
            </p>
            <Link
              to="/login"
              className="text-[#E35336] hover:text-[#A0522D] font-medium"
            >
              Back to login
            </Link>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field mt-1 pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#E35336] text-white rounded-lg font-semibold hover:bg-[#A0522D] hover:shadow-xl hover:shadow-[#E35336]/50 transition-all duration-[250ms] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E35336]/30"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-[#E35336] hover:text-[#A0522D] transition-colors"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
        </GlassCard>
      </motion.div>
      </div>
    </div>
  )
}

