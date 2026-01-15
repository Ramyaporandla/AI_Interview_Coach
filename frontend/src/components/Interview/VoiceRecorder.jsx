import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Square, Play, Pause } from 'lucide-react'

export default function VoiceRecorder({ onTranscript, onError }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  useEffect(() => {
    // Check for Speech Recognition API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

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

        const newTranscript = finalTranscript || interimTranscript
        setTranscript(prev => {
          const updated = finalTranscript ? prev + finalTranscript : newTranscript
          if (onTranscript) {
            onTranscript(updated)
          }
          return updated
        })
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        if (onError) {
          onError(event.error)
        }
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          // These are recoverable errors, don't stop recording
          return
        }
        stopRecording()
      }

      recognition.onend = () => {
        if (isRecording && !isPaused) {
          // Restart recognition if it ended unexpectedly
          try {
            recognition.start()
          } catch (e) {
            console.error('Failed to restart recognition:', e)
          }
        }
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, []) // Only run once on mount

  // Separate effect to handle recording state changes
  useEffect(() => {
    if (!recognitionRef.current) return

    if (isRecording && !isPaused) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        // Already started or error
      }
    } else if (isPaused || !isRecording) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Already stopped or error
      }
    }
  }, [isRecording, isPaused])

  const startRecording = async () => {
    try {
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the stream immediately - we just needed permission for speech recognition
      stream.getTracks().forEach(track => track.stop())
      
      if (recognitionRef.current) {
        setTranscript('')
        setIsRecording(true)
        setIsPaused(false)
        // The useEffect will handle starting recognition
      } else {
        // Fallback: Use MediaRecorder API (not implemented for transcription)
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(mediaStream)
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
          // Note: This would need backend processing for transcription
          // For now, we'll just use the Speech Recognition API
          mediaStream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        mediaRecorderRef.current = mediaRecorder
        setIsRecording(true)
      }
    } catch (error) {
      console.error('Error starting recording:', error)
      let errorMessage = 'Failed to start recording. Please check microphone permissions.'
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings and try again.'
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.'
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Microphone is being used by another application. Please close other apps using the microphone.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      if (onError) {
        onError(errorMessage)
      }
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore errors
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    setIsPaused(false)
  }

  const pauseRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop()
        setIsPaused(true)
      } catch (e) {
        console.error('Error pausing recording:', e)
      }
    }
  }

  const resumeRecording = () => {
    if (recognitionRef.current && isPaused) {
      try {
        recognitionRef.current.start()
        setIsPaused(false)
      } catch (e) {
        console.error('Error resuming recording:', e)
      }
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    if (onTranscript) {
      onTranscript('')
    }
  }

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          Voice recording is not supported in your browser. Please use Chrome, Edge, or Safari for voice interview features.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Voice Answer</h3>
          {isRecording && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-600 font-medium">Recording</span>
            </motion.div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeRecording}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              )}
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Square className="w-5 h-5" />
                <span>Stop</span>
              </button>
            </>
          )}
          {transcript && (
            <button
              onClick={clearTranscript}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <p className="text-gray-700 whitespace-pre-wrap">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {isRecording && !transcript && (
        <div className="text-center py-8 text-gray-500">
          <Mic className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Speak your answer...</p>
        </div>
      )}
    </div>
  )
}

