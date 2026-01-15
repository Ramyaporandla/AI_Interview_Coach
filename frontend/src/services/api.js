import axios from 'axios'

// Use environment variable or fallback to default
// Use '/api' to leverage Vite proxy, or direct URL if proxy not available
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle errors and rate limiting
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || ''
      const isAuthRequest = [
        '/auth/login',
        '/auth/register',
        '/auth/verify-email',
        '/auth/forgot-password',
        '/auth/reset-password',
      ].some((path) => requestUrl.includes(path))

      localStorage.removeItem('token')
      if (!isAuthRequest && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    // Handle 429 - Rate Limited
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60
      const errorMessage = `Too many requests. Please wait ${retryAfter} seconds before trying again.`
      
      // Show user-friendly error
      if (typeof window !== 'undefined') {
        alert(errorMessage)
      }
      
      return Promise.reject({
        ...error,
        message: errorMessage,
        retryAfter: parseInt(retryAfter)
      })
    }

    // Handle network errors (backend not reachable)
    if (!error.response && error.request) {
      const networkError = new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:5001')
      networkError.code = 'ERR_NETWORK'
      networkError.isNetworkError = true
      return Promise.reject(networkError)
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }).then(res => res.data),
  
  getCurrentUser: () =>
    api.get('/auth/me').then(res => res.data),
  
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }).then(res => res.data),
  
  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }).then(res => res.data),
}

export const interviewService = {
  startInterview: (config) =>
    api.post('/interviews/start', config).then(res => res.data),
  
  getInterview: (sessionId) =>
    api.get(`/interviews/${sessionId}`).then(res => res.data),
  
  submitAnswer: (sessionId, questionId, answer) =>
    api.post(`/interviews/${sessionId}/answer`, { questionId, answer }).then(res => res.data),
  
  getFeedback: (sessionId, questionId) =>
    api.get(`/interviews/${sessionId}/feedback`, { params: { questionId } }).then(res => res.data),
  
  completeInterview: (sessionId) =>
    api.post(`/interviews/${sessionId}/complete`).then(res => res.data),
  
  getUserInterviews: () =>
    api.get('/interviews').then(res => res.data),
}

export const analyticsService = {
  getDashboard: () =>
    api.get('/analytics/dashboard').then(res => res.data),
  
  getProgress: (days = 30) =>
    api.get(`/analytics/progress`, { params: { days } }).then(res => res.data),
  
  getSkillsRadar: () =>
    api.get('/analytics/skills').then(res => res.data),
  
  getSessionHistory: (limit = 50, offset = 0) =>
    api.get('/analytics/sessions', { params: { limit, offset } }).then(res => res.data),
}

// Create a separate axios instance for file uploads (multipart/form-data)
const apiFileUpload = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to file upload requests
apiFileUpload.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Don't set Content-Type for file uploads - let browser set it with boundary
    return config
  },
  (error) => Promise.reject(error)
)

// Handle errors for file uploads
apiFileUpload.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    // Handle network errors (backend not reachable)
    if (!error.response && error.request) {
      const networkError = new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:5001')
      networkError.code = 'ERR_NETWORK'
      networkError.isNetworkError = true
      return Promise.reject(networkError)
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

export const resumeService = {
  uploadResume: (formData) =>
    apiFileUpload.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data),
  
  generateFromResume: (resumeId, role, type, difficulty) =>
    api.post('/interview/generate-from-resume', { resumeId, role, type, difficulty }).then(res => res.data),
  
  getUserResumes: () =>
    api.get('/resume').then(res => res.data),
  
  scanATS: (resumeId, jdText, jobTitle, company) =>
    api.post('/resume/ats-scan', { resumeId, jdText, jobTitle, company }).then(res => res.data),
  
  matchJD: ({ resumeId, jdText, jobTitle, company }) =>
    api.post('/resume/jd-match', { resumeId, jdText, jobTitle, company }).then(res => res.data),
  
  generateInterviewQuestions: ({ resumeId, jdText, role, difficulty }) =>
    api.post('/resume/interview-questions', { resumeId, jdText, role, difficulty }).then(res => res.data),
}

export const questionService = {
  getQuestionBank: (filters = {}) => {
    const params = {};
    if (filters.role && filters.role !== 'all') params.role = filters.role;
    if (filters.type && filters.type !== 'all') params.type = filters.type;
    if (filters.difficulty && filters.difficulty !== 'all') params.difficulty = filters.difficulty;
    if (filters.company && filters.company !== 'all') params.company = filters.company;
    if (filters.limit) params.limit = filters.limit;
    if (filters.offset) params.offset = filters.offset;
    
    return api.get('/questions/bank', { params }).then(res => res.data);
  },
  
  getCategories: () =>
    api.get('/questions/categories').then(res => res.data),
  
  getQuestion: (id) =>
    api.get(`/questions/${id}`).then(res => res.data),
}

export const skillAssessmentService = {
  getAvailableRoles: () =>
    api.get('/skill-assessment/roles').then(res => res.data),
  
  getFAANGCompanies: () =>
    api.get('/skill-assessment/companies').then(res => res.data),
  
  getSkillDomains: (role) =>
    api.get(`/skill-assessment/domains/${role}`).then(res => res.data),
  
  startAssessment: (role, difficulty = 'medium', questionCount = 10, company = null) =>
    api.post('/skill-assessment/start', { role, difficulty, questionCount, company }).then(res => res.data),
  
  submitAnswer: (assessmentId, questionId, answer, questionData) =>
    api.post('/skill-assessment/answer', { 
      assessmentId, 
      questionId, 
      answer,
      questionText: questionData?.text,
      domain: questionData?.domain,
      difficulty: questionData?.difficulty,
      role: questionData?.role
    }).then(res => res.data),
  
  completeAssessment: (assessmentId, role, answers) =>
    api.post('/skill-assessment/complete', { assessmentId, role, answers }).then(res => res.data),
}

export default api

