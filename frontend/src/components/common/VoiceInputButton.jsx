import { motion } from 'framer-motion'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { useSpeechToText } from '../../hooks/useSpeechToText'

/**
 * Voice Input Button Component
 * A microphone button that can be placed next to text inputs for speech-to-text
 * 
 * @param {Object} props
 * @param {Function} props.onTranscript - Callback when transcript is updated (receives transcript string)
 * @param {Function} props.onError - Optional error callback
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Button size: 'sm', 'md', 'lg' (default: 'md')
 */
export default function VoiceInputButton({ 
  onTranscript, 
  onError,
  className = '',
  size = 'md'
}) {
  const {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
  } = useSpeechToText({
    onTranscript: (newTranscript) => {
      if (onTranscript) {
        onTranscript(newTranscript)
      }
    },
    onError: (errorMsg) => {
      if (onError) {
        onError(errorMsg)
      }
    },
  })

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  if (!isSupported) {
    return null // Don't show button if not supported
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        type="button"
        onClick={handleToggle}
        disabled={!isSupported}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          rounded-full
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-primary-600'
          }
        `}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <MicOff className={iconSizes[size]} />
          </motion.div>
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </motion.button>

      {/* Listening indicator */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-full h-full bg-red-500 rounded-full"
          />
        </motion.div>
      )}
    </div>
  )
}


