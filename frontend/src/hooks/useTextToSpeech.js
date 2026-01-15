import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for text-to-speech using Web Speech Synthesis API
 * @param {Object} options - Configuration options
 * @param {string} options.lang - Language code (default: 'en-US')
 * @param {number} options.rate - Speech rate (0.1 to 10, default: 1)
 * @param {number} options.pitch - Speech pitch (0 to 2, default: 1)
 * @param {number} options.volume - Speech volume (0 to 1, default: 1)
 * @param {string} options.voice - Voice name (optional)
 * @returns {Object} - { isSpeaking, isSupported, speak, stop, pause, resume, voices, error }
 */
export function useTextToSpeech({
  lang = 'en-US',
  rate = 1,
  pitch = 1,
  volume = 1,
  voice = null,
} = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState([])
  const [error, setError] = useState(null)
  
  const utteranceRef = useRef(null)
  const synthRef = useRef(null)

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true)
      synthRef.current = window.speechSynthesis

      // Load voices
      const loadVoices = () => {
        const availableVoices = synthRef.current.getVoices()
        setVoices(availableVoices)
      }

      // Chrome loads voices asynchronously
      if (synthRef.current.getVoices().length > 0) {
        loadVoices()
      }
      
      synthRef.current.onvoiceschanged = loadVoices

      // Cleanup
      return () => {
        if (synthRef.current) {
          synthRef.current.cancel()
        }
      }
    } else {
      setIsSupported(false)
      setError('Text-to-speech is not supported in your browser.')
    }
  }, [])

  // Handle speech events
  useEffect(() => {
    if (!utteranceRef.current) return

    const utterance = utteranceRef.current

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
      setError(null)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      utteranceRef.current = null
    }

    utterance.onerror = (event) => {
      setIsSpeaking(false)
      setIsPaused(false)
      setError(`Speech synthesis error: ${event.error}`)
      utteranceRef.current = null
    }

    utterance.onpause = () => {
      setIsPaused(true)
    }

    utterance.onresume = () => {
      setIsPaused(false)
    }
  }, [isSpeaking])

  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !synthRef.current) {
      setError('Text-to-speech is not supported')
      return
    }

    if (!text || typeof text !== 'string') {
      setError('Invalid text provided')
      return
    }

    // Stop any current speech
    if (synthRef.current.speaking) {
      synthRef.current.cancel()
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Set properties
    utterance.lang = options.lang || lang
    utterance.rate = options.rate !== undefined ? options.rate : rate
    utterance.pitch = options.pitch !== undefined ? options.pitch : pitch
    utterance.volume = options.volume !== undefined ? options.volume : volume

    // Set voice if specified
    if (options.voice || voice) {
      const selectedVoice = voices.find(
        v => v.name === (options.voice || voice)
      )
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    }

    utteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }, [isSupported, lang, rate, pitch, volume, voice, voices])

  const stop = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
      utteranceRef.current = null
    }
  }, [])

  const pause = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause()
      setIsPaused(true)
    }
  }, [])

  const resume = useCallback(() => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume()
      setIsPaused(false)
    }
  }, [])

  return {
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    error,
    speak,
    stop,
    pause,
    resume,
  }
}


