import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Code, Users, Database, Briefcase, BarChart3, Palette, Shield, Target, MessageSquare, Brain } from 'lucide-react'
import AIBackground from '../common/AIBackground'
import GlassCard from '../common/GlassCard'

const roles = [
  { id: 'software-engineer', name: 'Software Engineer', icon: Code },
  { id: 'data-scientist', name: 'Data Scientist', icon: BarChart3 },
  { id: 'product-manager', name: 'Product Manager', icon: Briefcase },
  { id: 'designer', name: 'UX/UI Designer', icon: Palette },
  { id: 'data-engineer', name: 'Data Engineer', icon: Database },
  { id: 'security-engineer', name: 'Security Engineer', icon: Shield },
  { id: 'marketing', name: 'Marketing Professional', icon: MessageSquare },
  { id: 'sales', name: 'Sales Professional', icon: Target },
  { id: 'hr', name: 'HR Professional', icon: Users },
]

const interviewTypes = [
  { id: 'technical', name: 'Technical', description: 'Coding challenges and algorithms' },
  { id: 'behavioral', name: 'Behavioral', description: 'STAR method and soft skills' },
  { id: 'system-design', name: 'System Design', description: 'Architecture and scalability' },
]

const difficulties = [
  { id: 'easy', name: 'Easy', description: 'Junior level' },
  { id: 'medium', name: 'Medium', description: 'Mid-level' },
  { id: 'hard', name: 'Hard', description: 'Senior level' },
]

const durations = [
  { id: 30, name: '30 minutes', questionCount: 5 },
  { id: 45, name: '45 minutes', questionCount: 7 },
  { id: 60, name: '60 minutes', questionCount: 10 },
]

export default function MockInterviewSetup({ onStart, loading = false }) {
  const [selectedRole, setSelectedRole] = useState('software-engineer')
  const [selectedType, setSelectedType] = useState('behavioral')
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [selectedDuration, setSelectedDuration] = useState(45)

  const handleStart = () => {
    const config = {
      role: selectedRole,
      type: selectedType,
      difficulty: selectedDifficulty,
      duration: selectedDuration,
      mode: 'mock', // Indicate this is a mock interview
    }
    onStart(config)
  }

  const selectedDurationObj = durations.find(d => d.id === selectedDuration)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 relative">
      <AIBackground />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Animated Brain - Large and Prominent */}
          <div className="flex justify-center mb-8 relative z-20">
            <motion.div
              className="relative"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              {/* Outer glow rings - very visible */}
              <motion.div
                className="absolute rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: "radial-gradient(circle, rgba(6, 182, 212, 0.7), rgba(6, 182, 212, 0.3) 40%, transparent 70%)",
                  width: "180px",
                  height: "180px",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1,
                }}
              />
              <motion.div
                className="absolute rounded-full"
                animate={{
                  scale: [1, 1.7, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
                style={{
                  background: "radial-gradient(circle, rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.3) 40%, transparent 70%)",
                  width: "180px",
                  height: "180px",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1,
                }}
              />
              
              {/* Brain icon container - larger and more visible */}
              <motion.div
                className="relative bg-gradient-to-br from-cyan-500/50 via-blue-500/50 to-indigo-500/50 dark:from-cyan-500/60 dark:via-blue-500/60 dark:to-indigo-500/60 rounded-full p-10 backdrop-blur-xl border-2 border-cyan-400/70 dark:border-cyan-500/80"
                animate={{
                  boxShadow: [
                    "0 0 40px rgba(6, 182, 212, 0.6), 0 0 80px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.2)",
                    "0 0 50px rgba(6, 182, 212, 0.8), 0 0 100px rgba(6, 182, 212, 0.5), inset 0 0 30px rgba(6, 182, 212, 0.3)",
                    "0 0 40px rgba(6, 182, 212, 0.6), 0 0 80px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.2)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  width: "160px",
                  height: "160px",
                  zIndex: 10,
                }}
              >
                <motion.div
                  className="flex items-center justify-center w-full h-full"
                  animate={{
                    rotate: [0, 12, -12, 0],
                    scale: [1, 1.12, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Brain 
                    className="w-24 h-24 text-cyan-600 dark:text-cyan-200" 
                    strokeWidth={3} 
                    fill="currentColor" 
                    fillOpacity={0.2}
                    style={{ filter: "drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))" }}
                  />
                </motion.div>
                
                {/* Thinking particles - larger and brighter */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 bg-cyan-400 dark:bg-cyan-300 rounded-full shadow-xl shadow-cyan-400/60"
                    style={{
                      top: "50%",
                      left: "50%",
                      zIndex: 5,
                    }}
                    animate={{
                      x: [
                        Math.cos((i * 60) * Math.PI / 180) * 55,
                        Math.cos((i * 60) * Math.PI / 180) * 75,
                        Math.cos((i * 60) * Math.PI / 180) * 55,
                      ],
                      y: [
                        Math.sin((i * 60) * Math.PI / 180) * 55,
                        Math.sin((i * 60) * Math.PI / 180) * 75,
                        Math.sin((i * 60) * Math.PI / 180) * 55,
                      ],
                      opacity: [0, 1, 1, 0],
                      scale: [0.5, 1.4, 1.2, 0.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-cyan-600 dark:from-gray-100 dark:via-blue-300 dark:to-cyan-400 bg-clip-text text-transparent mb-4">Start Mock Interview</h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Practice with AI-powered questions tailored to your role and experience level
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Your Role</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {roles.map((role) => {
                  const Icon = role.icon
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedRole === role.id
                          ? 'border-primary-600 bg-primary-50 shadow-md'
                          : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        selectedRole === role.id ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm font-medium ${
                        selectedRole === role.id ? 'text-primary-900' : 'text-gray-700'
                      }`}>
                        {role.name}
                      </p>
                    </button>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>

        {/* Interview Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviewTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedType === type.id
                      ? 'border-primary-600 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                  }`}
                >
                  <h3 className={`font-semibold mb-1 ${
                    selectedType === type.id ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {type.name}
                  </h3>
                  <p className={`text-sm ${
                    selectedType === type.id ? 'text-primary-700' : 'text-gray-600'
                  }`}>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Difficulty & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Difficulty Level</h2>
              <div className="space-y-3">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty.id}
                    onClick={() => setSelectedDifficulty(difficulty.id)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedDifficulty === difficulty.id
                        ? 'border-primary-600 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <span className={`font-medium ${
                      selectedDifficulty === difficulty.id ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {difficulty.name}
                    </span>
                    <span className={`text-sm ml-2 ${
                      selectedDifficulty === difficulty.id ? 'text-primary-700' : 'text-gray-600'
                    }`}>
                      - {difficulty.description}
                    </span>
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Duration</h2>
              <div className="space-y-3">
                {durations.map((duration) => (
                  <button
                    key={duration.id}
                    onClick={() => setSelectedDuration(duration.id)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedDuration === duration.id
                        ? 'border-primary-600 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <span className={`font-medium ${
                      selectedDuration === duration.id ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {duration.name}
                    </span>
                    <span className={`text-sm ml-2 block mt-1 ${
                      selectedDuration === duration.id ? 'text-primary-700' : 'text-gray-600'
                    }`}>
                      {duration.questionCount} questions
                    </span>
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={handleStart}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Mock Interview</span>
              </>
            )}
          </button>
          <p className="mt-4 text-sm text-gray-700">
            You'll answer {selectedDurationObj?.questionCount} questions in {selectedDurationObj?.name}
          </p>
        </motion.div>
        </div>
      </div>
    </div>
  )
}

