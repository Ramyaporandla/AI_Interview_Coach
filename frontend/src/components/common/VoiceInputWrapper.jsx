import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'
import VoiceInputButton from './VoiceInputButton'

/**
 * Voice Input Wrapper Component
 * Wraps a text input/textarea with voice input functionality
 * 
 * @param {Object} props
 * @param {React.ReactElement} props.children - The input element (should be a controlled component)
 * @param {string} props.value - Current value of the input
 * @param {Function} props.onChange - Callback when value changes
 * @param {string} props.className - Additional CSS classes for wrapper
 * @param {boolean} props.showError - Whether to show error messages (default: true)
 */
export default function VoiceInputWrapper({ 
  children, 
  value, 
  onChange, 
  className = '',
  showError = true 
}) {
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const [isListening, setIsListening] = useState(false)

  // Update parent value when transcript changes
  useEffect(() => {
    if (transcript && transcript !== value) {
      onChange(transcript)
    }
  }, [transcript, value, onChange])

  const handleTranscript = (newTranscript) => {
    setTranscript(newTranscript)
    setIsListening(true)
  }

  const handleError = (errorMsg) => {
    setError(errorMsg)
    setIsListening(false)
  }

  const handleStopListening = () => {
    setIsListening(false)
  }

  // Clone the child element to add voice button
  const inputWithVoice = children && React.cloneElement(children, {
    value: value,
    onChange: (e) => {
      setTranscript('') // Clear transcript when user types manually
      onChange(e.target.value)
    },
    className: `${children.props.className || ''} pr-12`, // Add padding for button
  })

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {inputWithVoice}
        
        {/* Voice Input Button */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <VoiceInputButton
            onTranscript={handleTranscript}
            onError={handleError}
            size="md"
          />
        </div>
      </div>

      {/* Listening Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-8 left-0 flex items-center space-x-2 text-sm text-primary-600"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 bg-red-500 rounded-full"
            />
            <span className="font-medium">Listening...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {showError && error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-8 left-0 right-0 mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start space-x-2"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

