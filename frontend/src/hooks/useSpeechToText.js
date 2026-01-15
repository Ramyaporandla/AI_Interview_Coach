import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for speech-to-text using Web Speech API
 * @param {Object} options - Configuration options
 * @param {Function} options.onTranscript - Callback when transcript is updated
 * @param {Function} options.onError - Callback when error occurs
 * @param {string} options.lang - Language code (default: 'en-US')
 * @param {boolean} options.continuous - Whether to continuously listen (default: true)
 * @param {boolean} options.interimResults - Whether to return interim results (default: true)
 * @returns {Object} - { isListening, isSupported, startListening, stopListening, transcript, error }
 */
export function useSpeechToText({
  onTranscript,
  onError,
  lang = 'en-US',
  continuous = true,
  interimResults = true,
} = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const isListeningRef = useRef(false)

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.lang = lang

      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        // Update final transcript
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript
          const newTranscript = finalTranscriptRef.current + interimTranscript
          setTranscript(newTranscript)
          if (onTranscript) {
            onTranscript(newTranscript)
          }
        } else if (interimTranscript) {
          // Show interim results
          const newTranscript = finalTranscriptRef.current + interimTranscript
          setTranscript(newTranscript)
          if (onTranscript) {
            onTranscript(newTranscript)
          }
        }
      }

      recognition.onerror = (event) => {
        let errorMessage = 'Speech recognition error occurred'
        
        switch (event.error) {
          case 'no-speech':
            // This is normal, don't treat as error
            return
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone connection.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.'
            break
          case 'aborted':
            // User stopped, don't treat as error
            return
          default:
            errorMessage = `Speech recognition error: ${event.error}`
        }
        
        setError(errorMessage)
        setIsListening(false)
        if (onError) {
          onError(errorMessage)
        }
      }

      recognition.onend = () => {
        // If we're still supposed to be listening, restart
        if (isListeningRef.current && recognitionRef.current) {
          // Small delay to avoid immediate restart issues
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start()
              } catch (e) {
                // Recognition already started or error - stop listening
                isListeningRef.current = false
                setIsListening(false)
              }
            }
          }, 100)
        }
      }

      recognition.onstart = () => {
        setError(null)
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
      const errorMsg = 'Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.'
      setError(errorMsg)
      if (onError) {
        onError(errorMsg)
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [lang, continuous, interimResults, onTranscript, onError])

  // Handle listening state changes
  useEffect(() => {
    if (!recognitionRef.current) return

    isListeningRef.current = isListening

    if (isListening) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        // Already started or error
        isListeningRef.current = false
        setIsListening(false)
      }
    } else {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Already stopped or error
      }
    }
  }, [isListening])

  const startListening = useCallback(async () => {
    if (!isSupported) {
      const errorMsg = 'Speech recognition is not supported in your browser.'
      setError(errorMsg)
      if (onError) {
        onError(errorMsg)
      }
      return
    }
    
    // Request microphone permission first
    try {
      // Request microphone access - this will trigger the browser permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop())
      
      // Preserve current transcript when starting
      finalTranscriptRef.current = transcript || ''
      setIsListening(true)
      setError(null)
    } catch (permissionError) {
      let errorMessage = 'Microphone permission denied.'
      
      if (permissionError.name === 'NotAllowedError' || permissionError.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings and try again.'
      } else if (permissionError.name === 'NotFoundError' || permissionError.name === 'DevicesNotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.'
      } else if (permissionError.name === 'NotReadableError' || permissionError.name === 'TrackStartError') {
        errorMessage = 'Microphone is being used by another application. Please close other apps using the microphone.'
      } else {
        errorMessage = `Failed to access microphone: ${permissionError.message}`
      }
      
      setError(errorMessage)
      setIsListening(false)
      if (onError) {
        onError(errorMessage)
      }
    }
  }, [isSupported, transcript, onError])

  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = ''
    setTranscript('')
    if (onTranscript) {
      onTranscript('')
    }
  }, [onTranscript])

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}

