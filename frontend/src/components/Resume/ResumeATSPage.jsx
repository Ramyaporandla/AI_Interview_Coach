import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Search, 
  TrendingUp,
  Target,
  FileCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { resumeService } from '../../services/api'
import AIBackground from '../common/AIBackground'
import GlassCard from '../common/GlassCard'

export default function ResumeATSPage() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedResume, setUploadedResume] = useState(null)
  const [jdText, setJdText] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [atsResult, setAtsResult] = useState(null)
  const [jdMatchResult, setJdMatchResult] = useState(null)
  const [interviewQuestions, setInterviewQuestions] = useState(null)
  const [loadingATS, setLoadingATS] = useState(false)
  const [loadingJD, setLoadingJD] = useState(false)
  const [loadingInterview, setLoadingInterview] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()

  const handleFileSelect = (selectedFile) => {
    setError('')
    
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or DOCX file only.')
      return
    }
    
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
      // Clear previous results
      setAtsResult(null)
      setJdMatchResult(null)
      setInterviewQuestions(null)
    } catch (err) {
      console.error('Upload error:', err)
      let errorMessage = 'Failed to upload resume. Please try again.'
      
      // Handle validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.map(e => e.msg || e.message).join(', ')
      }
      // Handle standard error messages
      else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
      // Handle network errors
      else if (err.isNetworkError || err.code === 'ERR_NETWORK') {
        errorMessage = err.message || 'Unable to connect to server. Please ensure the backend is running on http://localhost:5001'
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

  const handleATSScan = async () => {
    if (!uploadedResume?.resumeId) {
      setError('Please upload a resume first.')
      return
    }

    if (!jdText.trim()) {
      setError('Please paste a job description to get ATS score with keyword matching.')
      return
    }

    setLoadingATS(true)
    setError('')

    try {
      const result = await resumeService.scanATS(
        uploadedResume.resumeId,
        jdText.trim(),
        jobTitle.trim() || null,
        company.trim() || null
      )
      setAtsResult(result)
    } catch (err) {
      console.error('ATS scan error:', err)
      let errorMessage = 'Failed to run ATS scan.'
      
      // Handle validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.map(e => e.msg || e.message).join(', ')
      }
      // Handle standard error messages
      else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      // Handle network errors
      else if (err.isNetworkError || err.code === 'ERR_NETWORK') {
        errorMessage = err.message || 'Unable to connect to server. Please ensure the backend is running on http://localhost:5001'
      }
      // Handle other errors
      else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoadingATS(false)
    }
  }

  const handleJDMatch = async () => {
    if (!uploadedResume?.resumeId) {
      setError('Please upload a resume first.')
      return
    }

    if (!jdText.trim()) {
      setError('Please paste a job description.')
      return
    }

    setLoadingJD(true)
    setError('')

    try {
      const result = await resumeService.matchJD({
        resumeId: uploadedResume.resumeId,
        jdText: jdText.trim(),
        jobTitle: jobTitle.trim() || null,
        company: company.trim() || null,
      })
      setJdMatchResult(result)
    } catch (err) {
      console.error('JD match error:', err)
      let errorMessage = 'Failed to match job description.'
      
      // Handle validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.map(e => e.msg || e.message).join(', ')
      }
      // Handle standard error messages
      else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      // Handle network errors
      else if (err.isNetworkError || err.code === 'ERR_NETWORK') {
        errorMessage = err.message || 'Unable to connect to server. Please ensure the backend is running on http://localhost:5001'
      }
      // Handle other errors
      else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoadingJD(false)
    }
  }

  const handleGenerateInterview = async () => {
    if (!uploadedResume?.resumeId) {
      setError('Please upload a resume first.')
      return
    }

    setLoadingInterview(true)
    setError('')

    try {
      const result = await resumeService.generateInterviewQuestions({
        resumeId: uploadedResume.resumeId,
        jdText: jdText.trim() || null,
        role: 'software-engineer', // Default, can be made configurable
        difficulty: 'medium', // Default, can be made configurable
      })
      setInterviewQuestions(result)
    } catch (err) {
      console.error('Interview generation error:', err)
      setError(err.response?.data?.error || 'Failed to generate interview questions.')
    } finally {
      setLoadingInterview(false)
    }
  }

  const handleStartInterview = () => {
    if (interviewQuestions?.questions) {
      // Navigate to interview page with questions
      navigate('/interview-from-resume', { 
        state: { 
          questions: interviewQuestions.questions,
          sessionConfig: interviewQuestions.sessionConfig,
          resumeId: uploadedResume.resumeId
        } 
      })
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600 dark:text-success-400'
    if (score >= 60) return 'text-yellow-500 dark:text-yellow-400'
    return 'text-error-600 dark:text-error-400'
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-success-50 dark:bg-success-900/20 border-2 border-success-200 dark:border-success-800'
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800'
    return 'bg-error-50 dark:bg-error-900/20 border-2 border-error-200 dark:border-error-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 pt-3 sm:pt-5 md:pt-6 pb-12 px-4 sm:px-6 lg:px-8 relative">
      <AIBackground />
      <div className="relative z-10">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-7 sm:mb-8 md:mb-9"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] dark:text-gray-50 mb-3">
            Resume Analyzer & <span className="text-[#E35336]">ATS Scan</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload your resume, analyze ATS compatibility, match with job descriptions, and generate personalized interview questions
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-error-50 dark:bg-error-900/20 border-2 border-error-200 dark:border-error-800 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 mr-3 flex-shrink-0" />
              <p className="text-error-700 dark:text-error-300 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
            {/* Resume Upload */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <h2 className="text-2xl font-semibold text-[#1F2937] dark:text-gray-100 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-[#E35336]" />
                Upload Resume
              </h2>

              {uploadedResume ? (
                <div className="space-y-4">
                  <div className="bg-success-50 dark:bg-success-900/20 border-2 border-success-200 dark:border-success-800 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400 mt-1 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-success-900 dark:text-success-100">
                          {uploadedResume.fileName}
                        </p>
                        <p className="text-sm text-success-700 dark:text-success-300 mt-1">
                          Resume uploaded successfully
                        </p>
                        {uploadedResume.extractedTextPreview && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2 italic">
                            Preview: {uploadedResume.extractedTextPreview}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedResume(null)
                      setFile(null)
                      setAtsResult(null)
                      setJdMatchResult(null)
                      setInterviewQuestions(null)
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Upload Different Resume
                  </button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive
                      ? 'border-[#E35336] dark:border-[#E35336] bg-[#E35336]/5 dark:bg-[#E35336]/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#E35336]/40 dark:hover:border-[#E35336]'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-4">
                      <FileText className="w-12 h-12 text-[#E35336] dark:text-[#E35336] mx-auto" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{file.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => setFile(null)}
                          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          Remove
                        </button>
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="px-6 py-2 bg-[#E35336] text-white rounded-lg hover:bg-[#A0522D] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                        >
                          {uploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Upload
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
                        Supported: PDF, DOC, DOCX (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Job Description Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Target className="w-6 h-6 mr-2" />
                Job Description
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Job Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Software Engineer"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., Google"
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Paste Job Description
                  </label>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={8}
                    className="input-field"
                  />
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            {uploadedResume && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Analyze & Generate
                </h3>
                
                {/* Primary ATS Score Button - Prominent */}
                <div className="mb-6">
                  <button
                    onClick={handleATSScan}
                    disabled={loadingATS || !jdText.trim()}
                    className="w-full px-6 py-4 bg-[#E35336] text-white rounded-xl hover:bg-[#A0522D] transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                    title={!jdText.trim() ? 'Please paste a job description first' : 'Get ATS Score'}
                  >
                    {loadingATS ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5" />
                        Get ATS Score
                      </>
                    )}
                  </button>
                  {!jdText.trim() && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center font-medium">
                      Paste a job description above to enable ATS scoring
                    </p>
                  )}
                </div>

                {/* Secondary Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <button
                    onClick={handleJDMatch}
                    disabled={loadingJD || !jdText.trim()}
                    className="px-4 py-3 bg-[#F4A460] text-white rounded-lg hover:bg-[#e8914a] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {loadingJD ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Matching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        JD Match
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleGenerateInterview}
                    disabled={loadingInterview}
                    className="px-4 py-3 bg-gradient-to-r from-success-600 to-success-700 dark:from-success-500 dark:to-success-600 text-white rounded-lg hover:from-success-700 hover:to-success-800 dark:hover:from-success-600 dark:hover:to-success-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {loadingInterview ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Questions
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          {/* Results Section */}
            {/* ATS Score Results */}
            <AnimatePresence>
              {atsResult && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-[#1F2937] dark:text-gray-100 flex items-center">
                      <TrendingUp className="w-6 h-6 mr-2 text-[#E35336]" />
                      ATS Score
                    </h2>
                    <div className={`text-4xl font-bold ${getScoreColor(atsResult.atsScore)}`}>
                      {atsResult.atsScore}/100
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 mb-4 border-2 ${getScoreBgColor(atsResult.atsScore)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Overall ATS Compatibility
                      </span>
                      <span className={`text-2xl font-bold ${getScoreColor(atsResult.atsScore)}`}>
                        {atsResult.atsScore}%
                      </span>
                    </div>
                  </div>

                  {/* Ready/Not Ready Status */}
                  {atsResult.readyStatus && atsResult.readyMessage && (
                    <div className={`rounded-xl p-5 mb-4 border-2 shadow-sm ${
                      atsResult.readyStatus === 'ready' 
                        ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
                        : atsResult.readyStatus === 'almost-ready'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800'
                    }`}>
                      <div className="flex items-start">
                        {atsResult.readyStatus === 'ready' ? (
                          <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400 mt-0.5 mr-3 flex-shrink-0" />
                        ) : atsResult.readyStatus === 'almost-ready' ? (
                          <AlertCircle className="w-6 h-6 text-yellow-500 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-error-600 dark:text-error-400 mt-0.5 mr-3 flex-shrink-0" />
                        )}
                        <div>
                          <h3 className={`font-bold text-lg mb-1 ${
                            atsResult.readyStatus === 'ready'
                              ? 'text-success-900 dark:text-success-100'
                              : atsResult.readyStatus === 'almost-ready'
                              ? 'text-yellow-900 dark:text-yellow-100'
                              : 'text-error-900 dark:text-error-100'
                          }`}>
                            {atsResult.readyStatus === 'ready' ? '✓ Ready to Apply' : 
                             atsResult.readyStatus === 'almost-ready' ? '⚠ Almost Ready' : 
                             '✗ Not Ready'}
                          </h3>
                          <p className={`text-sm font-medium ${
                            atsResult.readyStatus === 'ready'
                              ? 'text-success-700 dark:text-success-300'
                              : atsResult.readyStatus === 'almost-ready'
                              ? 'text-yellow-700 dark:text-yellow-300'
                              : 'text-error-700 dark:text-error-300'
                          }`}>
                            {atsResult.readyMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Missing Keywords */}
                  {atsResult.missingKeywords && atsResult.missingKeywords.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-error-700 dark:text-error-400 mb-3 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Missing Keywords ({atsResult.missingKeywords.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {atsResult.missingKeywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-300 rounded-lg text-xs font-medium border border-error-200 dark:border-error-800"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 font-medium">
                        Add these keywords from the job description to improve your match score.
                      </p>
                    </div>
                  )}

                  {/* Improvements */}
                  {atsResult.improvements && atsResult.improvements.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Improvements
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {atsResult.improvements.map((improvement, idx) => (
                          <li key={idx}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths */}
                  {atsResult.strengths && atsResult.strengths.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400 mr-2" />
                        Strengths
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {atsResult.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Critical Fixes */}
                  {atsResult.criticalFixes && atsResult.criticalFixes.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-error-700 dark:text-error-400 mb-3 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Critical Fixes
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-sm text-error-700 dark:text-error-300 font-medium">
                        {atsResult.criticalFixes.map((fix, idx) => (
                          <li key={idx}>{fix}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {atsResult.suggestions && atsResult.suggestions.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Suggestions
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {atsResult.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Detected Sections */}
                  {atsResult.detectedSections && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Detected Sections
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(atsResult.detectedSections).map(([section, found]) => (
                          <span
                            key={section}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              found
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {section.charAt(0).toUpperCase() + section.slice(1)} {found ? '✓' : '✗'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risks */}
                  {atsResult.risks && Object.keys(atsResult.risks).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                        Risks
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                        {Object.values(atsResult.risks).map((risk, idx) => (
                          <li key={idx}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* JD Match Results */}
            <AnimatePresence>
              {jdMatchResult && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-[#1F2937] dark:text-gray-100 flex items-center">
                      <Target className="w-6 h-6 mr-2 text-[#E35336]" />
                      JD Match Score
                    </h2>
                    <div className={`text-4xl font-bold ${getScoreColor(jdMatchResult.matchScore)}`}>
                      {jdMatchResult.matchScore}/100
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 mb-4 border-2 ${getScoreBgColor(jdMatchResult.matchScore)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Resume ↔ Job Description Match
                      </span>
                      <span className={`text-2xl font-bold ${getScoreColor(jdMatchResult.matchScore)}`}>
                        {jdMatchResult.matchScore}%
                      </span>
                    </div>
                  </div>

                  {/* Matched Keywords */}
                  {jdMatchResult.matchedKeywords && jdMatchResult.matchedKeywords.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                        Matched Keywords ({jdMatchResult.matchedKeywords.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {jdMatchResult.matchedKeywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Keywords */}
                  {jdMatchResult.missingKeywords && jdMatchResult.missingKeywords.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                        Missing Keywords ({jdMatchResult.missingKeywords.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {jdMatchResult.missingKeywords.slice(0, 15).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Edits */}
                  {jdMatchResult.recommendedEdits && jdMatchResult.recommendedEdits.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Recommended Edits
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {jdMatchResult.recommendedEdits.map((edit, idx) => (
                          <li key={idx}>{edit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tailored Summary */}
                  {jdMatchResult.tailoredSummary && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Tailored Summary Suggestion
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {jdMatchResult.tailoredSummary}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interview Questions Results */}
            <AnimatePresence>
              {interviewQuestions && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <Sparkles className="w-6 h-6 mr-2" />
                      Interview Questions
                    </h2>
                    <button
                      onClick={handleStartInterview}
                      className="px-4 py-2 bg-[#E35336] text-white rounded-lg hover:bg-[#A0522D] transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Start Interview
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {interviewQuestions.questions && interviewQuestions.questions.map((question, idx) => (
                      <div
                        key={question.id || idx}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium px-2 py-1 rounded bg-[#E35336]/10 dark:bg-[#E35336]/20 text-[#E35336] dark:text-[#E35336]">
                            {question.category || 'General'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Q{idx + 1}
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-gray-100 mb-2">
                          {question.text}
                        </p>
                        {question.rationale && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            {question.rationale}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>
      </div>
    </div>
  )
}

