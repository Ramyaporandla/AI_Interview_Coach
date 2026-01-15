import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
import { resumeService } from '../../services/api'
import MandalaWatermark from '../common/MandalaWatermark'
import AIBackground from '../common/AIBackground'
import GlassCard from '../common/GlassCard'

export default function ResumeUpload() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedResume, setUploadedResume] = useState(null)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()

  const handleFileSelect = (selectedFile) => {
    setError('')
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or DOCX file only.')
      return
    }
    
    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.')
      return
    }
    
    setFile(selectedFile)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await resumeService.uploadResume(formData)
      setUploadedResume(response)
      setFile(null)
    } catch (err) {
      console.error('Upload error:', err)
      let errorMessage = 'Failed to upload resume. Please try again.'
      
      // Handle network errors
      if (err.isNetworkError || err.code === 'ERR_NETWORK') {
        errorMessage = err.message || 'Unable to connect to server. Please ensure the backend is running on http://localhost:5001'
      }
      // Handle authentication errors
      else if (err.response?.status === 401) {
        errorMessage = 'You must be logged in to upload a resume. Please log in and try again.'
      }
      // Handle validation errors
      else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.map(e => e.msg || e.message).join(', ')
      }
      // Handle standard API errors
      else if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error
        }
      }
      // Handle other errors
      else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleGenerateQuestions = () => {
    if (uploadedResume?.resumeId) {
      navigate('/mock-interview', {
        state: { resumeId: uploadedResume.resumeId }
      })
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError('')
  }

  const getFileIcon = () => {
    if (!file) return null
    if (file.type === 'application/pdf') {
      return <FileText className="w-12 h-12 text-red-500" />
    }
    return <FileText className="w-12 h-12 text-[#E35336]" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 relative">
      <AIBackground />
      <div className="py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Mandala Watermarks */}
        <div className="absolute top-20 right-10 opacity-20">
          <MandalaWatermark position="top-right" size={200} opacity={0.05} />
        </div>
        <div className="absolute bottom-20 left-10 opacity-15">
          <MandalaWatermark position="bottom-left" size={180} opacity={0.04} />
        </div>
        
        <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Upload Your Resume
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload your resume to get personalized interview questions tailored to your experience
          </p>
        </motion.div>

        {/* Success Message */}
        {uploadedResume && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-6"
          >
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 mr-3" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  Resume Uploaded Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Your resume has been processed. You can now generate personalized interview questions based on your experience.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleGenerateQuestions}
                    className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-medium"
                  >
                    Generate Questions from Resume
                  </button>
                  <button
                    onClick={() => {
                      setUploadedResume(null)
                      setFile(null)
                    }}
                    className="px-6 py-2 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-2 border-green-600 dark:border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Upload Another Resume
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Upload Area */}
        {!uploadedResume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="p-12">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-gray-300 hover:border-cyan-400/40'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  {getFileIcon()}
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={handleRemoveFile}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      Remove
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-6 py-2 bg-[#E35336] dark:bg-[#E35336] text-white rounded-lg hover:bg-[#A0522D] dark:hover:bg-[#A0522D] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Resume
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Drag and drop your resume here
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      or click to browse
                    </p>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <span className="px-6 py-3 bg-[#E35336] dark:bg-[#E35336] text-white rounded-lg hover:bg-[#A0522D] dark:hover:bg-[#A0522D] transition-colors font-medium cursor-pointer inline-block">
                        Select File
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Supported formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>
              )}
            </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              How it works
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-cyan-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Upload your resume in PDF or DOCX format</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-cyan-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Our AI will extract and analyze your experience, skills, and background</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-cyan-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Generate personalized interview questions based on your resume</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-cyan-600 mr-3 mt-0.5 flex-shrink-0" />
                <span>Practice with questions tailored to your specific role and experience level</span>
              </li>
            </ul>
          </GlassCard>
        </motion.div>
      </div>
      </div>
    </div>
  )
}

