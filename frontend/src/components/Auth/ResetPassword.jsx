import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authService } from '../../services/api'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'
import AIBackground from '../common/AIBackground'
import GlassCard from '../common/GlassCard'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await authService.resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-0 pb-12 px-4 sm:px-6 lg:px-8 relative">
        <AIBackground />
        <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <GlassCard hover={false} className="p-8 space-y-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
              Password Reset Successful
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
            Your password has been reset successfully. Redirecting to login...
          </p>
          <Link
            to="/login"
            className="text-[#E35336] hover:text-[#A0522D] font-medium transition-colors"
          >
              Go to login now
            </Link>
          </GlassCard>
        </motion.div>
        </div>
      </div>
    )
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
          <h2 className="text-center text-3xl font-extrabold text-gray-800 dark:text-gray-100">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-700 dark:text-gray-300">
            Enter your new password below.
          </p>
        </div>
        
        {!token ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Invalid reset link. Please request a new password reset.
            </p>
            <Link
              to="/forgot-password"
              className="text-[#E35336] hover:text-[#A0522D] font-medium transition-colors"
            >
              Request new reset link
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="input-field mt-1 pl-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 8 characters
                </p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="input-field mt-1 pl-10"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full px-4 py-3 bg-[#E35336] text-white rounded-lg font-semibold hover:bg-[#A0522D] hover:shadow-xl hover:shadow-[#E35336]/50 transition-all duration-[250ms] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E35336]/30"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
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

